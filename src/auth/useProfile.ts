import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Lang } from '../i18n';

// The signed-in user's profile: display name plus language. The name is
// cached per user in localStorage so the header signature and offline-stamped
// entries keep it even when the profile fetch cannot run (SPEC §3.5); the
// language has its own device copy inside src/i18n (key `beback:lang`).
export interface Profile {
  displayName: string;
  // null until the profile arrives - the device language stays in charge
  profileLang: Lang | null;
}

export function useProfile(userId: string | null): Profile {
  const [profile, setProfile] = useState<Profile>(() => ({
    displayName: userId ? (localStorage.getItem(`beback:name:${userId}`) ?? '') : '',
    profileLang: null,
  }));

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setProfile({
      displayName: localStorage.getItem(`beback:name:${userId}`) ?? '',
      profileLang: null,
    });
    supabase
      .from('profiles')
      .select('display_name, lang')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (cancelled || !data) return;
        const lang = data.lang === 'en' ? 'en' : 'pl';
        setProfile({ displayName: data.display_name, profileLang: lang });
        try {
          localStorage.setItem(`beback:name:${userId}`, data.display_name);
        } catch {
          // best-effort cache
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return profile;
}

// Fire-and-forget: the device copy switches instantly, the profile row makes
// the choice follow the account onto other devices. RLS limits the update to
// the user's own row.
export async function saveProfileLang(userId: string, lang: Lang): Promise<void> {
  const { error } = await supabase.from('profiles').update({ lang }).eq('id', userId);
  if (error) console.warn('[beback] profile language update failed:', error);
}
