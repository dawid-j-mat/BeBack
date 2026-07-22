import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { paperStyle } from '../map/paperStyle';
import { attachEntryMarkers, type EntryMarkersController } from '../map/entryMarkers';
import { getPosition, GeoError } from '../lib/geolocation';
import { groupByPlace, type Entry, type PlaceGroup } from '../lib/entries';
import { CATEGORY_ICONS, type Category } from '../add/StepCategory';
import { EntryCard } from './EntryCard';
import { t } from '../i18n';

// Fallback view when geolocation is unavailable or denied.
const KATOWICE: [number, number] = [19.0238, 50.2599];

const ALL_CATEGORIES: Category[] = ['nocleg', 'jedzenie', 'atrakcja'];

interface MapViewProps {
  entries: Entry[];
  freshEntryId: string | null;
  currentUserId: string;
  onEdit: (entry: Entry) => void;
}

export function MapView({ entries, freshEntryId, currentUserId, onEdit }: MapViewProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<EntryMarkersController | null>(null);
  const onPickRef = useRef<(group: PlaceGroup) => void>(() => {});
  // Category filters (D-44): all three on by default and additive - tapping
  // one off subtracts its pins. The small "Wrócę!" toggle overlays whatever
  // categories are selected ("restaurants I'd return to").
  const [cats, setCats] = useState<Category[]>(ALL_CATEGORIES);
  const [wroceOnly, setWroceOnly] = useState(false);
  const [selected, setSelected] = useState<PlaceGroup | null>(null);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  onPickRef.current = setSelected;

  useEffect(() => {
    if (!container.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: paperStyle,
      center: KATOWICE,
      zoom: 12.5,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    markersRef.current = attachEntryMarkers(map, (group) => onPickRef.current(group));
    let cancelled = false;
    getPosition()
      .then((pos) => {
        if (!cancelled) map.jumpTo({ center: [pos.lng, pos.lat], zoom: 14 });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      markersRef.current?.destroy();
      markersRef.current = null;
      mapRef.current = null;
      map.remove();
    };
  }, []);

  const groups = useMemo(() => {
    const visible = entries.filter(
      (e) => cats.includes(e.category) && (!wroceOnly || e.verdict === 'wroce'),
    );
    return groupByPlace(visible);
  }, [entries, cats, wroceOnly]);

  function toggleCat(cat: Category) {
    setCats((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  // "Where am I" (D-41): after browsing elsewhere the map comes back to the
  // user's position, like the locate button in any maps app. A tap is a user
  // gesture, so on iOS it is also the most reliable moment for the permission
  // prompt - and if it fails, the reason is shown, not swallowed (D-49).
  function locate() {
    setGeoMsg(null);
    getPosition()
      .then((pos) => {
        const map = mapRef.current;
        if (!map) return;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        map.easeTo({
          center: [pos.lng, pos.lat],
          zoom: Math.max(map.getZoom(), 14),
          duration: reduced ? 0 : 600,
        });
      })
      .catch((err) => {
        if (err instanceof GeoError && err.kind === 'denied') {
          const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
          setGeoMsg(ios ? `${t('geo_denied')} ${t('geo_denied_ios')}` : t('geo_denied'));
        } else {
          setGeoMsg(t('geo_unavailable'));
        }
      });
  }

  // One tap to take in every pin (D-41) - "where did they eat on that trip".
  function fitAll() {
    const map = mapRef.current;
    if (!map || groups.length === 0) return;
    const bounds = new maplibregl.LngLatBounds();
    for (const group of groups) bounds.extend([group.place.lng, group.place.lat]);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    map.fitBounds(bounds, {
      padding: { top: 104, bottom: 64, left: 48, right: 48 },
      maxZoom: 15,
      duration: reduced ? 0 : 800,
    });
  }

  useEffect(() => {
    markersRef.current?.setGroups(groups, freshEntryId);
  }, [groups, freshEntryId]);

  // A freshly stamped entry pulls the map to its pin so the pulse is seen
  // even after panning away (SPEC §3.2).
  useEffect(() => {
    if (!freshEntryId || !mapRef.current) return;
    const fresh = entries.find((e) => e.id === freshEntryId);
    if (!fresh) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    mapRef.current.easeTo({
      center: [fresh.place.lng, fresh.place.lat],
      duration: reduced ? 0 : 600,
    });
  }, [freshEntryId, entries]);

  return (
    <>
      <div ref={container} className="mapa" aria-label={t('mapa_aria')} />
      <div className="filtry">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`filtr kat${cats.includes(cat) ? ' on' : ''}`}
            aria-label={t(`kat_${cat}`)}
            aria-pressed={cats.includes(cat)}
            onClick={() => toggleCat(cat)}
          >
            {CATEGORY_ICONS[cat]}
          </button>
        ))}
        <button
          type="button"
          className={`filtr wroce${wroceOnly ? ' on' : ''}`}
          aria-pressed={wroceOnly}
          onClick={() => setWroceOnly((v) => !v)}
        >
          {t('o_wroce')}
        </button>
      </div>
      <div className="mapa-przyciski">
        {groups.length > 0 && (
          <button
            type="button"
            className="mapa-przycisk"
            aria-label={t('wszystkie_aria')}
            onClick={fitAll}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 4H5.8A1.8 1.8 0 0 0 4 5.8V9" />
              <path d="M15 4h3.2A1.8 1.8 0 0 1 20 5.8V9" />
              <path d="M20 15v3.2a1.8 1.8 0 0 1-1.8 1.8H15" />
              <path d="M9 20H5.8A1.8 1.8 0 0 1 4 18.2V15" />
              <circle cx="12" cy="12" r="2.2" />
            </svg>
          </button>
        )}
        <button
          type="button"
          className="mapa-przycisk"
          aria-label={t('centruj_aria')}
          onClick={locate}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="5.5" />
            <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
            <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
          </svg>
        </button>
      </div>
      {geoMsg && (
        <div className="geo-blad" role="alert">
          <span>{geoMsg}</span>
          <div className="geo-blad-akcje">
            <button type="button" className="btn-maly" onClick={locate}>
              {t('sprobuj_ponownie')}
            </button>
            <button type="button" className="btn-maly" onClick={() => setGeoMsg(null)}>
              {t('zamknij')}
            </button>
          </div>
        </div>
      )}
      {selected && (
        <EntryCard
          group={selected}
          currentUserId={currentUserId}
          onEdit={(entry) => {
            setSelected(null);
            onEdit(entry);
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
