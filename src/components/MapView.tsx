import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef } from 'react';
import { paperStyle } from '../map/paperStyle';
import { getPosition } from '../lib/geolocation';
import { t } from '../i18n';

// Fallback view when geolocation is unavailable or denied.
const KATOWICE: [number, number] = [19.0238, 50.2599];

export function MapView() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    const map = new maplibregl.Map({
      container: container.current,
      style: paperStyle,
      center: KATOWICE,
      zoom: 12.5,
      attributionControl: { compact: true },
    });
    let cancelled = false;
    getPosition()
      .then((pos) => {
        if (!cancelled) map.jumpTo({ center: [pos.lng, pos.lat], zoom: 14 });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      map.remove();
    };
  }, []);

  return <div ref={container} className="mapa" aria-label={t('mapa_aria')} />;
}
