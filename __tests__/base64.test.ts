import { base64ToBytes } from '../lib/base64';

// Compare against Node's own base64 decoder for a range of sizes,
// covering every padding case (0, 1 and 2 '=' characters).
describe('base64ToBytes', () => {
  it.each([0, 1, 2, 3, 16, 255, 256, 1000])('decodes %i random bytes correctly', (size) => {
    const original = Buffer.from(Array.from({ length: size }, (_, i) => (i * 37 + size) % 256));
    const base64 = original.toString('base64');
    expect(Buffer.from(base64ToBytes(base64))).toEqual(original);
  });

  it('decodes a known string', () => {
    const base64 = Buffer.from('Lekeplass Rater!', 'utf8').toString('base64');
    expect(Buffer.from(base64ToBytes(base64)).toString('utf8')).toBe('Lekeplass Rater!');
  });
});
