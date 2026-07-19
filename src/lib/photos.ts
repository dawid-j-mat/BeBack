import { supabase } from './supabase';

// Supabase Storage helpers for the single entry photo. The bucket `photos` is
// private (D-32): the whole circle may read, but only the owner writes into
// their own {user_id}/ folder - enforced by storage RLS policies, not here.
// Path layout: {user_id}/{entry_id}.jpg (SPEC §5).

const BUCKET = 'photos';

export function photoPathFor(userId: string, entryId: string): string {
  return `${userId}/${entryId}.jpg`;
}

export async function uploadPhoto(userId: string, entryId: string, blob: Blob): Promise<string> {
  const path = photoPathFor(userId, entryId);
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: 'image/jpeg',
    upsert: true, // replacing a photo overwrites the same path
  });
  if (error) throw error;
  return path;
}

export async function deletePhoto(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

// A short-lived signed URL for a private-bucket object; regenerated per view.
export async function signedPhotoUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error) {
    console.error('[beback] signed photo url failed:', error.message);
    return null;
  }
  return data.signedUrl;
}
