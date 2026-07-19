import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { t, type Lang } from '../i18n';

interface TopBarProps {
  displayName: string;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

// Tapping the handwritten signature opens a small sheet: language choice and
// sign-out (grown out of D-21 - still no separate settings screen in the MVP).
export function TopBar({ displayName, lang, onLangChange }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function signOut() {
    setMenuOpen(false);
    // Magic-link logins are rate limited (2 mails/h), so an accidental tap
    // must not sign the user out - keep the confirmation.
    if (window.confirm(t('wyloguj_pytanie'))) {
      void supabase.auth.signOut();
    }
  }

  function pickLang(next: Lang) {
    setMenuOpen(false);
    onLangChange(next);
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
        <button type="button" className="kto" onClick={() => setMenuOpen((open) => !open)}>
          {displayName}
        </button>
      )}
      {menuOpen && (
        <>
          <div className="podpis-tlo" onClick={() => setMenuOpen(false)} />
          <div className="podpis-menu">
            <div className="podpis-jezyki">
              {(['pl', 'en'] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  className={`jezyk${lang === code ? ' on' : ''}`}
                  onClick={() => pickLang(code)}
                >
                  {code === 'pl' ? 'Polski' : 'English'}
                </button>
              ))}
            </div>
            <button type="button" className="podpis-wyloguj" onClick={signOut}>
              {t('wyloguj')}
            </button>
          </div>
        </>
      )}
    </header>
  );
}
