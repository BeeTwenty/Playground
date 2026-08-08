// Pure functions for summarizing ratings. Kept free of React/Supabase so they
// are easy to unit test (see __tests__/ratings.test.ts).
import type { AgeGroup, Rating } from './types';

export interface RatingSummary {
  count: number;
  /** Averages are null when there are no ratings yet. */
  safety: number | null;
  facilities: number | null;
  variety: number | null;
  /** How many ratings picked each age group, e.g. { '0_2': 3, ... } */
  ageGroupCounts: Record<AgeGroup, number>;
}

export function summarizeRatings(ratings: Rating[]): RatingSummary {
  const ageGroupCounts: Record<AgeGroup, number> = { '0_2': 0, '3_6': 0, '6_12': 0 };
  let safetySum = 0;
  let facilitiesSum = 0;
  let varietySum = 0;

  for (const r of ratings) {
    safetySum += r.safety_rating;
    facilitiesSum += r.facilities_rating;
    varietySum += r.variety_rating;
    ageGroupCounts[r.age_group] += 1;
  }

  const count = ratings.length;
  const avg = (sum: number) => (count === 0 ? null : Math.round((sum / count) * 10) / 10);

  return {
    count,
    safety: avg(safetySum),
    facilities: avg(facilitiesSum),
    variety: avg(varietySum),
    ageGroupCounts,
  };
}

/** A star value is valid when it is a whole number from 1 to 5. */
export function isValidStars(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}
