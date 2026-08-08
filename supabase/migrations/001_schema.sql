-- Lekeplass Rater: tables, constraints and Row Level Security.
-- Run this in the Supabase SQL Editor (or with `supabase db push`).

-- Age groups a rating can target. ASCII values keep code/API clean;
-- the app translates them to display names ("Småbarn (0–2 år)" etc.).
create type age_group as enum ('0_2', '3_6', '6_12');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table playgrounds (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  is_fenced boolean not null default false,
  winter_open boolean not null default false,
  -- Meters to nearest parking. NULL means "no parking nearby / unknown".
  -- (Replaces the earlier has_parking boolean: one field, no contradictions.)
  parking_distance_m integer check (parking_distance_m >= 0),
  has_shop_nearby boolean not null default false,
  has_restroom_nearby boolean not null default false,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table playground_images (
  id uuid primary key default gen_random_uuid(),
  playground_id uuid not null references playgrounds (id) on delete cascade,
  -- Path inside the 'playground-images' storage bucket (not a full URL),
  -- so the domain/CDN can change later without a data migration.
  storage_path text not null,
  uploaded_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table ratings (
  id uuid primary key default gen_random_uuid(),
  playground_id uuid not null references playgrounds (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  age_group age_group not null,
  safety_rating smallint not null check (safety_rating between 1 and 5),
  facilities_rating smallint not null check (facilities_rating between 1 and 5),
  variety_rating smallint not null check (variety_rating between 1 and 5),
  comment text check (char_length(comment) <= 2000),
  created_at timestamptz not null default now(),
  -- One rating per user per playground; submitting again updates the old one.
  unique (playground_id, user_id)
);

-- Common lookups: everything about one playground.
create index playground_images_playground_idx on playground_images (playground_id);
create index ratings_playground_idx on ratings (playground_id);
create index ratings_user_idx on ratings (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Reading is open (the map works without an account); writing requires login,
-- and only the owner can change or delete their own rows.
-- ---------------------------------------------------------------------------

alter table playgrounds enable row level security;
alter table playground_images enable row level security;
alter table ratings enable row level security;

-- playgrounds
create policy "playgrounds are readable by everyone"
  on playgrounds for select using (true);

create policy "authenticated users can add playgrounds"
  on playgrounds for insert to authenticated
  with check (created_by = auth.uid());

create policy "owners can update their playgrounds"
  on playgrounds for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "owners can delete their playgrounds"
  on playgrounds for delete to authenticated
  using (created_by = auth.uid());

-- playground_images
create policy "images are readable by everyone"
  on playground_images for select using (true);

create policy "authenticated users can add images"
  on playground_images for insert to authenticated
  with check (uploaded_by = auth.uid());

create policy "owners can delete their images"
  on playground_images for delete to authenticated
  using (uploaded_by = auth.uid());

-- ratings
create policy "ratings are readable by everyone"
  on ratings for select using (true);

create policy "authenticated users can add ratings"
  on ratings for insert to authenticated
  with check (user_id = auth.uid());

create policy "owners can update their ratings"
  on ratings for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "owners can delete their ratings"
  on ratings for delete to authenticated
  using (user_id = auth.uid());
