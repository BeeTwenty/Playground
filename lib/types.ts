// Shared TypeScript types describing the rows in our Supabase tables.
// If you change the database schema, update these types to match.

/** Age groups a rating can target. Stored as an enum in Postgres. */
export type AgeGroup = '0_2' | '3_6' | '6_12';

export const AGE_GROUPS: AgeGroup[] = ['0_2', '3_6', '6_12'];

/** One playground, as stored in the `playgrounds` table. */
export interface Playground {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  is_fenced: boolean;
  winter_open: boolean;
  /** Distance to nearest parking in meters. null = no parking info / no parking. */
  parking_distance_m: number | null;
  has_shop_nearby: boolean;
  has_restroom_nearby: boolean;
  created_by: string;
  created_at: string;
}

/** Values needed to create a playground (id/created_* are filled by the DB). */
export type NewPlayground = Omit<Playground, 'id' | 'created_by' | 'created_at'>;

/** One uploaded photo, as stored in the `playground_images` table. */
export interface PlaygroundImage {
  id: string;
  playground_id: string;
  /**
   * Path inside the `playground-images` storage bucket (not a full URL).
   * Storing the path keeps us free to change domain/CDN later.
   */
  storage_path: string;
  uploaded_by: string;
  created_at: string;
}

/** One user's rating of a playground, as stored in the `ratings` table. */
export interface Rating {
  id: string;
  playground_id: string;
  user_id: string;
  age_group: AgeGroup;
  safety_rating: number;
  facilities_rating: number;
  variety_rating: number;
  comment: string | null;
  created_at: string;
}
