import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// undefined = still checking local storage, null = signed out.
export function useSession(): Session | null | undefined {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    // Never leave the user staring at a blank screen: if the session check
    // hangs (flaky network, a stuck browser lock), fall back to signed-out.
    const failsafe = setTimeout(() => {
      setSession((current) => {
        if (current === undefined) {
          console.error('[beback] auth: session check did not finish in 5s, showing login');
          return null;
        }
        return current;
      });
    }, 5000);

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) console.error('[beback] auth getSession error:', error.message);
        if (!cancelled) setSession(data.session);
      })
      .catch((err: unknown) => {
        console.error('[beback] auth getSession failed:', err);
        if (!cancelled) setSession(null);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((event, next) => {
      console.log('[beback] auth event:', event, next ? '(session)' : '(no session)');
      if (!cancelled) setSession(next);
    });

    return () => {
      cancelled = true;
      clearTimeout(failsafe);
      listener.subscription.unsubscribe();
    };
  }, []);

  return session;
}
