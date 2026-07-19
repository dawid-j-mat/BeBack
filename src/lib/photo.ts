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
  const { default: imageCompression } = await import('browser-image-compression');
  return imageCompression(file, {
    maxSizeMB: TARGET_MB,
    maxWidthOrHeight: MAX_EDGE,
    useWebWorker: true,
    fileType: 'image/jpeg',
  });
}
