-- Plaster 9: admin-controlled places provider switch (D-39).
-- Run once in the Supabase SQL Editor on the existing project.
--
-- Access model: every signed-in user reads the single settings row; only
-- admins may update it. Admin membership lives in its own table with no
-- write policies at all - rows are added manually in the Supabase panel,
-- so the database (not the frontend) decides who is an admin.

create table public.admins (
  user_id uuid primary key references public.profiles (id) on delete cascade
);

alter table public.admins enable row level security;

-- Each user may only check their own membership (the app uses this to decide
-- whether to show the switch). No insert/update/delete policies on purpose:
-- admins are appointed in the SQL Editor, never from the app.
create policy "admins: read own membership"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

-- Single-row settings table: the primary key check makes a second row
-- impossible, so the app can always address the row as id = 1.
create table public.app_settings (
  id int primary key check (id = 1),
  places_provider text not null default 'auto'
    check (places_provider in ('auto', 'google', 'osm')),
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

create policy "app settings: read for the circle"
  on public.app_settings for select
  to authenticated
  using (true);

create policy "app settings: update by admins"
  on public.app_settings for update
  to authenticated
  using (exists (select 1 from public.admins where user_id = auth.uid()))
  with check (exists (select 1 from public.admins where user_id = auth.uid()));

create trigger app_settings_touch_updated_at
  before update on public.app_settings
  for each row execute function public.touch_updated_at();

insert into public.app_settings (id) values (1);

-- Appoint the administrator (run separately, with the account id copied
-- from Authentication -> Users):
--
--   insert into public.admins (user_id) values ('<uuid>');
