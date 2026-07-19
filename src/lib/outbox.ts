import type { PlaceCandidate } from './places';
import type { Category } from '../add/StepCategory';
import type { Verdict } from './verdicts';
import type { Entry } from './entries';

// The offline outbox (SPEC §3.5): every stamped entry lands here first - with
// its photo blob - and a background sync (src/lib/sync.ts) moves it to
// Supabase. Entry and place ids are generated client-side at stamping time,
// so a retried sync is idempotent and ids never change once the entry reaches
// the server. Stored in IndexedDB because localStorage cannot hold blobs.

export interface PendingEntry {
  entryId: string; // becomes entries.id on the server
  placeId: string; // used only if the place does not exist yet
  // Set when the user linked the entry to a place that already exists on the
  // server ("same place?", SPEC §3.1) - sync attaches to it instead of
  // creating a new row. Optional: items queued by older builds lack it.
  existingPlaceId?: string | null;
  userId: string;
  authorName: string;
  place: PlaceCandidate;
  category: Category;
  verdict: Verdict;
  wow: boolean;
  note: string;
  visitedOn: string; // yyyy-mm-dd, captured at stamping time - the server
  // default of "today" would falsify entries synced days later
  photo: Blob | null;
  createdAt: number;
}

const DB_NAME = 'beback';
const STORE = 'outbox';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'entryId' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const req = run(db.transaction(STORE, mode).objectStore(STORE));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

// Fires when a new entry is enqueued. Removal during sync is deliberately
// silent: the UI drops a pending entry only after the server copy has been
// refetched, so the pin never blinks out of the list mid-sync.
export const outboxEvents = new EventTarget();

export async function outboxAdd(item: PendingEntry): Promise<void> {
  await withStore('readwrite', (store) => store.put(item));
  outboxEvents.dispatchEvent(new Event('enqueued'));
}

export async function outboxList(): Promise<PendingEntry[]> {
  const items = await withStore<PendingEntry[]>('readonly', (store) => store.getAll());
  return items.sort((a, b) => a.createdAt - b.createdAt);
}

export async function outboxRemove(entryId: string): Promise<void> {
  await withStore('readwrite', (store) => store.delete(entryId));
}

// A pending entry dressed up as a regular Entry so the map, journal and card
// render it with zero special cases; `photoUrl` is an object URL managed by
// the caller (created from the stored blob, revoked when no longer shown).
export function pendingToEntry(item: PendingEntry, photoUrl: string | null): Entry {
  return {
    id: item.entryId,
    userId: item.userId,
    category: item.category,
    verdict: item.verdict,
    wow: item.wow,
    note: item.note,
    visitedOn: item.visitedOn,
    verdictChanged: false,
    photoPath: null,
    authorName: item.authorName,
    privateNote: null,
    pending: true,
    pendingPhotoUrl: photoUrl,
    place: {
      // Group offline entries at one venue onto one pin (D-27): a linked
      // server place merges with its pin immediately, otherwise the external
      // id is shared across candidates and the generated uuid is the fallback.
      id: item.existingPlaceId ?? item.place.googlePlaceId ?? item.place.osmId ?? item.placeId,
      name: item.place.name,
      city: item.place.city,
      country: item.place.country,
      lat: item.place.lat,
      lng: item.place.lng,
    },
  };
}
