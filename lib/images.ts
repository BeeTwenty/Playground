// Image handling: compress photos on the device, upload them to Supabase
// Storage, and build public URLs for display.
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { base64ToBytes } from './base64';
import { supabase } from './supabase';

export const IMAGE_BUCKET = 'playground-images';

/** Longest edge after compression. Big enough for phone screens, small enough
 * to keep uploads fast on mobile data and storage usage low. */
const MAX_WIDTH = 1280;
const JPEG_QUALITY = 0.8;

/**
 * Shrinks and re-encodes a photo as JPEG, returning it as base64.
 * Runs entirely on the device before anything is uploaded.
 */
export async function compressImage(uri: string): Promise<{ base64: string }> {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: MAX_WIDTH }); // height auto-computed, keeps aspect ratio
  const image = await context.renderAsync();
  const result = await image.saveAsync({
    compress: JPEG_QUALITY,
    format: SaveFormat.JPEG,
    base64: true,
  });
  if (!result.base64) throw new Error('Image compression produced no data');
  return { base64: result.base64 };
}

/**
 * Compresses and uploads one photo. Returns the storage path to save in the
 * `playground_images` table.
 */
export async function uploadPlaygroundImage(
  playgroundId: string,
  localUri: string
): Promise<string> {
  const { base64 } = await compressImage(localUri);
  // One folder per playground keeps the bucket tidy; random suffix avoids collisions.
  const path = `${playgroundId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, base64ToBytes(base64).buffer as ArrayBuffer, { contentType: 'image/jpeg' });
  if (error) throw error;
  return path;
}

/** Turns a stored path into a URL the <Image> component can display. */
export function publicImageUrl(storagePath: string): string {
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}
