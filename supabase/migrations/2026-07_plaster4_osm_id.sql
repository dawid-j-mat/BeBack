-- Plaster 4: places found via the free OSM provider (Overpass + Photon, D-25)
-- need their own identity for dedupe, next to google_place_id.
-- Run once in the Supabase SQL Editor on the existing project.

alter table public.places
  add column if not exists osm_id text unique;
