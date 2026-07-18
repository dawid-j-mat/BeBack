import type { GeoPosition } from '../geolocation';

// One shape for a place regardless of where it came from (Google, OSM or
// the manual "place I am at" button). Exactly one of googlePlaceId / osmId
// is set for provider results; both stay null for manual places.
export interface PlaceCandidate {
  googlePlaceId: string | null;
  osmId: string | null;
  name: string;
  city: string | null;
  country: string | null;
  lat: number;
  lng: number;
  address: string | null;
  distanceM: number | null;
}

export function distanceMeters(a: GeoPosition, b: GeoPosition): number {
  const R = 6_371_000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(s)));
}
