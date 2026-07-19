import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// The signed-in user's display name from their profile, cached per user in
// localStorage so the header signature and offline-stamped entries keep the
// name even when the profile fetch cannot run (SPEC §3.5).
export function useDisplayName(userId: string | null): string {
  const [name, setName] = useState(() =>
    userId ? (localStorage.getItem(`beback:name:${userId}`) ?? '') : '',
  );

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setName(localStorage.getItem(`beback:name:${userId}`) ?? '');
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setName(data.display_name);
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

  return name;
}
