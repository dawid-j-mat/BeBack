import { t } from '../i18n';
import type { Verdict } from '../lib/verdicts';

const VERDICTS: {
  verdict: Verdict;
  mini: 'mini_wroce' | 'mini_mozna' | 'mini_odradzam';
  label: 'o_wroce' | 'o_mozna' | 'o_odradzam';
  sub: 'o_wroce_s' | 'o_mozna_s' | 'o_odradzam_s';
}[] = [
  { verdict: 'wroce', mini: 'mini_wroce', label: 'o_wroce', sub: 'o_wroce_s' },
  { verdict: 'mozna', mini: 'mini_mozna', label: 'o_mozna', sub: 'o_mozna_s' },
  { verdict: 'odradzam', mini: 'mini_odradzam', label: 'o_odradzam', sub: 'o_odradzam_s' },
];

// The three verdict buttons, shared by the add flow (tap = move on, nothing
// selected) and the edit screen (tap = toggle the highlighted choice).
export function VerdictButtons({
  value,
  onPick,
}: {
  value: Verdict | null;
  onPick: (verdict: Verdict) => void;
}) {
  return (
    <>
      {VERDICTS.map(({ verdict, mini, label, sub }) => (
        <button
          key={verdict}
          type="button"
          className={`ocena-btn${value === verdict ? ' on' : ''}`}
          data-o={verdict}
          onClick={() => onPick(verdict)}
        >
          <span className="znaczek">{t(mini)}</span>
          <span>
            <b>{t(label)}</b>
            <small>{t(sub)}</small>
          </span>
        </button>
      ))}
    </>
  );
}

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
        <VerdictButtons value={null} onPick={onPick} />
      </div>
      <div className="stopka-kroku">
        <button type="button" className="btn cichy" onClick={onBack}>
          {t('wstecz')}
        </button>
      </div>
    </div>
  );
}
