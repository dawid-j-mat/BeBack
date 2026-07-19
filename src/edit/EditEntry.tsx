import { useEffect, useState } from 'react';
import '../add/AddFlow.css';
import './EditEntry.css';
import { deleteEntry, savePrivateNote, updateEntry, type Entry } from '../lib/entries';
import { deletePhoto, signedPhotoUrl, uploadPhoto } from '../lib/photos';
import { usePhotoPick } from '../photo/usePhotoPick';
import { PhotoField } from '../photo/PhotoField';
import { CategoryTiles, type Category } from '../add/StepCategory';
import { VerdictButtons } from '../add/StepVerdict';
import type { Verdict } from '../lib/verdicts';
import { t } from '../i18n';

interface EditEntryProps {
  entry: Entry;
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}

function todayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Editing is a correction, not a re-run of the 45-second flow, so everything
// sits on one screen (D-29). A verdict different from the original marks the
// entry permanently as changed (D-06); the private note is edited here too,
// since the add flow never collects it.
export function EditEntry({ entry, userId, onClose, onSaved }: EditEntryProps) {
  const [category, setCategory] = useState<Category>(entry.category);
  const [verdict, setVerdict] = useState<Verdict>(entry.verdict);
  const [wow, setWow] = useState(entry.wow);
  const [note, setNote] = useState(entry.note);
  const [visitedOn, setVisitedOn] = useState(entry.visitedOn);
  const [privateNote, setPrivateNote] = useState(entry.privateNote ?? '');
  const photo = usePhotoPick();
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  // The current photo (if any) is shown through a signed URL until the user
  // picks a new one or removes it.
  useEffect(() => {
    let cancelled = false;
    if (entry.photoPath) {
      void signedPhotoUrl(entry.photoPath).then((url) => {
        if (!cancelled) setExistingPhotoUrl(url);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [entry.photoPath]);

  const photoPreview = photo.removed ? null : (photo.previewUrl ?? existingPhotoUrl);

  function pickVerdict(v: Verdict) {
    setVerdict(v);
    if (v !== 'wroce') setWow(false); // WOW is a badge on "wroce" only (D-03)
  }

  async function save() {
    if (saving || !visitedOn) return;
    setSaving(true);
    setError(false);
    try {
      // Resolve the photo change first so its new path (if any) rides along in
      // the same update. Path is deterministic, so replacing a photo is a
      // storage overwrite; only add/remove actually change photo_path.
      let photoField: { photoPath?: string | null } = {};
      if (photo.blob) {
        const path = await uploadPhoto(userId, entry.id, photo.blob);
        photoField = { photoPath: path };
      } else if (photo.removed && entry.photoPath) {
        photoField = { photoPath: null };
      }

      await updateEntry(entry.id, {
        category,
        verdict,
        wow,
        note: note.trim(),
        visitedOn,
        // once marked, a changed verdict never goes back to unmarked
        verdictChanged: entry.verdictChanged || verdict !== entry.verdict,
        ...photoField,
      });
      await savePrivateNote(entry.id, userId, privateNote);
      // Drop the old storage object only after the row no longer points at it,
      // so a failure here just leaves a harmless orphan, never a broken link.
      if (photo.removed && entry.photoPath && !photo.blob) {
        await deletePhoto(entry.photoPath).catch((e) =>
          console.error('[beback] old photo cleanup failed:', e),
        );
      }
      onSaved();
    } catch (err) {
      console.error('[beback] entry update failed:', err);
      setError(true);
      setSaving(false);
    }
  }

  async function remove() {
    if (saving || !window.confirm(t('usun_pytanie'))) return;
    setSaving(true);
    setError(false);
    try {
      await deleteEntry(entry.id); // the private note goes with it (cascade FK)
      onSaved();
    } catch (err) {
      console.error('[beback] entry delete failed:', err);
      setError(true);
      setSaving(false);
    }
  }

  return (
    <div className="dodawanie">
      <div className="lotniczy" />
      <div className="top">
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
        <button type="button" className="btn-maly" onClick={onClose}>
          {t('anuluj')}
        </button>
      </div>

      <div className="krok">
        <div className="krok-tytul">
          <span className="nr">{t('edycja_nr')}</span>
          <h1>{entry.place.name}</h1>
        </div>
        <div className="krok-cialo">
          <CategoryTiles value={category} onPick={setCategory} />
          <VerdictButtons value={verdict} onPick={pickVerdict} />
          {verdict === 'wroce' && (
            <button type="button" className={`wow-chip${wow ? ' on' : ''}`} onClick={() => setWow((w) => !w)}>
              <span className="gwiazda" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.5 14.6 9l6.9.3-5.4 4.3 1.9 6.6L12 16.4l-6 3.8 1.9-6.6L2.5 9.3 9.4 9Z" />
                </svg>
              </span>
              <b>{t('wow_b')}</b>
            </button>
          )}

          <textarea
            maxLength={200}
            placeholder={t('opis_ph')}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className={`licznik${note.length >= 200 ? ' limit' : ''}`}>{note.length} / 200</div>

          <PhotoField
            previewUrl={photoPreview}
            compressing={photo.compressing}
            onFile={(f) => void photo.pick(f)}
            onRemove={photo.clear}
          />

          <label className="pod-naglowek data-wizyty">
            {t('data_wizyty')}
            <input
              type="date"
              value={visitedOn}
              max={todayLocal()}
              onChange={(e) => setVisitedOn(e.target.value)}
            />
          </label>

          <div className="pryw-edycja">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <rect x="5" y="10" width="14" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <label>
              <b>{t('pryw_naglowek')}</b>
              <textarea
                value={privateNote}
                onChange={(e) => setPrivateNote(e.target.value)}
              />
            </label>
          </div>

          <button type="button" className="usun-wpis" onClick={() => void remove()}>
            {t('usun_wpis')}
          </button>
        </div>
        <div className="stopka-kroku">
          <button
            type="button"
            className="btn pieczec"
            disabled={saving || !visitedOn}
            onClick={() => void save()}
          >
            {saving ? t('zapisywanie_zmian') : t('zapisz_zmiany')}
          </button>
        </div>
      </div>

      <div className={`toast${error ? ' on' : ''}`}>{t('zapis_blad')}</div>
    </div>
  );
}
