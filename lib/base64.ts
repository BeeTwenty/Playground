// Minimal base64 → bytes decoder. Supabase's upload wants an ArrayBuffer,
// while Expo's image tools hand us base64 — this bridges the two without
// pulling in an extra dependency.
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const LOOKUP = new Uint8Array(128);
for (let i = 0; i < ALPHABET.length; i++) LOOKUP[ALPHABET.charCodeAt(i)] = i;

export function base64ToBytes(base64: string): Uint8Array {
  // Strip padding; each remaining character carries 6 bits.
  const clean = base64.replace(/=+$/, '');
  const byteLength = Math.floor((clean.length * 6) / 8);
  const bytes = new Uint8Array(byteLength);

  let buffer = 0;
  let bitsInBuffer = 0;
  let out = 0;
  for (let i = 0; i < clean.length; i++) {
    buffer = (buffer << 6) | LOOKUP[clean.charCodeAt(i)];
    bitsInBuffer += 6;
    if (bitsInBuffer >= 8) {
      bitsInBuffer -= 8;
      bytes[out++] = (buffer >> bitsInBuffer) & 0xff;
    }
  }
  return bytes;
}
