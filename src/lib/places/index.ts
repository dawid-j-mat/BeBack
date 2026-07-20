import type { GeoPosition } from '../geolocation';
import { remotePlacesSetting } from '../appSettings';
import { googleSearchNearby, googleSearchText, hasGoogleKey } from './google';
import { osmSearchNearby, osmSearchText } from './osm';

export type { PlaceCandidate } from './types';
export { distanceMeters } from './types';

// Provider choice (D-25): Google is the primary source, the free OSM pair
// (Overpass + Photon) is the fallback. VITE_PLACES_PROVIDER forces one of
// them; with no key configured the app runs fully on OSM.

type Provider = 'google' | 'osm';

// Test command (D-28): opening the app with ?places=osm or ?places=google
// pins the provider on this device (survives reloads); ?places=auto returns
// to the default behaviour. No UI - this is a testing tool, not a feature.
const OVERRIDE_KEY = 'beback:places-provider';

const urlCommand = new URLSearchParams(window.location.search).get('places');
if (urlCommand === 'osm' || urlCommand === 'google') {
  localStorage.setItem(OVERRIDE_KEY, urlCommand);
} else if (urlCommand === 'auto') {
  localStorage.removeItem(OVERRIDE_KEY);
}

function pickProvider(): Provider {
  // The device pin stays a testing tool and deliberately beats everything,
  // including the admin's circle-wide choice.
  const pinned = localStorage.getItem(OVERRIDE_KEY);
  if (pinned === 'google' || pinned === 'osm') return pinned;
  // Admin's choice shared by the whole circle (D-39); 'auto' falls through.
  const remote = remotePlacesSetting();
  if (remote === 'google' || remote === 'osm') return remote;
  const forced = import.meta.env.VITE_PLACES_PROVIDER;
  if (forced === 'google' || forced === 'osm') return forced;
  return hasGoogleKey() ? 'google' : 'osm';
}

async function withFallback<T>(viaGoogle: () => Promise<T>, viaOsm: () => Promise<T>): Promise<T> {
  if (pickProvider() === 'osm') return viaOsm();
  try {
    return await viaGoogle();
  } catch (err) {
    console.warn('[beback] Google Places failed, retrying with OSM:', err);
    return viaOsm();
  }
}

export function searchNearby(position: GeoPosition) {
  return withFallback(
    () => googleSearchNearby(position),
    () => osmSearchNearby(position),
  );
}

export function searchText(query: string, bias: GeoPosition | null) {
  return withFallback(
    () => googleSearchText(query, bias),
    () => osmSearchText(query, bias),
  );
}
