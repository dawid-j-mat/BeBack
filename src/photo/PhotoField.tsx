import { useRef } from 'react';
import './PhotoField.css';
import { t } from '../i18n';

interface PhotoFieldProps {
  previewUrl: string | null;
  compressing: boolean;
  onFile: (file: File) => void;
  onRemove: () => void;
}

// The photo control shared by the add flow and the edit screen. Empty: a
// dashed "fill it in" drop (design language) that opens the OS picker, which
// itself offers camera or gallery - so no `capture` attribute, the choice is
// the user's. Filled: the photo in the journal's white frame with four
// photographic corners, plus a discreet remove button.
export function PhotoField({ previewUrl, compressing, onFile, onRemove }: PhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = ''; // allow re-picking the same file
  }

  return (
    <div className="foto-pole">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onChange}
      />
      {previewUrl ? (
        <div className="foto">
          <span className="naroznik n1" aria-hidden="true" />
          <span className="naroznik n2" aria-hidden="true" />
          <span className="naroznik n3" aria-hidden="true" />
          <span className="naroznik n4" aria-hidden="true" />
          {/* tapping the photo re-opens the picker to swap it */}
          <button
            type="button"
            className="foto-img"
            aria-label={t('foto_zmien')}
            onClick={() => inputRef.current?.click()}
          >
            <img src={previewUrl} alt="" />
          </button>
          <button type="button" className="foto-usun" aria-label={t('foto_usun')} onClick={onRemove}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={`foto-drop${compressing ? ' zajete' : ''}`}
          disabled={compressing}
          onClick={() => inputRef.current?.click()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <rect x="3" y="6" width="18" height="14" rx="2" />
            <circle cx="12" cy="13" r="4" />
            <path d="M9 6l1.2-2h3.6L15 6" />
          </svg>
          <span>
            <b>{t('foto_b')}</b>
            <small>{t('foto_s')}</small>
          </span>
        </button>
      )}
    </div>
  );
}
