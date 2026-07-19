import { useEffect, useState } from 'react';
import './AddFlow.css';
import { getPosition, type GeoPosition } from '../lib/geolocation';
import type { PlaceCandidate } from '../lib/places';
import { t, formatVisitDate } from '../i18n';
import { StepPlace } from './StepPlace';
import { StepCategory, type Category } from './StepCategory';
import { StepVerdict } from './StepVerdict';
import { StepNote } from './StepNote';
import { Przybicie } from './Przybicie';
import type { Verdict } from '../lib/verdicts';
import { usePhotoPick } from '../photo/usePhotoPick';
import { outboxAdd } from '../lib/outbox';
import { todayLocal } from '../lib/dates';

interface AddFlowProps {
  userId: string;
  authorName: string;
  onClose: () => void;
  onSaved?: (entryId: string) => void;
}

export function AddFlow({ userId, authorName, onClose, onSaved }: AddFlowProps) {
  const [step, setStep] = useState(1);
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [place, setPlace] = useState<PlaceCandidate | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [wow, setWow] = useState(false);
  const [note, setNote] = useState('');
  const photo = usePhotoPick();
  const [saving, setSaving] = useState(false);
  const [stamped, setStamped] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPosition().then(setPosition).catch(() => setPosition(null));
  }, []);

  // Stamping writes to the local outbox only - even online (outbox-first,
  // D-33): the stamp lands instantly with or without signal, and the sync
  // engine (src/lib/sync.ts) delivers the entry and its photo in the
  // background. Ids are generated here so they survive the sync unchanged.
  async function save() {
    // photo.compressing guards the race where stamping mid-compression would
    // silently drop the just-picked photo (blob is not ready yet)
    if (!place || !category || !verdict || saving || photo.compressing) return;
    setSaving(true);
    setError(false);
    try {
      const entryId = crypto.randomUUID();
      await outboxAdd({
        entryId,
        placeId: crypto.randomUUID(),
        userId,
        authorName,
        place,
        category,
        verdict,
        wow,
        note: note.trim(),
        visitedOn: todayLocal(),
        photo: photo.blob,
        createdAt: Date.now(),
      });
      setStamped(true);
      onSaved?.(entryId);
    } catch (err) {
      console.error('[beback] entry save failed:', err);
      setError(true);
      setSaving(false);
    }
  }

  if (stamped && place && verdict) {
    return (
      <div className="dodawanie">
        <Przybicie
          verdict={verdict}
          wow={wow}
          place={place.city ?? place.name}
          date={formatVisitDate(new Date())}
          onDone={onClose}
        />
      </div>
    );
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
      <div className="krok-pas">
        {[1, 2, 3, 4].map((n) => (
          <i key={n} className={n <= step ? 'on' : ''} />
        ))}
      </div>

      {step === 1 && (
        <StepPlace
          position={position}
          onPick={(p) => {
            setPlace(p);
            setStep(2);
          }}
        />
      )}
      {step === 2 && place && (
        <StepCategory
          placeName={place.name}
          onBack={() => setStep(1)}
          onPick={(c) => {
            setCategory(c);
            setStep(3);
          }}
        />
      )}
      {step === 3 && (
        <StepVerdict
          onBack={() => setStep(2)}
          onPick={(v) => {
            setVerdict(v);
            if (v !== 'wroce') setWow(false);
            setStep(4);
          }}
        />
      )}
      {step === 4 && (
        <StepNote
          verdict={verdict}
          wow={wow}
          onWowToggle={() => setWow((w) => !w)}
          note={note}
          onNoteChange={setNote}
          photoUrl={photo.previewUrl}
          photoCompressing={photo.compressing}
          onPhotoFile={(f) => void photo.pick(f)}
          onPhotoRemove={photo.clear}
          saving={saving}
          onBack={() => setStep(3)}
          onSave={() => void save()}
        />
      )}

      <div className={`toast${error ? ' on' : ''}`}>{t('zapis_blad')}</div>
    </div>
  );
}
