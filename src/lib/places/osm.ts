import type { GeoPosition } from '../geolocation';
import { distanceMeters, NEARBY_LIMIT, NEARBY_RADIUS_M, type PlaceCandidate } from './types';

// Free, keyless place search on OpenStreetMap data (D-25).
// "Nearby" asks the Overpass API for named POIs around the GPS position;
// text search goes to Photon, komoot's typo-tolerant geocoder.

// The main public instance gets overloaded at times, so nearby falls
// through to the kumi.systems mirror before giving up.
const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const PHOTON_URL = 'https://photon.komoot.io/api';
// Public instances can be busy; the place step must never hang.
const TIMEOUT_MS = 6000;

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

export async function osmSearchNearby(position: GeoPosition): Promise<PlaceCandidate[]> {
  const around = `around:${NEARBY_RADIUS_M},${position.lat},${position.lng}`;
  // Overpass returns elements in no particular order, so the cap has to be
  // generous - sorting by distance and trimming happens client-side.
  const query = `[out:json][timeout:6];
(
  nwr(${around})[name][amenity~"^(${AMENITY})$"];
  nwr(${around})[name][tourism~"^(${TOURISM})$"];
  nwr(${around})[name][leisure~"^(${LEISURE})$"];
);
out center tags 60;`;
  let lastError: unknown = new Error('No Overpass instance configured');
  for (const url of OVERPASS_URLS) {
    try {
      const json = (await fetchJson(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      })) as { elements?: OverpassElement[] };
      return (json.elements ?? [])
        .map((el) => toNearbyCandidate(el, position))
        .filter((c): c is PlaceCandidate => c !== null)
        .sort((a, b) => (a.distanceM ?? 0) - (b.distanceM ?? 0))
        .slice(0, NEARBY_LIMIT);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
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
