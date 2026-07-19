import { useEffect, useState } from 'react';
import { supabase } from './supabase';

// Circle-wide app settings (D-39): a single database row holds the places
// provider choice; only admins may change it - RLS enforces that, not this
// code. The device keeps a copy in localStorage so the choice also applies
// offline and before the fetch returns, the same pattern as the interface
// language (D-37). Other devices pick a change up on their next app start.

export type PlacesSetting = 'auto' | 'google' | 'osm';

const REMOTE_PROVIDER_KEY = 'beback:places-provider-remote';

function isPlacesSetting(value: unknown): value is PlacesSetting {
  return value === 'auto' || value === 'google' || value === 'osm';
}

// Synchronous read of the device copy - src/lib/places consults this on
// every search, outside React.
export function remotePlacesSetting(): PlacesSetting {
  try {
    const stored = localStorage.getItem(REMOTE_PROVIDER_KEY);
    if (isPlacesSetting(stored)) return stored;
  } catch {
    // no storage - behave as if nothing was configured
  }
  return 'auto';
}

function storeSetting(setting: PlacesSetting): void {
  try {
    localStorage.setItem(REMOTE_PROVIDER_KEY, setting);
  } catch {
    // best-effort device copy
  }
}

export interface AppSettings {
  placesSetting: PlacesSetting;
  isAdmin: boolean;
  changePlacesSetting: (next: PlacesSetting) => void;
}

export function useAppSettings(userId: string | null): AppSettings {
  const [placesSetting, setPlacesSetting] = useState<PlacesSetting>(remotePlacesSetting);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setIsAdmin(false);
    supabase
      .from('app_settings')
      .select('places_provider')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data || !isPlacesSetting(data.places_provider)) return;
        storeSetting(data.places_provider);
        setPlacesSetting(data.places_provider);
      });
    // RLS returns the membership row only to its owner, so "did I get a row"
    // is the whole admin check.
    supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsAdmin(Boolean(data));
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  function changePlacesSetting(next: PlacesSetting): void {
    // This device switches instantly; the row update carries the choice to
    // the rest of the circle. A non-admin update would silently touch 0 rows
    // (RLS), but non-admins never see the switch.
    storeSetting(next);
    setPlacesSetting(next);
    void supabase
      .from('app_settings')
      .update({ places_provider: next })
      .eq('id', 1)
      .then(({ error }) => {
        if (error) console.warn('[beback] places setting update failed:', error);
      });
  }

  return { placesSetting, isAdmin, changePlacesSetting };
}
