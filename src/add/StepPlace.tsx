import { useCallback, useEffect, useRef, useState } from 'react';
import type { GeoPosition } from '../lib/geolocation';
import { searchNearby, searchText, type PlaceCandidate } from '../lib/places';
import { t } from '../i18n';

// Nearby suggestions can genuinely be empty (nothing around) or can fail
// (provider down); the two must not look the same on screen - the silent
// failure was indistinguishable from "no places here" and cost us a bug hunt.
type NearbyStatus = 'loading' | 'ok' | 'error';

interface StepPlaceProps {
  position: GeoPosition | null;
  onPick: (place: PlaceCandidate) => void;
}

function formatDistance(m: number | null): string {
  if (m === null) return '';
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`;
}

export function StepPlace({ position, onPick }: StepPlaceProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceCandidate[]>([]);
  const [nearby, setNearby] = useState<PlaceCandidate[]>([]);
  const [nearbyStatus, setNearbyStatus] = useState<NearbyStatus>('loading');
  const [manualOpen, setManualOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  const loadNearby = useCallback(() => {
    if (!position) return;
    setNearbyStatus('loading');
    searchNearby(position)
      .then((found) => {
        setNearby(found);
        setNearbyStatus('ok');
      })
      .catch((err) => {
        console.error('[beback] nearby search failed:', err);
        setNearbyStatus('error');
      });
  }, [position]);

  useEffect(loadNearby, [loadNearby]);

  useEffect(() => {
    clearTimeout(debounce.current);
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      return;
    }
    debounce.current = setTimeout(() => {
      searchText(q, position)
        .then(setResults)
        .catch((err) => console.error('[beback] text search failed:', err));
    }, 500);
    return () => clearTimeout(debounce.current);
  }, [query, position]);

  function pickManual() {
    const name = manualName.trim();
    if (!name || !position) return;
    onPick({
      googlePlaceId: null,
      osmId: null,
      name,
      city: null,
      country: null,
      lat: position.lat,
      lng: position.lng,
      address: null,
      distanceM: 0,
    });
  }

  const list = query.trim().length >= 3 ? results : nearby;

  return (
    <div className="krok">
      <div className="krok-tytul">
        <span className="nr">{t('k1_nr')}</span>
        <h1>{t('k1_h')}</h1>
      </div>
      <div className="krok-cialo">
        <div className="szukaj">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            placeholder={t('szukaj_ph')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {query.trim().length < 3 &&
          position &&
          (nearbyStatus === 'loading' || (nearbyStatus === 'ok' && nearby.length > 0)) && (
          <div className="pod-naglowek">
            <i className="gps" />
            <span>{t('w_poblizu')}</span>
          </div>
        )}

        {query.trim().length < 3 && position && nearbyStatus === 'error' && (
          <div className="poblizu-blad">
            <span>{t('w_poblizu_blad')}</span>
            <button type="button" className="btn-maly" onClick={loadNearby}>
              {t('sprobuj_ponownie')}
            </button>
          </div>
        )}

        {list.map((p) => (
          <button
            key={p.googlePlaceId ?? p.osmId ?? p.name}
            type="button"
            className="miejsce"
            onClick={() => onPick(p)}
          >
            <span>
              <b>{p.name}</b>
              {p.address && <small>{p.address}</small>}
            </span>
            <span className="dyst">{formatDistance(p.distanceM)}</span>
          </button>
        ))}

        {position &&
          (manualOpen ? (
            <form
              className="reczne-form"
              onSubmit={(e) => {
                e.preventDefault();
                pickManual();
              }}
            >
              <input
                autoFocus
                type="text"
                placeholder={t('dodaj_reczne_ph')}
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
              <button type="submit" className="btn-maly">
                {t('dodaj_reczne_ok')}
              </button>
            </form>
          ) : (
            <button type="button" className="reczne" onClick={() => setManualOpen(true)}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10Z" />
                <circle cx="12" cy="11" r="2.2" />
              </svg>
              <b>{t('dodaj_reczne')}</b>
            </button>
          ))}
      </div>
    </div>
  );
}
