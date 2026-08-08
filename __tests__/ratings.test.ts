import { isValidStars, summarizeRatings } from '../lib/ratings';
import type { Rating } from '../lib/types';

function makeRating(overrides: Partial<Rating>): Rating {
  return {
    id: 'r1',
    playground_id: 'p1',
    user_id: 'u1',
    age_group: '3_6',
    safety_rating: 3,
    facilities_rating: 3,
    variety_rating: 3,
    comment: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('summarizeRatings', () => {
  it('returns nulls and zero counts with no ratings', () => {
    const summary = summarizeRatings([]);
    expect(summary.count).toBe(0);
    expect(summary.safety).toBeNull();
    expect(summary.facilities).toBeNull();
    expect(summary.variety).toBeNull();
    expect(summary.ageGroupCounts).toEqual({ '0_2': 0, '3_6': 0, '6_12': 0 });
  });

  it('averages each category independently, rounded to one decimal', () => {
    const summary = summarizeRatings([
      makeRating({ id: 'a', safety_rating: 5, facilities_rating: 2, variety_rating: 4 }),
      makeRating({ id: 'b', user_id: 'u2', safety_rating: 4, facilities_rating: 3, variety_rating: 1 }),
    ]);
    expect(summary.count).toBe(2);
    expect(summary.safety).toBe(4.5);
    expect(summary.facilities).toBe(2.5);
    expect(summary.variety).toBe(2.5);
  });

  it('counts age groups', () => {
    const summary = summarizeRatings([
      makeRating({ id: 'a', age_group: '0_2' }),
      makeRating({ id: 'b', user_id: 'u2', age_group: '0_2' }),
      makeRating({ id: 'c', user_id: 'u3', age_group: '6_12' }),
    ]);
    expect(summary.ageGroupCounts).toEqual({ '0_2': 2, '3_6': 0, '6_12': 1 });
  });
});

describe('isValidStars', () => {
  it('accepts whole numbers 1–5', () => {
    for (const v of [1, 2, 3, 4, 5]) expect(isValidStars(v)).toBe(true);
  });

  it('rejects 0, 6, decimals and NaN', () => {
    for (const v of [0, 6, 2.5, NaN, -1]) expect(isValidStars(v)).toBe(false);
  });
});
