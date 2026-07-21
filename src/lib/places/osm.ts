import type { GeoPosition } from '../geolocation';
import { distanceMeters, NEARBY_LIMIT, NEARBY_RADIUS_M, type PlaceCandidate } from './types';

// Free, keyless place search on OpenStreetMap data (D-25).
// "Nearby" asks the Overpass API for named POIs around the GPS position;
// text search goes to Photon, komoot's typo-tolerant geocoder.

// Public Overpass instances come and go (kumi.systems retired its public
// mirror) and the main one rate-limits per IP - which on mobile networks
// is shared by thousands of people (CGNAT), so a phone can be locked out
// while a desktop works. All instances race in parallel (D-45); a dead
// entry in this list costs nothing, the first good answer wins.
const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const PHOTON_URL = 'https://photon.komoot.io/api';
// Public instances can be busy; the place step must never hang. 10 s instead
// of the original 6: under load Overpass queues requests and a fixed 6 s cut
// both instances off before either could answer (D-42).
const TIMEOUT_MS = 10_000;

// OSM tag values covering our three categories (SPEC §3.1):
// jedzenie via amenity, nocleg and atrakcja via tourism plus a few leisure spots.
const AMENITY = 'restaurant|cafe|bar|pub|fast_food|ice_cream|food_court|biergarten';
const TOURISM =
  'hotel|guest_house|hostel|apartment|chalet|camp_site|motel|attraction|museum|gallery|viewpoint|zoo|theme_park';
const LEISURE = 'park|garden|water_park|nature_reserve';

async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${url.split('?')[0]} failed with ${res.status}`);
  return res.json();
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  // ways and relations carry their centroid here thanks to `out center`
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function toNearbyCandidate(el: OverpassElement, from: GeoPosition): PlaceCandidate | null {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  const name = el.tags?.name;
  if (lat === undefined || lng === undefined || !name) return null;
  const street = el.tags?.['addr:street'];
  const nr = el.tags?.['addr:housenumber'];
  return {
    googlePlaceId: null,
    osmId: `${el.type}/${el.id}`,
    name,
    city: el.tags?.['addr:city'] ?? null,
    country: null,
    lat,
    lng,
    address: street ? (nr ? `${street} ${nr}` : street) : null,
    distanceM: distanceMeters(from, { lat, lng }),
  };
}

// When every instance fails, the per-host reasons land here so the admin
// sheet can show them - the phone has no console and "does not work" alone
// has already cost three debugging sessions (D-45). Cleared on success.
const NEARBY_DIAG_KEY = 'beback:nearby-diag';

export function nearbyDiag(): string | null {
  try {
    return localStorage.getItem(NEARBY_DIAG_KEY);
  } catch {
    return null;
  }
}

export async function osmSearchNearby(position: GeoPosition): Promise<PlaceCandidate[]> {
  const around = `around:${NEARBY_RADIUS_M},${position.lat},${position.lng}`;
  // Overpass returns elements in no particular order, so the cap has to be
  // generous - sorting by distance and trimming happens client-side.
  // `out center 60` (body verbosity), NOT `out tags`: the `tags` verbosity
  // strips coordinates from nodes, silently dropping most POIs (D-42).
  const query = `[out:json][timeout:8];
(
  nwr(${around})[name][amenity~"^(${AMENITY})$"];
  nwr(${around})[name][tourism~"^(${TOURISM})$"];
  nwr(${around})[name][leisure~"^(${LEISURE})$"];
);
out center 60;`;
  // GET, not POST (D-45): it mirrors the request profile of Photon, which
  // demonstrably works from the same phones, and some mobile-network
  // middleboxes are unkind to cross-origin POST bodies.
  // All instances race in parallel, first good answer wins - sequential
  // fallback meant a busy main instance ate the whole time budget before
  // any mirror was even tried. A few extra requests per tap is fine at
  // our scale.
  const failures: string[] = [];
  const attempts = OVERPASS_URLS.map((url) =>
    fetchJson(`${url}?data=${encodeURIComponent(query)}`).catch((err: unknown) => {
      failures.push(`${new URL(url).hostname}: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }),
  );
  let json: { elements?: OverpassElement[] };
  try {
    json = (await Promise.any(attempts)) as { elements?: OverpassElement[] };
    try {
      localStorage.removeItem(NEARBY_DIAG_KEY);
    } catch {
      // best-effort diagnostics
    }
  } catch (err) {
    const summary = failures.join(' · ');
    console.error('[beback] Overpass nearby failed on all instances:', summary);
    try {
      localStorage.setItem(NEARBY_DIAG_KEY, `${new Date().toISOString().slice(0, 16)} ${summary}`);
    } catch {
      // best-effort diagnostics
    }
    throw err instanceof AggregateError ? (err.errors[0] ?? err) : err;
  }
  return (json.elements ?? [])
    .map((el) => toNearbyCandidate(el, position))
    .filter((c): c is PlaceCandidate => c !== null)
    .sort((a, b) => (a.distanceM ?? 0) - (b.distanceM ?? 0))
    .slice(0, NEARBY_LIMIT);
}

interface PhotonFeature {
  geometry?: { coordinates?: number[] };
  properties?: {
    osm_type?: 'N' | 'W' | 'R';
    osm_id?: number;
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    country?: string;
  };
}

const OSM_TYPE: Record<'N' | 'W' | 'R', string> = { N: 'node', W: 'way', R: 'relation' };

function toSearchCandidate(f: PhotonFeature, from: GeoPosition | null): PlaceCandidate | null {
  const [lng, lat] = f.geometry?.coordinates ?? [];
  const p = f.properties ?? {};
  if (lat === undefined || lng === undefined || !p.name || !p.osm_type || p.osm_id === undefined)
    return null;
  const street = p.street ? (p.housenumber ? `${p.street} ${p.housenumber}` : p.street) : null;
  const address = [street, p.city].filter(Boolean).join(', ') || null;
  return {
    googlePlaceId: null,
    osmId: `${OSM_TYPE[p.osm_type]}/${p.osm_id}`,
    name: p.name,
    city: p.city ?? null,
    country: p.country ?? null,
    lat,
    lng,
    address,
    distanceM: from ? distanceMeters(from, { lat, lng }) : null,
  };
}

export async function osmSearchText(
  query: string,
  bias: GeoPosition | null,
): Promise<PlaceCandidate[]> {
  const params = new URLSearchParams({ q: query, limit: String(NEARBY_LIMIT) });
  if (bias) {
    params.set('lat', String(bias.lat));
    params.set('lon', String(bias.lng));
  }
  const json = (await fetchJson(`${PHOTON_URL}?${params}`)) as { features?: PhotonFeature[] };
  return (json.features ?? [])
    .map((f) => toSearchCandidate(f, bias))
    .filter((c): c is PlaceCandidate => c !== null);
}
