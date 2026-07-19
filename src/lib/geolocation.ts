export interface GeoPosition {
  lat: number;
  lng: number;
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
// position. Only when all three fail does the caller see a rejection and
// hide the GPS-dependent UI.
export async function getPosition(timeoutMs = 8000): Promise<GeoPosition> {
  try {
    return await currentPosition({
      enableHighAccuracy: true,
      timeout: timeoutMs,
      maximumAge: 60_000,
    });
  } catch (err) {
    try {
      return await currentPosition({
        enableHighAccuracy: false,
        timeout: timeoutMs,
        maximumAge: 600_000,
      });
    } catch {
      const last = readLastPosition();
      if (last) return last;
      throw err;
    }
  }
}
