import { t } from '../i18n';

export type Category = 'nocleg' | 'jedzenie' | 'atrakcja';

interface StepCategoryProps {
  placeName: string;
  onPick: (category: Category) => void;
  onBack: () => void;
}

export function StepCategory({ placeName, onPick, onBack }: StepCategoryProps) {
  return (
    <div className="krok">
      <div className="krok-tytul">
        <span className="nr">{t('k2_nr')}</span>
        <h1>{placeName}</h1>
      </div>
      <div className="krok-cialo">
        <div className="kafle">
          <button type="button" className="kafel" onClick={() => onPick('nocleg')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M3 18V8m0 6h18v4M3 14h18a0 0 0 0 0 0 0v0a4 4 0 0 0-4-4H8" />
              <circle cx="6.5" cy="10.5" r="1.6" />
            </svg>
            <span>{t('kat_nocleg')}</span>
          </button>
          <button type="button" className="kafel" onClick={() => onPick('jedzenie')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M7 3v7m-2.5-7v7M9.5 3v7M7 10v11M16 3c-1.7 1.5-2.5 3.5-2.5 6 0 2 .8 3 2.5 3v9" />
            </svg>
            <span>{t('kat_jedzenie')}</span>
          </button>
          <button type="button" className="kafel" onClick={() => onPick('atrakcja')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M4 20 10 7l4 8 3-5 3 10Z" strokeLinejoin="round" />
            </svg>
            <span>{t('kat_atrakcja')}</span>
          </button>
        </div>
      </div>
      <div className="stopka-kroku">
        <button type="button" className="btn cichy" onClick={onBack}>
          {t('wstecz')}
        </button>
      </div>
    </div>
  );
}
