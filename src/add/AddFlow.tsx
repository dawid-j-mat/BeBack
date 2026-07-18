import { useEffect, useState } from 'react';
import './AddFlow.css';
import { supabase } from '../lib/supabase';
import { getPosition, type GeoPosition } from '../lib/geolocation';
import type { PlaceCandidate } from '../lib/places';
import { t, formatVisitDate } from '../i18n';
import { StepPlace } from './StepPlace';
import { StepCategory, type Category } from './StepCategory';
import { StepVerdict } from './StepVerdict';
import { StepNote } from './StepNote';
import { Przybicie } from './Przybicie';
import type { Verdict } from '../components/Stamp';

interface AddFlowProps {
  userId: string;
  onClose: () => void;
}

export function AddFlow({ userId, onClose }: AddFlowProps) {
  const [step, setStep] = useState(1);
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [place, setPlace] = useState<PlaceCandidate | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [wow, setWow] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [stamped, setStamped] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPosition().then(setPosition).catch(() => setPosition(null));
  }, []);

  async function findOrCreatePlace(candidate: PlaceCandidate): Promise<string> {
    if (candidate.googlePlaceId) {
      const { data } = await supabase
        .from('places')
        .select('id')
        .eq('google_place_id', candidate.googlePlaceId)
        .maybeSingle();
      if (data) return data.id as string;
    }
    const { data, error: insertError } = await supabase
      .from('places')
      .insert({
        google_place_id: candidate.googlePlaceId,
        name: candidate.name,
        city: candidate.city,
        country: candidate.country,
        lat: candidate.lat,
        lng: candidate.lng,
        created_by: userId,
      })
      .select('id')
      .single();
    if (insertError) throw insertError;
    return data.id as string;
  }

  async function save() {
    if (!place || !category || !verdict || saving) return;
    setSaving(true);
    setError(false);
    try {
      const placeId = await findOrCreatePlace(place);
      const { error: entryError } = await supabase.from('entries').insert({
        user_id: userId,
        place_id: placeId,
        category,
        verdict,
        wow,
        note: note.trim(),
      });
      if (entryError) throw entryError;
      setStamped(true);
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
          saving={saving}
          onBack={() => setStep(3)}
          onSave={() => void save()}
        />
      )}

      <div className={`toast${error ? ' on' : ''}`}>{t('zapis_blad')}</div>
    </div>
  );
}
