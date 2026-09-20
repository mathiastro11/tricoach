-- =========================================================
-- TRICOACH RACE DATABASE V1
-- =========================================================
--
-- Creates an isolated race catalog.
--
-- Existing tables such as profiles and training_state
-- are NOT modified.
-- =========================================================


create extension if not exists pgcrypto;


-- =========================================================
-- RACES
-- One row = one race identity
-- Example: Norseman Xtreme Triathlon
-- =========================================================

create table if not exists public.races (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique,

  name text not null,
  short_name text not null,

  location text,
  country text,
  country_code text,

  series text not null default 'Independent',

  format text not null,

  emoji text,

  data_quality text not null default 'Partial',

  characteristics jsonb not null default '[]'::jsonb,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint races_series_check
    check (
      series in (
        'XTRI',
        'IRONMAN',
        'Challenge',
        'Independent'
      )
    ),

  constraint races_format_check
    check (
      format in (
        'Sprint',
        'Olympic',
        '70.3',
        'Ironman',
        'Other'
      )
    ),

  constraint races_quality_check
    check (
      data_quality in (
        'Verified',
        'Partial'
      )
    )
);


create index if not exists races_name_idx
  on public.races (name);

create index if not exists races_country_code_idx
  on public.races (country_code);

create index if not exists races_series_idx
  on public.races (series);

create index if not exists races_format_idx
  on public.races (format);



-- =========================================================
-- RACE EDITIONS
-- One row = one specific edition/year
--
-- Example:
-- Norseman 2027
-- =========================================================

create table if not exists public.race_editions (
  id uuid primary key default gen_random_uuid(),

  race_id uuid not null
    references public.races(id)
    on delete cascade,

  race_date date,

  edition_year integer,

  registration_url text,

  status text not null default 'Scheduled',

  swim jsonb,
  bike jsonb,
  run jsonb,

  /*
    Optional edition-specific characteristics.

    Example:
    course changed in 2028,
    unusual race location,
    temporary route change.
  */
  characteristics jsonb not null default '[]'::jsonb,

  data_quality text not null default 'Partial',

  verified_fields jsonb not null default '[]'::jsonb,

  data_warning text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint race_editions_status_check
    check (
      status in (
        'Scheduled',
        'Completed',
        'Cancelled',
        'Unknown'
      )
    ),

  constraint race_editions_quality_check
    check (
      data_quality in (
        'Verified',
        'Partial'
      )
    ),

  constraint race_editions_unique_year
    unique (
      race_id,
      edition_year
    )
);


create index if not exists race_editions_race_id_idx
  on public.race_editions (race_id);

create index if not exists race_editions_date_idx
  on public.race_editions (race_date);



-- =========================================================
-- RACE SOURCES
-- Provenance / verification metadata
-- =========================================================

create table if not exists public.race_sources (
  id uuid primary key default gen_random_uuid(),

  race_id uuid not null
    references public.races(id)
    on delete cascade,

  race_edition_id uuid
    references public.race_editions(id)
    on delete cascade,

  source_name text not null,

  source_url text,

  source_type text not null default 'Official',

  /*
    Which fields this source supports.

    Example:
    [
      "race_date",
      "bike.distanceKm",
      "bike.elevationGainM"
    ]
  */
  supports_fields jsonb not null default '[]'::jsonb,

  last_verified_at timestamptz,

  created_at timestamptz not null default now(),

  constraint race_sources_type_check
    check (
      source_type in (
        'Official',
        'Organizer',
        'Federation',
        'Trusted third party',
        'Other'
      )
    )
);


create index if not exists race_sources_race_id_idx
  on public.race_sources (race_id);

create index if not exists race_sources_edition_idx
  on public.race_sources (race_edition_id);



-- =========================================================
-- UPDATED_AT TRIGGER
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


drop trigger if exists races_set_updated_at
  on public.races;

create trigger races_set_updated_at
before update on public.races
for each row
execute function public.set_updated_at();


drop trigger if exists race_editions_set_updated_at
  on public.race_editions;

create trigger race_editions_set_updated_at
before update on public.race_editions
for each row
execute function public.set_updated_at();



-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
--
-- Race catalog is globally readable.
-- Client-side writes are NOT allowed.
--
-- Future imports/admin jobs should use a secure server-side
-- service role rather than allowing athletes to modify the
-- shared race database.
-- =========================================================

alter table public.races
  enable row level security;

alter table public.race_editions
  enable row level security;

alter table public.race_sources
  enable row level security;


drop policy if exists
  "Race catalog is publicly readable"
  on public.races;

create policy
  "Race catalog is publicly readable"
on public.races
for select
using (true);


drop policy if exists
  "Race editions are publicly readable"
  on public.race_editions;

create policy
  "Race editions are publicly readable"
on public.race_editions
for select
using (true);


drop policy if exists
  "Race sources are publicly readable"
  on public.race_sources;

create policy
  "Race sources are publicly readable"
on public.race_sources
for select
using (true);
