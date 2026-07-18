-- BeBack database schema (phase 1: two accounts, everything mutually visible).
-- Run once in the Supabase SQL Editor. Idempotent-ish: drops nothing; run on a fresh project.
--
-- Access model (SPEC §3.7):
--   * every signed-in user reads all profiles, places and entries (the circle),
--   * users modify only their own rows,
--   * private notes live in their own table so RLS can make them author-only (D-20).

-- ---------------------------------------------------------------- profiles

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  lang text not null default 'pl' check (lang in ('pl', 'en')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read for the circle"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles: update own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Auto-create a profile whenever an account is created in Supabase Auth.
-- display_name defaults to the part of the e-mail before the @.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- places

create table public.places (
  id uuid primary key default gen_random_uuid(),
  google_place_id text unique,
  -- OSM identity ("node/240109189") for places found via the free
  -- Overpass/Photon provider (D-25); manual places leave both ids null
  osm_id text unique,
  name text not null,
  city text,
  country text,
  lat double precision not null,
  lng double precision not null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.places enable row level security;

create policy "places: read for the circle"
  on public.places for select
  to authenticated
  using (true);

create policy "places: insert own"
  on public.places for insert
  to authenticated
  with check (created_by = auth.uid());

-- ---------------------------------------------------------------- entries

create table public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  place_id uuid not null references public.places (id),
  category text not null check (category in ('nocleg', 'jedzenie', 'atrakcja')),
  verdict text not null check (verdict in ('wroce', 'mozna', 'odradzam')),
  wow boolean not null default false,
  note varchar(200) not null default '',
  photo_path text,
  visited_on date not null default current_date,
  verdict_changed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- WOW is a badge on the top verdict, not a fourth grade (D-03)
  constraint wow_only_for_wroce check (wow = false or verdict = 'wroce'),
  -- referenced by private_notes to tie a note to the entry's author
  constraint entries_id_user_unique unique (id, user_id)
);

create index entries_place_id_idx on public.entries (place_id);
create index entries_user_id_idx on public.entries (user_id);
create index entries_visited_on_idx on public.entries (visited_on desc);

alter table public.entries enable row level security;

create policy "entries: read for the circle"
  on public.entries for select
  to authenticated
  using (true);

create policy "entries: insert own"
  on public.entries for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "entries: update own"
  on public.entries for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "entries: delete own"
  on public.entries for delete
  to authenticated
  using (user_id = auth.uid());

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger entries_touch_updated_at
  before update on public.entries
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- private notes
-- Separate table instead of a column on entries: RLS works per row, not per
-- column, and the privacy of these notes must be enforced by the database,
-- not by frontend code (D-20).

create table public.private_notes (
  entry_id uuid primary key,
  user_id uuid not null references public.profiles (id),
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- composite FK: a private note can only hang off the author's own entry
  constraint private_notes_entry_author_fk
    foreign key (entry_id, user_id)
    references public.entries (id, user_id)
    on delete cascade
);

alter table public.private_notes enable row level security;

create policy "private notes: author only (select)"
  on public.private_notes for select
  to authenticated
  using (user_id = auth.uid());

create policy "private notes: author only (insert)"
  on public.private_notes for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "private notes: author only (update)"
  on public.private_notes for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "private notes: author only (delete)"
  on public.private_notes for delete
  to authenticated
  using (user_id = auth.uid());

create trigger private_notes_touch_updated_at
  before update on public.private_notes
  for each row execute function public.touch_updated_at();
