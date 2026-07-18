import { t } from '../i18n';
import type { Verdict } from '../components/Stamp';

interface StepVerdictProps {
  onPick: (verdict: Verdict) => void;
  onBack: () => void;
}

export function StepVerdict({ onPick, onBack }: StepVerdictProps) {
  return (
    <div className="krok">
      <div className="krok-tytul">
        <span className="nr">{t('k3_nr')}</span>
        <h1>{t('k3_h')}</h1>
      </div>
      <div className="krok-cialo">
        <button type="button" className="ocena-btn" data-o="wroce" onClick={() => onPick('wroce')}>
          <span className="znaczek">W</span>
          <span>
            <b>{t('o_wroce')}</b>
            <small>{t('o_wroce_s')}</small>
          </span>
        </button>
        <button type="button" className="ocena-btn" data-o="mozna" onClick={() => onPick('mozna')}>
          <span className="znaczek">M</span>
          <span>
            <b>{t('o_mozna')}</b>
            <small>{t('o_mozna_s')}</small>
          </span>
        </button>
        <button
          type="button"
          className="ocena-btn"
          data-o="odradzam"
          onClick={() => onPick('odradzam')}
        >
          <span className="znaczek">O</span>
          <span>
            <b>{t('o_odradzam')}</b>
            <small>{t('o_odradzam_s')}</small>
          </span>
        </button>
      </div>
      <div className="stopka-kroku">
        <button type="button" className="btn cichy" onClick={onBack}>
          {t('wstecz')}
        </button>
      </div>
    </div>
  );
}
