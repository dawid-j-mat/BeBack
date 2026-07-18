import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef } from 'react';
import { paperStyle } from '../map/paperStyle';
import { t } from '../i18n';

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
    return () => map.remove();
  }, []);

  return <div ref={container} className="mapa" aria-label={t('mapa_aria')} />;
}
