-- RLS check for BeBack (CLAUDE.md hard rule: every change around private
-- notes needs proof that the other user cannot read them).
--
-- Run in the Supabase SQL Editor AFTER schema.sql and after creating both
-- accounts. The script impersonates each user in turn, creates a test entry
-- with a private note as user A, verifies what user B can and cannot see,
-- and rolls everything back (no test data is left behind).
--
-- Expected result: a single row saying PASS. Any failure aborts with an
-- error message starting with FAIL.

begin;

do $$
declare
  user_a uuid;
  user_b uuid;
  test_place uuid;
  test_entry uuid;
  n int;
begin
  select id into user_a from auth.users order by created_at limit 1;
  select id into user_b from auth.users order by created_at offset 1 limit 1;
  if user_b is null then
    raise exception 'Need at least 2 users in auth.users to run this check';
  end if;

  -- impersonate user A (the RLS-restricted role + their JWT claims)
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', user_a, 'role', 'authenticated')::text, true);

  insert into public.places (name, city, lat, lng, created_by)
  values ('RLS test place', 'Testowo', 0, 0, user_a)
  returning id into test_place;

  insert into public.entries (user_id, place_id, category, verdict, note)
  values (user_a, test_place, 'jedzenie', 'wroce', 'rls test entry')
  returning id into test_entry;

  insert into public.private_notes (entry_id, user_id, body)
  values (test_entry, user_a, 'top secret');

  select count(*) into n from public.private_notes where entry_id = test_entry;
  if n <> 1 then
    raise exception 'FAIL: author cannot read their own private note';
  end if;

  -- impersonate user B
  perform set_config('request.jwt.claims',
    json_build_object('sub', user_b, 'role', 'authenticated')::text, true);

  select count(*) into n from public.entries where id = test_entry;
  if n <> 1 then
    raise exception 'FAIL: circle member cannot see the entry';
  end if;

  select count(*) into n from public.private_notes where entry_id = test_entry;
  if n <> 0 then
    raise exception 'FAIL: private note is visible to another user';
  end if;

  -- B tries to vandalise A's entry (RLS must make this touch 0 rows)
  update public.entries set note = 'hacked' where id = test_entry;

  -- B tries to attach a note to A's entry (composite FK must reject it)
  begin
    insert into public.private_notes (entry_id, user_id, body)
    values (test_entry, user_b, 'note under someone else''s entry');
    raise exception 'FAIL: another user attached a note to someone else''s entry';
  exception
    when foreign_key_violation or unique_violation then
      null; -- expected: rejected by the database
  end;

  -- back to user A: entry untouched
  perform set_config('request.jwt.claims',
    json_build_object('sub', user_a, 'role', 'authenticated')::text, true);

  select count(*) into n from public.entries
  where id = test_entry and note = 'rls test entry';
  if n <> 1 then
    raise exception 'FAIL: another user managed to modify the entry';
  end if;

  raise notice 'RLS check: PASS';
end;
$$;

rollback;

select 'PASS – RLS dziala: wpisy widzi grono, notatki prywatne tylko autor' as wynik;
