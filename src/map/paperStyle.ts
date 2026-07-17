import type { StyleSpecification } from 'maplibre-gl';

// "Paper journal" map style (DESIGN.md §4): paper background, roads as
// sketchy ink lines, water in airmail blue at low opacity with a contour.
// Vector tiles: OpenFreeMap (OSM data, no API key, free of charge).
// Ink/paper values mirror the CSS tokens in src/styles/tokens.css.
const PAPIER = '#F1E8D4';
const KRAFT = '#E4D6B8';
const ATRAMENT = '#26324D';
const NIEBIESKI = '#2B4C9B';

export const paperStyle: StyleSpecification = {
  version: 8,
  name: 'BeBack – papierowy dziennik',
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    openfreemap: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
      attribution:
        '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': PAPIER },
    },
    {
      id: 'landcover-green',
      type: 'fill',
      source: 'openfreemap',
      'source-layer': 'landcover',
      filter: ['in', ['get', 'class'], ['literal', ['wood', 'forest', 'grass', 'scrub']]],
      paint: { 'fill-color': KRAFT, 'fill-opacity': 0.45 },
    },
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'openfreemap',
      'source-layer': 'landuse',
      filter: ['in', ['get', 'class'], ['literal', ['park', 'cemetery', 'pitch', 'garden']]],
      paint: { 'fill-color': KRAFT, 'fill-opacity': 0.45 },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'openfreemap',
      'source-layer': 'water',
      paint: {
        'fill-color': NIEBIESKI,
        'fill-opacity': 0.14,
        'fill-outline-color': 'rgba(43, 76, 155, 0.5)',
      },
    },
    {
      id: 'waterway',
      type: 'line',
      source: 'openfreemap',
      'source-layer': 'waterway',
      paint: {
        'line-color': NIEBIESKI,
        'line-opacity': 0.5,
        'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.6, 14, 1.6],
      },
    },
    {
      id: 'building',
      type: 'fill',
      source: 'openfreemap',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'fill-color': ATRAMENT,
        'fill-opacity': 0.05,
        'fill-outline-color': 'rgba(38, 50, 77, 0.12)',
      },
    },
    {
      id: 'road-path',
      type: 'line',
      source: 'openfreemap',
      'source-layer': 'transportation',
      minzoom: 13,
      filter: ['in', ['get', 'class'], ['literal', ['path', 'track']]],
      paint: {
        'line-color': ATRAMENT,
        'line-opacity': 0.22,
        'line-width': 0.8,
        'line-dasharray': [2, 3],
      },
    },
    {
      id: 'road-minor',
      type: 'line',
      source: 'openfreemap',
      'source-layer': 'transportation',
      minzoom: 11,
      filter: ['in', ['get', 'class'], ['literal', ['minor', 'service', 'tertiary']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': ATRAMENT,
        'line-opacity': 0.24,
        'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.5, 14, 1.2, 17, 3],
      },
    },
    {
      id: 'road-main',
      type: 'line',
      source: 'openfreemap',
      'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['primary', 'secondary']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': ATRAMENT,
        'line-opacity': 0.3,
        'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.7, 13, 1.8, 17, 5],
      },
    },
    {
      id: 'road-highway',
      type: 'line',
      source: 'openfreemap',
      'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': ATRAMENT,
        'line-opacity': 0.36,
        'line-width': ['interpolate', ['linear'], ['zoom'], 7, 1, 13, 2.4, 17, 6],
      },
    },
    {
      id: 'railway',
      type: 'line',
      source: 'openfreemap',
      'source-layer': 'transportation',
      minzoom: 12,
      filter: ['==', ['get', 'class'], 'rail'],
      paint: {
        'line-color': ATRAMENT,
        'line-opacity': 0.18,
        'line-width': 1,
        'line-dasharray': [4, 3],
      },
    },
    {
      id: 'boundary',
      type: 'line',
      source: 'openfreemap',
      'source-layer': 'boundary',
      filter: [
        'all',
        ['<=', ['get', 'admin_level'], 4],
        ['!=', ['get', 'maritime'], 1],
      ],
      paint: {
        'line-color': ATRAMENT,
        'line-opacity': 0.25,
        'line-width': 1,
        'line-dasharray': [3, 3],
      },
    },
    {
      id: 'place-other',
      type: 'symbol',
      source: 'openfreemap',
      'source-layer': 'place',
      minzoom: 9,
      filter: ['in', ['get', 'class'], ['literal', ['town', 'village', 'suburb', 'neighbourhood']]],
      layout: {
        'text-field': ['coalesce', ['get', 'name'], ['get', 'name:latin']],
        'text-font': ['Noto Sans Regular'],
        'text-size': 12,
      },
      paint: {
        'text-color': 'rgba(38, 50, 77, 0.72)',
        'text-halo-color': PAPIER,
        'text-halo-width': 1.4,
      },
    },
    {
      id: 'place-city',
      type: 'symbol',
      source: 'openfreemap',
      'source-layer': 'place',
      filter: ['==', ['get', 'class'], 'city'],
      layout: {
        'text-field': ['coalesce', ['get', 'name'], ['get', 'name:latin']],
        'text-font': ['Noto Sans Bold'],
        'text-size': 15,
        'text-letter-spacing': 0.04,
      },
      paint: {
        'text-color': ATRAMENT,
        'text-halo-color': PAPIER,
        'text-halo-width': 1.6,
      },
    },
  ],
};
