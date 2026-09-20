-- =========================================================
-- TRICOACH COURSE PROFILE SEED
-- Copenhagen / Kalmar / Nice / The Championship
-- =========================================================
--
-- These races currently have no confirmed future edition date
-- stored in TriCoach.
--
-- We therefore create a "profile edition" with:
-- - edition_year = 0
-- - race_date = null
--
-- The API may use this row as course-profile context,
-- while the athlete chooses their actual race date in the UI.
-- =========================================================


-- ---------------------------------------------------------
-- IRONMAN COPENHAGEN
-- ---------------------------------------------------------

insert into public.race_editions (
  race_id,
  race_date,
  edition_year,
  swim,
  bike,
  run,
  data_quality,
  verified_fields,
  data_warning
)
select
  id,
  null,
  0,

  '{
    "distanceKm": 3.8,
    "environment": "Sea"
  }'::jsonb,

  '{
    "distanceKm": 180,
    "elevationGainM": null,
    "profile": "Rolling",
    "technicality": "Low"
  }'::jsonb,

  '{
    "distanceKm": 42.2,
    "elevationGainM": null,
    "profile": "Rolling",
    "surface": "Road"
  }'::jsonb,

  'Verified',

  '[
    "swim.distanceKm",
    "swim.environment",
    "bike.distanceKm",
    "bike.profile",
    "run.distanceKm",
    "run.profile",
    "run.surface"
  ]'::jsonb,

  'Exact elevation gain is not stored because the official course page does not currently publish a verified total.'

from public.races
where slug = 'ironman-copenhagen'

on conflict (race_id, edition_year)
do update set
  swim = excluded.swim,
  bike = excluded.bike,
  run = excluded.run,
  data_quality = excluded.data_quality,
  verified_fields = excluded.verified_fields,
  data_warning = excluded.data_warning;



-- ---------------------------------------------------------
-- IRONMAN KALMAR
-- ---------------------------------------------------------

insert into public.race_editions (
  race_id,
  race_date,
  edition_year,
  swim,
  bike,
  run,
  data_quality,
  verified_fields,
  data_warning
)
select
  id,
  null,
  0,

  '{
    "distanceKm": 3.8,
    "environment": "Sea"
  }'::jsonb,

  '{
    "distanceKm": 180,
    "elevationGainM": null,
    "profile": "Flat",
    "technicality": "Low"
  }'::jsonb,

  '{
    "distanceKm": 42.2,
    "elevationGainM": null,
    "profile": "Flat",
    "surface": "Road"
  }'::jsonb,

  'Verified',

  '[
    "swim.distanceKm",
    "swim.environment",
    "bike.distanceKm",
    "bike.profile",
    "run.distanceKm",
    "run.profile",
    "run.surface"
  ]'::jsonb,

  'Exact elevation gain is intentionally left blank until a verified organizer figure is available.'

from public.races
where slug = 'ironman-kalmar'

on conflict (race_id, edition_year)
do update set
  swim = excluded.swim,
  bike = excluded.bike,
  run = excluded.run,
  data_quality = excluded.data_quality,
  verified_fields = excluded.verified_fields,
  data_warning = excluded.data_warning;



-- ---------------------------------------------------------
-- IRONMAN 70.3 NICE
-- ---------------------------------------------------------

insert into public.race_editions (
  race_id,
  race_date,
  edition_year,
  swim,
  bike,
  run,
  data_quality,
  verified_fields,
  data_warning
)
select
  id,
  null,
  0,

  '{
    "distanceKm": 1.9,
    "environment": "Sea"
  }'::jsonb,

  '{
    "distanceKm": 90,
    "elevationGainM": null,
    "profile": "Hilly",
    "technicality": "High"
  }'::jsonb,

  '{
    "distanceKm": 21.1,
    "elevationGainM": null,
    "profile": "Flat",
    "surface": "Road"
  }'::jsonb,

  'Verified',

  '[
    "swim.distanceKm",
    "swim.environment",
    "bike.distanceKm",
    "bike.profile",
    "bike.technicality",
    "run.distanceKm",
    "run.profile",
    "run.surface",
    "major bike climb"
  ]'::jsonb,

  'Exact total elevation is not stored until a verified organizer total is available.'

from public.races
where slug = 'ironman-703-nice'

on conflict (race_id, edition_year)
do update set
  swim = excluded.swim,
  bike = excluded.bike,
  run = excluded.run,
  data_quality = excluded.data_quality,
  verified_fields = excluded.verified_fields,
  data_warning = excluded.data_warning;



-- ---------------------------------------------------------
-- THE CHAMPIONSHIP
-- ---------------------------------------------------------

