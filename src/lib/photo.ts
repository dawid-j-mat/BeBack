// Client-side compression before upload (SPEC §3.1/§5, hard rule ≤ 300 KB).
// browser-image-compression runs in a web worker so a 12-megapixel phone photo
// does not freeze the UI, and it straightens EXIF orientation - without that,
// portrait photos from a phone routinely upload sideways.
//
// The library inlines its worker and weighs ~340 KB gzip, so it is imported
// lazily: it lands in its own chunk fetched on the first photo pick, keeping
// the initial app load lean (SPEC §8, "< 3 s na 4G").
const TARGET_MB = 0.3; // 300 KB
const MAX_EDGE = 1920; // longest side; plenty for a single card photo

export async function compressPhoto(file: File): Promise<Blob> {
  try {
    const { default: imageCompression } = await import('browser-image-compression');
    return await imageCompression(file, {
      maxSizeMB: TARGET_MB,
      maxWidthOrHeight: MAX_EDGE,
      useWebWorker: true,
      fileType: 'image/jpeg',
    });
  } catch (err) {
    // Offline before the service worker finished precaching, the lazy chunk
    // cannot load - and photos must still work with zero network (SPEC §3.5).
    console.warn('[beback] compression library unavailable, using canvas fallback:', err);
    return canvasCompress(file);
  }
}

// No-dependency fallback: downscale on a canvas and walk the JPEG quality
// down until the target size fits. createImageBitmap applies the EXIF
// orientation itself ('from-image' is the default in today's browsers).
async function canvasCompress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  let last: Blob | null = null;
  for (const quality of [0.8, 0.65, 0.5, 0.35]) {
    last = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality),
    );
    if (last && last.size <= TARGET_MB * 1024 * 1024) return last;
  }
  if (last) return last; // best effort - a slightly larger photo beats none
  throw new Error('canvas compression produced no blob');
}
