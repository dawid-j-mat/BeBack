import maplibregl from 'maplibre-gl';
import Supercluster from 'supercluster';
import type { PlaceGroup } from '../lib/entries';
import { VERDICT_COLOR, VERDICT_RIM, type Verdict } from '../lib/verdicts';
import { t } from '../i18n';

// Entry pins and clusters as DOM markers (D-26): supercluster does the math,
// the visuals are the prototype's pushpin SVG and the dashed cluster circle,
// which need page fonts (Domine/Caveat) unavailable to map glyph layers.

const CLUSTER_RADIUS = 64;
// Above this zoom every place stands alone.
const CLUSTER_MAX_ZOOM = 14;

interface PinProps {
  index: number;
}

export interface EntryMarkersController {
  setGroups(groups: PlaceGroup[], freshEntryId: string | null): void;
  destroy(): void;
}

function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function pinSVG(verdict: Verdict, wow: boolean): string {
  const fill = VERDICT_COLOR[verdict];
  const rim = VERDICT_RIM[verdict];
  // Pushpin from the prototype: shadow ellipse, leg, head with a highlight.
  // WOW is a quiet gold halo around the head (D-40): a thin ring in the SVG
  // for definition, the soft outer glow comes from CSS on `.pinezka.wow`.
  const wowRing = wow
    ? `<circle cx="18" cy="18" r="12.6" fill="none" stroke="#B8860B" stroke-width="1.6" opacity=".85"/>`
    : '';
  return `<svg viewBox="0 0 48 42" aria-hidden="true">
    <ellipse cx="18" cy="39" rx="7" ry="2.5" fill="#26324D" opacity=".18"/>
    <line x1="16" y1="36" x2="18" y2="24" stroke="#26324D" stroke-width="1.6"/>
    <g class="glowka">
      ${wowRing}
      <circle cx="18" cy="18" r="10" fill="${fill}" stroke="${rim}" stroke-width="1.5"/>
      <circle cx="15" cy="15" r="3" fill="#fff" opacity=".4"/>
    </g>
  </svg>`;
}

export function attachEntryMarkers(
  map: maplibregl.Map,
  onPick: (group: PlaceGroup) => void,
): EntryMarkersController {
  const index = new Supercluster<PinProps>({ radius: CLUSTER_RADIUS, maxZoom: CLUSTER_MAX_ZOOM });
  let groups: PlaceGroup[] = [];
  let freshEntryId: string | null = null;
  let markers: maplibregl.Marker[] = [];

  function pinElement(group: PlaceGroup): HTMLElement {
    const newest = group.entries[0];
    const wow = group.entries.some((e) => e.wow);
    const isFresh = freshEntryId !== null && group.entries.some((e) => e.id === freshEntryId);
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `pinezka${wow ? ' wow' : ''}${isFresh ? ' swieza' : ''}`;
    el.setAttribute('aria-label', group.place.name);
    el.innerHTML = pinSVG(newest.verdict, wow);
    el.addEventListener('click', (ev) => {
      ev.stopPropagation();
      onPick(group);
    });
    return el;
  }

  // The most frequent city among the clustered places, handwritten under the
  // count like in the prototype; mixed clusters without cities stay unlabelled.
  function dominantCity(clusterId: number): string | null {
    const counts = new Map<string, number>();
    for (const leaf of index.getLeaves(clusterId, Infinity)) {
      const city = groups[leaf.properties.index]?.place.city;
      if (city) counts.set(city, (counts.get(city) ?? 0) + 1);
    }
    let best: string | null = null;
    let bestCount = 0;
    for (const [city, count] of counts) {
      if (count > bestCount) {
        best = city;
        bestCount = count;
      }
    }
    return best;
  }

  function clusterElement(clusterId: number, count: number, lng: number, lat: number): HTMLElement {
    const city = dominantCity(clusterId);
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'klaster';
    el.setAttribute('aria-label', `${t('klaster_aria')}: ${count}${city ? ` – ${city}` : ''}`);
    const ile = document.createElement('span');
    ile.className = 'ile';
    ile.textContent = String(count);
    el.appendChild(ile);
    if (city) {
      const miasto = document.createElement('span');
      miasto.className = 'miasto';
      miasto.textContent = city;
      el.appendChild(miasto);
    }
    el.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const zoom = Math.min(index.getClusterExpansionZoom(clusterId), 18);
      map.easeTo({ center: [lng, lat], zoom, duration: reducedMotion() ? 0 : 700 });
    });
    return el;
  }

  function render() {
    markers.forEach((m) => m.remove());
    markers = [];
    if (groups.length === 0) return;
    const bounds = map.getBounds();
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];
    for (const feature of index.getClusters(bbox, Math.floor(map.getZoom()))) {
      const [lng, lat] = feature.geometry.coordinates;
      let marker: maplibregl.Marker;
      if ('cluster' in feature.properties && feature.properties.cluster) {
        const el = clusterElement(feature.properties.cluster_id, feature.properties.point_count, lng, lat);
        marker = new maplibregl.Marker({ element: el, anchor: 'center' });
      } else {
        const group = groups[(feature.properties as PinProps).index];
        if (!group) continue;
        marker = new maplibregl.Marker({ element: pinElement(group), anchor: 'bottom' });
      }
      markers.push(marker.setLngLat([lng, lat]).addTo(map));
    }
  }

  map.on('moveend', render);

  return {
    setGroups(nextGroups, nextFreshEntryId) {
      groups = nextGroups;
      freshEntryId = nextFreshEntryId;
      index.load(
        groups.map((group, i) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [group.place.lng, group.place.lat] },
          properties: { index: i },
        })),
      );
      render();
    },
    destroy() {
      map.off('moveend', render);
      markers.forEach((m) => m.remove());
      markers = [];
    },
  };
}
