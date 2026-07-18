import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { paperStyle } from '../map/paperStyle';
import { attachEntryMarkers, type EntryMarkersController } from '../map/entryMarkers';
import { getPosition } from '../lib/geolocation';
import { groupByPlace, type Entry, type PlaceGroup } from '../lib/entries';
import { EntryCard } from './EntryCard';
import { t } from '../i18n';

// Fallback view when geolocation is unavailable or denied.
const KATOWICE: [number, number] = [19.0238, 50.2599];

type MapFilter = 'all' | 'wroce';

interface MapViewProps {
  entries: Entry[];
  freshEntryId: string | null;
}

export function MapView({ entries, freshEntryId }: MapViewProps) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<EntryMarkersController | null>(null);
  const onPickRef = useRef<(group: PlaceGroup) => void>(() => {});
  const [filter, setFilter] = useState<MapFilter>('all');
  const [selected, setSelected] = useState<PlaceGroup | null>(null);

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
    const visible = filter === 'wroce' ? entries.filter((e) => e.verdict === 'wroce') : entries;
    return groupByPlace(visible);
  }, [entries, filter]);

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
        <button
          type="button"
          className={`filtr${filter === 'all' ? ' on' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t('f_wszystko')}
        </button>
        <button
          type="button"
          className={`filtr${filter === 'wroce' ? ' on' : ''}`}
          onClick={() => setFilter('wroce')}
        >
          {t('f_wroce')}
        </button>
      </div>
      {selected && <EntryCard group={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
