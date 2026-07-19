import { t } from '../i18n';
import type { Verdict } from '../lib/verdicts';
import { PhotoField } from '../photo/PhotoField';

interface StepNoteProps {
  verdict: Verdict | null;
  wow: boolean;
  onWowToggle: () => void;
  note: string;
  onNoteChange: (note: string) => void;
  photoUrl: string | null;
  photoCompressing: boolean;
  onPhotoFile: (file: File) => void;
  onPhotoRemove: () => void;
  saving: boolean;
  onSave: () => void;
  onBack: () => void;
}

export function StepNote({
  verdict,
  wow,
  onWowToggle,
  note,
  onNoteChange,
  photoUrl,
  photoCompressing,
  onPhotoFile,
  onPhotoRemove,
  saving,
  onSave,
  onBack,
}: StepNoteProps) {
  return (
    <div className="krok">
      <div className="krok-tytul">
        <span className="nr">{t('k4_nr')}</span>
        <h1>{t('k4_h')}</h1>
      </div>
      <div className="krok-cialo">
        <textarea
          maxLength={200}
          placeholder={t('opis_ph')}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
        />
        <div className={`licznik${note.length >= 200 ? ' limit' : ''}`}>{note.length} / 200</div>

        {verdict === 'wroce' && (
          <button type="button" className={`wow-chip${wow ? ' on' : ''}`} onClick={onWowToggle}>
            <span className="gwiazda" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.5 14.6 9l6.9.3-5.4 4.3 1.9 6.6L12 16.4l-6 3.8 1.9-6.6L2.5 9.3 9.4 9Z" />
              </svg>
            </span>
            <b>{t('wow_b')}</b>
          </button>
        )}

        <PhotoField
          previewUrl={photoUrl}
          compressing={photoCompressing}
          onFile={onPhotoFile}
          onRemove={onPhotoRemove}
        />
      </div>
      <div className="stopka-kroku">
        <button type="button" className="btn cichy" onClick={onBack}>
          {t('wstecz')}
        </button>
        <button
          type="button"
          className="btn pieczec"
          disabled={saving || photoCompressing}
          onClick={onSave}
        >
          {saving ? t('zapisywanie') : t('zapisz')}
        </button>
      </div>
    </div>
  );
}
