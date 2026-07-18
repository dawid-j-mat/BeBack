import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { t } from '../i18n';

export function TopBar({ user }: { user: User }) {
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled && data) setDisplayName(data.display_name);
      });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  function signOut() {
    if (window.confirm(t('wyloguj_pytanie'))) {
      void supabase.auth.signOut();
    }
  }

  return (
    <header className="top">
      <span className="wordmark">
        <span className="znak" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
          </svg>
        </span>
        <span className="nazwa">BeBack</span>
      </span>
      {displayName && (
        <button type="button" className="kto" onClick={signOut}>
          {displayName}
        </button>
      )}
    </header>
  );
}
