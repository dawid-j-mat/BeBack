export interface GeoPosition {
  lat: number;
  lng: number;
}

// Why a fix failed, so the map can tell "you said no" from "GPS couldn't get
// a reading" and give the right advice (D-49).
export type GeoErrorKind = 'denied' | 'unavailable';

export class GeoError extends Error {
  kind: GeoErrorKind;
  constructor(kind: GeoErrorKind, message: string) {
    super(message);
    this.name = 'GeoError';
    this.kind = kind;
  }
}

// A phone has no console, and the iOS standalone-PWA geolocation trouble is
// invisible otherwise; the last failure (error code + text) is kept so the
// admin sheet can show it. Same pattern as nearbyDiag in places/osm.ts.
const GEO_DIAG_KEY = 'beback:geo-diag';

export function geoDiag(): string | null {
  try {
    return localStorage.getItem(GEO_DIAG_KEY);
  } catch {
    return null;
  }
}

function storeGeoDiag(text: string | null): void {
  try {
    if (text === null) localStorage.removeItem(GEO_DIAG_KEY);
    else localStorage.setItem(GEO_DIAG_KEY, text);
  } catch {
    // best-effort diagnostics
  }
}

// An installed iOS PWA (added to the home screen) is the one place where a
// geolocation call made on load - without a user gesture - tends to be denied
// silently, and iOS then remembers that "no". Detecting it lets the map hold
// the first fix until the user taps the locate control (D-50). Android
// standalone and every desktop browser are unaffected.
export function isIosStandalone(): boolean {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const standalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
  return ios && standalone;
}

// The last successful fix, kept on the device: when a fresh fix fails (weak
// GPS, slow permission prompt), nearby suggestions can still start from the
// last known spot. Capped at an hour - an older position could suggest
// places from a town the user already left.
const LAST_POS_KEY = 'beback:last-position';
const LAST_POS_MAX_AGE_MS = 60 * 60 * 1000;

function readLastPosition(): GeoPosition | null {
  try {
    const raw = localStorage.getItem(LAST_POS_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as GeoPosition & { at: number };
    if (Date.now() - stored.at > LAST_POS_MAX_AGE_MS) return null;
    return { lat: stored.lat, lng: stored.lng };
  } catch {
    return null;
  }
}

function storeLastPosition(pos: GeoPosition): void {
  try {
    localStorage.setItem(LAST_POS_KEY, JSON.stringify({ ...pos, at: Date.now() }));
  } catch {
    // best-effort cache; a full localStorage must not break the fix itself
  }
}

function currentPosition(options: PositionOptions): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
        storeLastPosition(pos);
        resolve(pos);
      },
      reject,
      options,
    );
  });
}

// Three nets, in order: a precise fix, then a coarse one (network location,
// accepting a cached result up to 10 minutes old), then the stored last
// position. Only when all three fail does the caller see a rejection - and
// it gets a GeoError telling denied from unavailable, plus a diag trail.
export async function getPosition(timeoutMs = 8000): Promise<GeoPosition> {
  try {
    const pos = await currentPosition({
      enableHighAccuracy: true,
      timeout: timeoutMs,
      maximumAge: 60_000,
    });
    storeGeoDiag(null);
    return pos;
  } catch (err) {
    try {
      const pos = await currentPosition({
        enableHighAccuracy: false,
        timeout: timeoutMs,
        maximumAge: 600_000,
      });
      storeGeoDiag(null);
      return pos;
    } catch {
      const last = readLastPosition();
      if (last) return last;
      // Both live attempts failed and nothing is stored. A denial (code 1)
      // repeats across attempts, so the first error's code decides the kind.
      // GeolocationPositionError is not an Error subclass, so read its own
      // .message rather than relying on instanceof.
      const posErr = err as GeolocationPositionError | undefined;
      const code = posErr?.code;
      const message = posErr?.message ?? (err instanceof Error ? err.message : String(err));
      const kind: GeoErrorKind = code === 1 ? 'denied' : 'unavailable';
      const standalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
      storeGeoDiag(
        `${new Date().toISOString().slice(0, 16)} code=${code ?? '?'} ${kind} standalone=${standalone}: ${message}`,
      );
      throw new GeoError(kind, message);
    }
  }
}
