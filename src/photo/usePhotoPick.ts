import { useCallback, useEffect, useRef, useState } from 'react';
import { compressPhoto } from '../lib/photo';

// Holds the pending photo choice for the add flow and the edit screen: the
// compressed blob ready to upload, a local object-URL for the preview, and a
// "removed" flag so the edit screen can tell "cleared" apart from "unchanged".
// Object URLs are revoked as they are replaced and on unmount.
export interface PhotoPick {
  blob: Blob | null;
  previewUrl: string | null;
  compressing: boolean;
  removed: boolean;
  pick: (file: File) => Promise<void>;
  clear: () => void;
}

export function usePhotoPick(): PhotoPick {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [removed, setRemoved] = useState(false);
  const urlRef = useRef<string | null>(null);

  const setUrl = useCallback((url: string | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = url;
    setPreviewUrl(url);
  }, []);

  const pick = useCallback(
    async (file: File) => {
      setCompressing(true);
      try {
        const compressed = await compressPhoto(file);
        setBlob(compressed);
        setUrl(URL.createObjectURL(compressed));
        setRemoved(false);
      } catch (err) {
        console.error('[beback] photo compression failed:', err);
      } finally {
        setCompressing(false);
      }
    },
    [setUrl],
  );

  const clear = useCallback(() => {
    setUrl(null);
    setBlob(null);
    setRemoved(true);
  }, [setUrl]);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  return { blob, previewUrl, compressing, removed, pick, clear };
}
