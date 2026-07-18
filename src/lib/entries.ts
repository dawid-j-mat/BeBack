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
  authorName: string;
  privateNote: string | null;
  place: EntryPlace;
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
      `id, user_id, category, verdict, wow, note, visited_on, verdict_changed,
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
        authorName: one(row.author)?.display_name ?? '',
        privateNote: one(row.private_note)?.body ?? null,
        place,
      },
    ];
  });
}

export function useEntries(enabled: boolean) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const refresh = useCallback(() => {
    fetchEntries()
      .then(setEntries)
      .catch((err) => console.error('[beback] entries fetch failed:', err));
  }, []);
  useEffect(() => {
    if (enabled) refresh();
  }, [enabled, refresh]);
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
