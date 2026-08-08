import { distanceMeters, formatDistance } from '../lib/geo';

describe('distanceMeters', () => {
  it('is zero for identical points', () => {
    const p = { latitude: 59.9139, longitude: 10.7522 };
    expect(distanceMeters(p, p)).toBe(0);
  });

  it('matches the known Oslo → Bergen distance (~305 km)', () => {
    const oslo = { latitude: 59.9139, longitude: 10.7522 };
    const bergen = { latitude: 60.3913, longitude: 5.3221 };
    const d = distanceMeters(oslo, bergen);
    expect(d).toBeGreaterThan(300_000);
    expect(d).toBeLessThan(310_000);
  });

  it('is symmetric', () => {
    const a = { latitude: 59.91, longitude: 10.75 };
    const b = { latitude: 59.95, longitude: 10.6 };
    expect(distanceMeters(a, b)).toBeCloseTo(distanceMeters(b, a), 6);
  });

  it('handles short distances sensibly (~111 m per 0.001° latitude)', () => {
    const a = { latitude: 59.9, longitude: 10.75 };
    const b = { latitude: 59.901, longitude: 10.75 };
    const d = distanceMeters(a, b);
    expect(d).toBeGreaterThan(105);
    expect(d).toBeLessThan(120);
  });
});

describe('formatDistance', () => {
  it('uses meters below 1 km', () => {
    expect(formatDistance(850)).toBe('850 m');
    expect(formatDistance(999.4)).toBe('999 m');
  });

  it('uses one decimal for small km values', () => {
    expect(formatDistance(2400)).toBe('2.4 km');
  });

  it('uses whole km for large values', () => {
    expect(formatDistance(20000)).toBe('20 km');
  });

  it('returns empty string for invalid input', () => {
    expect(formatDistance(-5)).toBe('');
    expect(formatDistance(NaN)).toBe('');
  });
});
