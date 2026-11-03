// Image helpers for the photo translation tab
// Shrinks a photo in the browser before upload (faster upload, cheaper for the backend)
// This is like using Pillow in Python: Image.open(f).thumbnail((1536, 1536)).save(out, "JPEG", quality=90)

import { IMAGE_UPLOAD } from '@/constants';

export interface PreparedImage {
  blob: Blob; // the jpeg we will upload
  width: number;
  height: number;
}

// A friendly error we can show to the user as-is
export class ImagePrepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImagePrepError';
  }
}

// Check type + size BEFORE we try to read the file. Returns an error message, or null if OK.
export function validateImageFile(file: File): string | null {
  const accepted: readonly string[] = IMAGE_UPLOAD.ACCEPTED_TYPES;
  const looksLikeImage =
    accepted.includes(file.type) ||
    file.type.startsWith('image/') ||
    // some apps don't set a type when dragging, so also look at the file name
    (!file.type && /\.(jpe?g|png|webp)$/i.test(file.name));

  if (!looksLikeImage) {
    return 'that doesn’t look like a photo 🙈 please use a jpeg, png or webp image';
  }
  if (file.size > IMAGE_UPLOAD.MAX_ORIGINAL_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `that photo is a bit too big (${sizeMb} MB) 🐘 the limit is 10 MB, please try a smaller one`;
  }
  return null;
}

// Load a File into an <img> element so we can draw it on a canvas
// (modern browsers automatically apply the phone's EXIF rotation here)
function loadImageElement(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImagePrepError('i couldn’t read that photo 🙈 please try a jpeg, png or webp image'));
    };
    img.src = url;
  });
}

// Shrink so the longest side is at most maxSide pixels, and re-encode as JPEG
// This is like img.thumbnail((maxSide, maxSide)); img.convert("RGB").save(..., "JPEG") in Python
export async function prepareImageForUpload(
  file: File,
  maxSide: number = IMAGE_UPLOAD.MAX_SIDE_PX,
  quality: number = IMAGE_UPLOAD.JPEG_QUALITY
): Promise<PreparedImage> {
  const img = await loadImageElement(file);
  const originalWidth = img.naturalWidth;
  const originalHeight = img.naturalHeight;
  if (!originalWidth || !originalHeight) {
    throw new ImagePrepError('i couldn’t read that photo 🙈 please try another one');
  }

  // Only ever scale down, never up
  const scale = Math.min(1, maxSide / Math.max(originalWidth, originalHeight));
  const width = Math.max(1, Math.round(originalWidth * scale));
  const height = Math.max(1, Math.round(originalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new ImagePrepError('your browser couldn’t prepare the photo 🙈 please try another browser');
  }

  // JPEG has no transparency, so paint a white background first (otherwise transparent PNGs turn black)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) {
    throw new ImagePrepError('your browser couldn’t prepare the photo 🙈 please try another one');
  }

  return { blob, width, height };
}

// Turn the base64 string from the backend into a Blob (so we can show + download it)
// This is like base64.b64decode(s) in Python
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const cleaned = base64.replace(/^data:[^;]+;base64,/, ''); // just in case a "data:" prefix sneaks in
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType || 'image/jpeg' });
}

// "Gen Z poetry!" -> "gen-z-poetry" (for the download file name)
export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug || 'photo';
}
