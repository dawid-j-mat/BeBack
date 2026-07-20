import type { GeoPosition } from '../geolocation';
import { distanceMeters, NEARBY_LIMIT, NEARBY_RADIUS_M, type PlaceCandidate } from './types';

// Google Places API (New) called straight from the browser (D-22).
// The key is public but restricted to our domains and to this API.

interface GoogleAddressComponent {
  longText?: string;
  types?: string[];
}

interface GooglePlace {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  addressComponents?: GoogleAddressComponent[];
  location?: { latitude?: number; longitude?: number };
}

const FIELD_MASK =
  'places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location';

export function hasGoogleKey(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_PLACES_KEY);
}

async function callPlaces(path: string, body: unknown): Promise<GooglePlace[]> {
  const key = import.meta.env.VITE_GOOGLE_PLACES_KEY;
  if (!key) throw new Error('Missing VITE_GOOGLE_PLACES_KEY - see .env.example');
  const res = await fetch(`https://places.googleapis.com/v1/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Places ${path} failed with ${res.status}`);
  const json: { places?: GooglePlace[] } = await res.json();
  return json.places ?? [];
}

function component(place: GooglePlace, type: string): string | null {
  const hit = place.addressComponents?.find((c) => c.types?.includes(type));
  return hit?.longText ?? null;
}

function toCandidate(place: GooglePlace, from: GeoPosition | null): PlaceCandidate | null {
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  const name = place.displayName?.text;
  if (lat === undefined || lng === undefined || !name) return null;
  return {
    googlePlaceId: place.id,
    osmId: null,
    name,
    city: component(place, 'locality'),
    country: component(place, 'country'),
    lat,
    lng,
    address: place.formattedAddress ?? null,
    distanceM: from ? distanceMeters(from, { lat, lng }) : null,
  };
}

// Google place types covering our three categories (SPEC §3.1). Without this
// filter searchNearby returns everything around: clothing stores, offices,
// even named streets - noise the add flow has no use for (D-42).
// `includedTypes` also matches secondary types, so a hotel with a restaurant
// shows up for both worlds - exactly what the two-entries model (D-05) wants.
const NEARBY_TYPES = [
  // nocleg
  'lodging',
  'campground',
  // jedzenie
  'restaurant',
  'cafe',
  'bar',
  'bakery',
  'meal_takeaway',
  'ice_cream_shop',
  // atrakcja
  'tourist_attraction',
  'museum',
  'art_gallery',
  'park',
  'zoo',
  'amusement_park',
  'aquarium',
  'historical_landmark',
];

export async function googleSearchNearby(position: GeoPosition): Promise<PlaceCandidate[]> {
  const places = await callPlaces('places:searchNearby', {
    languageCode: 'pl',
    maxResultCount: NEARBY_LIMIT,
    rankPreference: 'DISTANCE',
    includedTypes: NEARBY_TYPES,
    locationRestriction: {
      circle: {
        center: { latitude: position.lat, longitude: position.lng },
        radius: NEARBY_RADIUS_M,
      },
    },
  });
  return places
    .map((p) => toCandidate(p, position))
    .filter((p): p is PlaceCandidate => p !== null);
}

export async function googleSearchText(
  query: string,
  bias: GeoPosition | null,
): Promise<PlaceCandidate[]> {
  const places = await callPlaces('places:searchText', {
    textQuery: query,
    languageCode: 'pl',
    pageSize: 8,
    ...(bias
      ? {
          locationBias: {
            circle: { center: { latitude: bias.lat, longitude: bias.lng }, radius: 50_000 },
          },
        }
      : {}),
  });
  return places.map((p) => toCandidate(p, bias)).filter((p): p is PlaceCandidate => p !== null);
}
