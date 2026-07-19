import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Verdict } from './verdicts';
import type { Category } from '../add/StepCategory';

// Entries of the whole circle joined with their place, the author's name and
// - thanks to RLS - the private note only when the reader is its author
// (other people's notes simply come back empty, no client-side logic).

export interface EntryPlace {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  lat: number;
  lng: number;
}

export interface Entry {
  id: string;
  userId: string;
  category: Category;
  verdict: Verdict;
  wow: boolean;
  note: string;
  visitedOn: string;
  verdictChanged: boolean;
  photoPath: string | null;
  authorName: string;
  privateNote: string | null;
  place: EntryPlace;
  // Set only for entries still waiting in the offline outbox (SPEC §3.5):
  // the photo shows from a local object URL until the blob is uploaded.
  pending?: boolean;
  pendingPhotoUrl?: string | null;
}

interface RawEntry {
  id: string;
  user_id: string;
  category: Category;
  verdict: Verdict;
  wow: boolean;
  note: string;
  visited_on: string;
  verdict_changed: boolean;
  photo_path: string | null;
  place: EntryPlace | EntryPlace[] | null;
  author: { display_name: string } | { display_name: string }[] | null;
  private_note: { body: string } | { body: string }[] | null;
}

function one<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export async function fetchEntries(): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select(
      `id, user_id, category, verdict, wow, note, visited_on, verdict_changed, photo_path,
       place:places(id, name, city, country, lat, lng),
       author:profiles(display_name),
       private_note:private_notes(body)`,
    )
    .order('visited_on', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as unknown as RawEntry[];
  return rows.flatMap((row) => {
    const place = one(row.place);
    if (!place) return [];
    return [
      {
        id: row.id,
        userId: row.user_id,
        category: row.category,
        verdict: row.verdict,
        wow: row.wow,
        note: row.note,
        visitedOn: row.visited_on,
        verdictChanged: row.verdict_changed,
        photoPath: row.photo_path,
        authorName: one(row.author)?.display_name ?? '',
        privateNote: one(row.private_note)?.body ?? null,
        place,
      },
    ];
  });
}

// Editable fields of an entry (SPEC §3.1); RLS lets these calls touch only
// the author's own rows, so no ownership checks client-side. `photoPath` is
// optional: omit it to leave the photo untouched, pass a string to set it or
// null to clear it (the path itself is deterministic, so replacing a photo is
// a storage overwrite that leaves this value unchanged).
export interface EntryPatch {
  category: Category;
  verdict: Verdict;
  wow: boolean;
  note: string;
  visitedOn: string;
  verdictChanged: boolean;
  photoPath?: string | null;
}

export async function updateEntry(id: string, patch: EntryPatch): Promise<void> {
  const fields: Record<string, unknown> = {
    category: patch.category,
    verdict: patch.verdict,
    wow: patch.wow,
    note: patch.note,
    visited_on: patch.visitedOn,
    verdict_changed: patch.verdictChanged,
  };
  if ('photoPath' in patch) fields.photo_path = patch.photoPath;
  const { error } = await supabase.from('entries').update(fields).eq('id', id);
  if (error) throw error;
}

// Set or clear an entry's photo path on its own (used right after uploading a
// freshly stamped entry's photo).
export async function setEntryPhotoPath(id: string, photoPath: string | null): Promise<void> {
  const { error } = await supabase.from('entries').update({ photo_path: photoPath }).eq('id', id);
  if (error) throw error;
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from('entries').delete().eq('id', id);
  if (error) throw error;
}

// An empty body removes the note row; the author-only RLS policies on
// private_notes (D-20) are the actual guard, not this code.
export async function savePrivateNote(entryId: string, userId: string, body: string): Promise<void> {
  const trimmed = body.trim();
  if (trimmed) {
    const { error } = await supabase
      .from('private_notes')
      .upsert({ entry_id: entryId, user_id: userId, body: trimmed });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('private_notes').delete().eq('entry_id', entryId);
    if (error) throw error;
  }
}

// The last successful fetch is kept in localStorage so the map and journal
// open with content offline. Keyed per user: two accounts share a device
// during tests (D-21) and one must never see the other's private notes.
function cacheKey(userId: string): string {
  return `beback:entries:${userId}`;
}

function readCachedEntries(userId: string): Entry[] {
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    return raw ? (JSON.parse(raw) as Entry[]) : [];
  } catch {
    return [];
  }
}

export function useEntries(userId: string | null) {
  const [entries, setEntries] = useState<Entry[]>(() => (userId ? readCachedEntries(userId) : []));
  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const fresh = await fetchEntries();
      setEntries(fresh);
      try {
        localStorage.setItem(cacheKey(userId), JSON.stringify(fresh));
      } catch {
        // best-effort cache; a full localStorage must not break the fetch
      }
    } catch (err) {
      console.error('[beback] entries fetch failed:', err); // offline: cache stays
    }
  }, [userId]);
  useEffect(() => {
    if (userId) void refresh();
  }, [userId, refresh]);
  return { entries, refresh };
}

// One pin per place (D-27): entries keep their fetch order (newest first),
// so entries[0] decides the pin colour.
export interface PlaceGroup {
  place: EntryPlace;
  entries: Entry[];
}

export function groupByPlace(entries: Entry[]): PlaceGroup[] {
  const groups = new Map<string, PlaceGroup>();
  for (const entry of entries) {
    const group = groups.get(entry.place.id);
    if (group) group.entries.push(entry);
    else groups.set(entry.place.id, { place: entry.place, entries: [entry] });
  }
  return [...groups.values()];
}
