import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { PlacesSetting } from '../lib/appSettings';
import { nearbyDiag } from '../lib/places/osm';
import { geoDiag } from '../lib/geolocation';
import { t, type Lang } from '../i18n';

interface TopBarProps {
  displayName: string;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onRename: (name: string) => void;
  isAdmin: boolean;
  placesSetting: PlacesSetting;
  onPlacesSettingChange: (setting: PlacesSetting) => void;
}

// Tapping the handwritten signature opens a small sheet: language choice and
// sign-out (grown out of D-21 - still no separate settings screen in the MVP).
// Admins additionally get the circle-wide places source switch (D-39).
export function TopBar({
  displayName,
  lang,
  onLangChange,
  onRename,
  isAdmin,
  placesSetting,
  onPlacesSettingChange,
}: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // The default name comes from the e-mail, which is not always a real name;
  // recommendations lean on knowing exactly who stands behind them, so the
  // signature is editable (same confirm/prompt pattern as D-21).
  function editName() {
    setMenuOpen(false);
    const next = window.prompt(t('podpis_pytanie'), displayName)?.trim();
    if (next && next !== displayName) onRename(next);
  }

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

  function pickSetting(next: PlacesSetting) {
    setMenuOpen(false);
    onPlacesSettingChange(next);
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
            <button type="button" className="podpis-zmien" onClick={editName}>
              {t('podpis_zmien')}
            </button>
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
            {isAdmin && (
              <div className="podpis-zrodlo">
                <span className="zrodlo-tytul">{t('zrodlo_miejsc')}</span>
                <div className="zrodlo-przyciski">
                  {(['auto', 'google', 'osm'] as const).map((setting) => (
                    <button
                      key={setting}
                      type="button"
                      className={`jezyk zrodlo${placesSetting === setting ? ' on' : ''}`}
                      onClick={() => pickSetting(setting)}
                    >
                      {t(`zrodlo_${setting}`)}
                    </button>
                  ))}
                </div>
                {/* admin-only debug trails - phones have no console:
                    the last OSM nearby failure per instance (D-45) and the
                    last geolocation failure code (D-49). */}
                {nearbyDiag() && <span className="zrodlo-diag">{nearbyDiag()}</span>}
                {geoDiag() && <span className="zrodlo-diag">GPS · {geoDiag()}</span>}
              </div>
            )}
            <button type="button" className="podpis-wyloguj" onClick={signOut}>
              {t('wyloguj')}
            </button>
          </div>
        </>
      )}
    </header>
  );
}
