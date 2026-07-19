import { t } from '../i18n';

export type AppView = 'mapa' | 'dziennik';

interface BottomNavProps {
  view: AppView;
  onNav: (view: AppView) => void;
  onAdd: () => void;
}

export function BottomNav({ view, onNav, onAdd }: BottomNavProps) {
  return (
    <nav className="nav">
      <button
        type="button"
        className={view === 'mapa' ? 'on' : ''}
        onClick={() => onNav('mapa')}
      >
        <svg
          className="ikona"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
          <path d="M9 4v14M15 6v14" />
        </svg>
        <span>{t('nav_mapa')}</span>
      </button>
      <button type="button" className="fab" aria-label={t('dodaj_wpis')} onClick={onAdd}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <button
        type="button"
        className={view === 'dziennik' ? 'on' : ''}
        onClick={() => onNav('dziennik')}
      >
        <svg
          className="ikona"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M5 3h13a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M7 3v18M11 8h5M11 12h5" />
        </svg>
        <span>{t('nav_dziennik')}</span>
      </button>
    </nav>
  );
}
