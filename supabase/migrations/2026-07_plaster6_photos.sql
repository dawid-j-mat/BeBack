-- Slice 6 (photos): a private Storage bucket for the single entry photo (D-32).
-- Run once in the Supabase SQL Editor. Layout: {user_id}/{entry_id}.jpg (SPEC §5).
--
-- Access model mirrors the entries table: the whole circle may read every
-- photo, but a user may only write into their own {user_id}/ folder. The owner
-- check reads the first path segment; storage RLS - not the client - enforces it.

-- Private bucket (public = false → objects reachable only via signed URLs).
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

-- Read: any signed-in user (the circle).
create policy "photos: read for the circle"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'photos');

-- Insert: only into your own folder.
create policy "photos: insert own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Update: needed so replacing a photo (upload with upsert) can overwrite.
create policy "photos: update own folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Delete: only your own files (also covers the entry-delete cleanup).
create policy "photos: delete own folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
