import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from './supabase';
import { useEntries, setEntryPhotoPath, type Entry } from './entries';
import { uploadPhoto } from './photos';
import {
  outboxEvents,
  outboxList,
  outboxRemove,
  pendingToEntry,
  type PendingEntry,
} from './outbox';

// Background sync of the offline outbox (SPEC §3.5). The whole run is
// idempotent: ids were generated at stamping time, so an insert that hits a
// duplicate-key error just means an interrupted earlier run already delivered
// that row, and the item continues from where it stopped (e.g. the photo).

const DUPLICATE = '23505'; // Postgres unique_violation

async function findOrCreatePlace(item: PendingEntry): Promise<string> {
  // The user already answered "same place?" while adding - trust the link.
  if (item.existingPlaceId) return item.existingPlaceId;
  const candidate = item.place;
  // Dedupe by whichever external id the candidate carries (Google or OSM);
  // manual places have neither and always create a fresh row.
  const externalId = candidate.googlePlaceId
    ? { column: 'google_place_id', value: candidate.googlePlaceId }
    : candidate.osmId
      ? { column: 'osm_id', value: candidate.osmId }
      : null;
  if (externalId) {
    const { data, error } = await supabase
      .from('places')
      .select('id')
      .eq(externalId.column, externalId.value)
      .maybeSingle();
    if (error) throw error;
    if (data) return data.id as string;
  }
  const { error } = await supabase.from('places').insert({
    id: item.placeId,
    google_place_id: candidate.googlePlaceId,
    osm_id: candidate.osmId,
    name: candidate.name,
    city: candidate.city,
    country: candidate.country,
    lat: candidate.lat,
    lng: candidate.lng,
    created_by: item.userId,
  });
  if (!error) return item.placeId;
  if (error.code !== DUPLICATE) throw error;
  // Someone else (or our own interrupted run) created it in the meantime.
  if (externalId) {
    const { data, error: requeryError } = await supabase
      .from('places')
      .select('id')
      .eq(externalId.column, externalId.value)
      .single();
    if (requeryError) throw requeryError;
    return data.id as string;
  }
  return item.placeId;
}

async function syncOne(item: PendingEntry): Promise<void> {
  const placeId = await findOrCreatePlace(item);
  const { error } = await supabase.from('entries').insert({
    id: item.entryId,
    user_id: item.userId,
    place_id: placeId,
    category: item.category,
    verdict: item.verdict,
    wow: item.wow,
    note: item.note,
    visited_on: item.visitedOn,
  });
  if (error && error.code !== DUPLICATE) throw error;
  if (item.photo) {
    const path = await uploadPhoto(item.userId, item.entryId, item.photo);
    await setEntryPhotoPath(item.entryId, path);
  }
}

let draining = false;

// Sends queued entries oldest-first; a failure (usually: still no network)
// stops the run and leaves the rest for the next trigger. Returns whether
// anything reached the server. Only the signed-in user's items are sent -
// RLS would reject rows stamped by a previously signed-in account anyway
// (two accounts share a device during tests, D-21).
export async function drainOutbox(userId: string): Promise<boolean> {
  if (draining || !navigator.onLine) return false;
  draining = true;
  let synced = false;
  try {
    const items = await outboxList();
    for (const item of items) {
      if (item.userId !== userId) continue;
      await syncOne(item);
      await outboxRemove(item.entryId);
      synced = true;
    }
  } catch (err) {
    console.warn('[beback] outbox sync interrupted, will retry:', err);
  } finally {
    draining = false;
  }
  return synced;
}

// The app's single source of entries: the circle's entries from Supabase
// (cached for offline viewing, see useEntries) merged with the outbox,
// pending first. Sync runs on start, on regained network, on tab return and
// after every stamping.
export function useOfflineEntries(userId: string | null) {
  const { entries: serverEntries, refresh } = useEntries(userId);
  const [pending, setPending] = useState<Entry[]>([]);
  const photoUrls = useRef(new Map<string, string>());

  const reloadPending = useCallback(async () => {
    if (!userId) return;
    const items = (await outboxList()).filter((item) => item.userId === userId);
    const urls = photoUrls.current;
    const liveIds = new Set(items.map((item) => item.entryId));
    for (const [id, url] of urls) {
      if (!liveIds.has(id)) {
        URL.revokeObjectURL(url);
        urls.delete(id);
      }
    }
    setPending(
      items
        .map((item) => {
          let url = urls.get(item.entryId) ?? null;
          if (!url && item.photo) {
            url = URL.createObjectURL(item.photo);
            urls.set(item.entryId, url);
          }
          return pendingToEntry(item, url);
        })
        .reverse(), // newest first, like the server list
    );
  }, [userId]);

  const syncNow = useCallback(async () => {
    if (!userId) return;
    const synced = await drainOutbox(userId);
    if (synced) await refresh(); // the server list now includes them...
    await reloadPending(); // ...so dropping them here cannot blink a pin out
  }, [userId, refresh, reloadPending]);

  useEffect(() => {
    if (!userId) return;
    void reloadPending();
    void syncNow();
    const onEnqueued = () => {
      void reloadPending();
      void syncNow();
    };
    const onOnline = () => void syncNow();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void syncNow();
    };
    outboxEvents.addEventListener('enqueued', onEnqueued);
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);
    const urls = photoUrls.current;
    return () => {
      outboxEvents.removeEventListener('enqueued', onEnqueued);
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, [userId, reloadPending, syncNow]);

  const entries = useMemo(() => {
    const serverIds = new Set(serverEntries.map((entry) => entry.id));
    return [...pending.filter((entry) => !serverIds.has(entry.id)), ...serverEntries];
  }, [pending, serverEntries]);

  return { entries, refresh };
}
