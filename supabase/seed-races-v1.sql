-- =========================================================
-- TRICOACH FEATURED RACES — SEED V1
-- =========================================================
-- Safe to run repeatedly.
-- Existing races are matched by slug.
-- =========================================================


-- ---------------------------------------------------------
-- 1. NORSEMAN
-- ---------------------------------------------------------

insert into public.races (
  slug,
  name,
  short_name,
  location,
  country,
  country_code,
  series,
  format,
  emoji,
  data_quality,
  characteristics,
  notes
)
values (
  'norseman',
  'Norseman Xtreme Triathlon',
  'Norseman',
  'Eidfjord → Gausta, Norway',
  'Norway',
  'NO',
  'XTRI',
  'Ironman',
  '🇳🇴',
  'Verified',
  '[
    "Cold-water fjord swim",
    "3,000+ m bike climbing",
    "5,000+ m total elevation",
    "Long sustained climbing",
    "Technical descending",
    "Final mountain run",
    "Support-team logistics",
    "Long-course fueling",
    "Extreme weather exposure"
  ]'::jsonb,
  'Verified race profile based on published Norseman / XTRI information.'
)
on conflict (slug)
do update set
  name = excluded.name,
  short_name = excluded.short_name,
  location = excluded.location,
  country = excluded.country,
  country_code = excluded.country_code,
  series = excluded.series,
  format = excluded.format,
  emoji = excluded.emoji,
  data_quality = excluded.data_quality,
  characteristics = excluded.characteristics,
  notes = excluded.notes;


insert into public.race_editions (
  race_id,
  race_date,
  edition_year,
  swim,
  bike,
  run,
  data_quality,
  verified_fields
)
select
  id,
  '2027-08-07',
  2027,

  '{
    "distanceKm": 3.8,
    "environment": "Fjord",
    "wetsuitLikely": true
  }'::jsonb,

  '{
    "distanceKm": 180,
    "elevationGainM": 3000,
    "elevationDisplay": "3,000+ m",
    "profile": "Mountainous",
    "technicality": "High"
  }'::jsonb,

  '{
    "distanceKm": 42.2,
    "elevationGainM": 1800,
    "elevationDisplay": "~1,800 m",
    "profile": "Mountainous",
    "surface": "Mixed"
  }'::jsonb,

  'Verified',

  '[
    "race_date",
    "swim.distanceKm",
    "swim.environment",
    "bike.distanceKm",
    "bike.elevationGainM",
    "bike.profile",
    "run.distanceKm",
    "run.elevationGainM",
    "run.profile"
  ]'::jsonb

from public.races
where slug = 'norseman'

on conflict (race_id, edition_year)
do update set
  race_date = excluded.race_date,
  swim = excluded.swim,
  bike = excluded.bike,
  run = excluded.run,
  data_quality = excluded.data_quality,
  verified_fields = excluded.verified_fields;



-- ---------------------------------------------------------
-- 2. CHALLENGE ROTH
-- ---------------------------------------------------------

insert into public.races (
  slug, name, short_name, location,
  country, country_code, series, format,
  emoji, data_quality, characteristics, notes
)
values (
  'challenge-roth',
  'DATEV Challenge Roth',
  'Challenge Roth',
  'Roth, Germany',
  'Germany',
  'DE',
  'Challenge',
  'Ironman',
  '🇩🇪',
  'Verified',
  '[
    "Fast long-course racing",
    "Rolling bike course",
    "Solar Hill",
    "Canal swim",
    "High spectator density",
    "Long-course fueling"
  ]'::jsonb,
  'Verified Challenge Roth race profile.'
)
on conflict (slug)
do update set
  name = excluded.name,
  short_name = excluded.short_name,
  location = excluded.location,
  country = excluded.country,
  country_code = excluded.country_code,
  series = excluded.series,
  format = excluded.format,
  emoji = excluded.emoji,
  data_quality = excluded.data_quality,
  characteristics = excluded.characteristics,
  notes = excluded.notes;


insert into public.race_editions (
  race_id, race_date, edition_year,
  swim, bike, run,
  data_quality, verified_fields
)
select
  id,
  '2027-07-04',
  2027,

  '{
    "distanceKm": 3.8,
    "environment": "River"
  }'::jsonb,

  '{
    "distanceKm": 180,
    "elevationGainM": 1500,
    "elevationDisplay": "~1,500 m",
    "profile": "Rolling",
    "technicality": "Moderate"
  }'::jsonb,

  '{
    "distanceKm": 42.2,
    "profile": "Rolling",
    "surface": "Road"
  }'::jsonb,

  'Verified',

  '[
    "race_date",
    "course_distances",
    "bike.elevationGainM",
    "course_character"
  ]'::jsonb

from public.races
where slug = 'challenge-roth'

on conflict (race_id, edition_year)
do update set
  race_date = excluded.race_date,
  swim = excluded.swim,
  bike = excluded.bike,
  run = excluded.run,
  data_quality = excluded.data_quality,
  verified_fields = excluded.verified_fields;



-- ---------------------------------------------------------
-- 3. CELTMAN
-- ---------------------------------------------------------

insert into public.races (
  slug, name, short_name, location,
  country, country_code, series, format,
  emoji, data_quality, characteristics
)
values (
  'celtman',
  'CELTMAN! Extreme Scottish Triathlon',
  'CELTMAN!',
  'Torridon, Scotland',
  'United Kingdom',
  'GB',
  'XTRI',
  'Ironman',
  '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Verified',
  '[
    "Cold Atlantic swim",
    "Long 200 km bike",
    "Highland weather",
    "Mountain trail run",
    "Two Munros",
    "Technical terrain",
    "Extreme-course durability"
  ]'::jsonb
)
on conflict (slug)
do update set
  name = excluded.name,
  short_name = excluded.short_name,
  location = excluded.location,
  country = excluded.country,
  country_code = excluded.country_code,
  series = excluded.series,
  format = excluded.format,
  emoji = excluded.emoji,
  data_quality = excluded.data_quality,
  characteristics = excluded.characteristics;


insert into public.race_editions (
  race_id, race_date, edition_year,
  swim, bike, run,
  data_quality, verified_fields
)
select
  id,
  '2027-06-12',
  2027,

  '{
    "distanceKm": 3.4,
    "environment": "Sea"
  }'::jsonb,

  '{
    "distanceKm": 200,
    "elevationGainM": 2200,
    "elevationDisplay": "2,200 m",
    "profile": "Mountainous",
    "technicality": "High"
  }'::jsonb,

  '{
    "distanceKm": 42,
    "elevationGainM": 1600,
    "elevationDisplay": "1,600 m",
    "profile": "Mountainous",
    "surface": "Trail"
  }'::jsonb,

  'Verified',
  '["race_date","course_distances","bike.elevationGainM","run.elevationGainM"]'::jsonb

from public.races
where slug = 'celtman'

on conflict (race_id, edition_year)
do update set
  race_date = excluded.race_date,
  swim = excluded.swim,
  bike = excluded.bike,
  run = excluded.run,
  data_quality = excluded.data_quality,
  verified_fields = excluded.verified_fields;



-- ---------------------------------------------------------
-- 4. SWEDEMAN
-- ---------------------------------------------------------

insert into public.races (
  slug, name, short_name, location,
  country, country_code, series, format,
  emoji, data_quality, characteristics
)
values (
  'swedeman',
  'Swedeman Xtreme Triathlon',
  'Swedeman',
  'Åre, Sweden',
  'Sweden',
  'SE',
  'XTRI',
  'Ironman',
  '🇸🇪',
  'Verified',
  '[
    "Cold-water swim",
    "205 km bike",
    "Repeated climbing",
    "Åreskutan mountain run",
    "99% trail run",
    "Extreme-course durability",
    "Variable Nordic weather"
  ]'::jsonb
)
on conflict (slug)
do update set
  name = excluded.name,
  short_name = excluded.short_name,
  location = excluded.location,
  country = excluded.country,
  country_code = excluded.country_code,
  series = excluded.series,
  format = excluded.format,
  emoji = excluded.emoji,
  data_quality = excluded.data_quality,
  characteristics = excluded.characteristics;


insert into public.race_editions (
  race_id, race_date, edition_year,
  swim, bike, run,
  data_quality, verified_fields
)
select
  id,
  '2027-07-03',
  2027,

  '{
    "distanceKm": 3.8,
    "environment": "Lake",
    "expectedWaterTempC": 13,
    "wetsuitLikely": true
  }'::jsonb,

  '{
    "distanceKm": 205,
    "elevationGainM": 2377,
    "elevationDisplay": "2,377 m",
    "profile": "Mountainous",
    "technicality": "High"
  }'::jsonb,

  '{
    "distanceKm": 43,
    "elevationGainM": 1700,
    "elevationDisplay": "1,700 m",
    "profile": "Mountainous",
    "surface": "Trail"
  }'::jsonb,

  'Verified',
  '["race_date","course_distances","bike.elevationGainM","run.elevationGainM"]'::jsonb

from public.races
where slug = 'swedeman'

on conflict (race_id, edition_year)
do update set
  race_date = excluded.race_date,
  swim = excluded.swim,
  bike = excluded.bike,
  run = excluded.run,
  data_quality = excluded.data_quality,
  verified_fields = excluded.verified_fields;



-- ---------------------------------------------------------
-- 5. HIMALAYAN XTRI
-- ---------------------------------------------------------

insert into public.races (
  slug, name, short_name, location,
  country, country_code, series, format,
  emoji, data_quality, characteristics
)
values (
  'himalayan-xtri',
  'Himalayan XTRI',
  'Himalayan',
  'Nepal',
  'Nepal',
  'NP',
  'XTRI',
  'Ironman',
  '🇳🇵',
  'Verified',
  '[
    "Altitude exposure",
    "Night swim",
    "3,600 m bike climbing",
    "3,000 m run climbing",
    "High-altitude run",
    "Remote terrain",
    "Extreme-course durability"
  ]'::jsonb
)
on conflict (slug)
do update set
  name = excluded.name,
  short_name = excluded.short_name,
  location = excluded.location,
  country = excluded.country,
  country_code = excluded.country_code,
  series = excluded.series,
  format = excluded.format,
  emoji = excluded.emoji,
  data_quality = excluded.data_quality,
  characteristics = excluded.characteristics;


insert into public.race_editions (
  race_id, race_date, edition_year,
  swim, bike, run,
  data_quality, verified_fields
)
select
  id,
  '2027-05-08',
  2027,

  '{"distanceKm":3.8,"environment":"Lake"}'::jsonb,

  '{
    "distanceKm":176,
    "elevationGainM":3600,
    "elevationDisplay":"3,600 m",
    "profile":"Mountainous",
    "technicality":"High"
  }'::jsonb,

  '{
    "distanceKm":42.4,
    "elevationGainM":3000,
    "elevationDisplay":"3,000 m",
    "profile":"Mountainous",
    "surface":"Trail"
  }'::jsonb,

  'Verified',
  '["race_date","course_distances","bike.elevationGainM","run.elevationGainM"]'::jsonb

from public.races
where slug = 'himalayan-xtri'

on conflict (race_id, edition_year)
do update set
  race_date = excluded.race_date,
  swim = excluded.swim,
  bike = excluded.bike,
  run = excluded.run,
  data_quality = excluded.data_quality,
  verified_fields = excluded.verified_fields;



-- ---------------------------------------------------------
-- 6. CHIBCHI FISHA
-- ---------------------------------------------------------

insert into public.races (
  slug, name, short_name, location,
  country, country_code, series, format,
  emoji, data_quality, characteristics
)
values (
  'chibchi-fisha',
  'Chibchi Fisha Xtreme Colombia',
  'Chibchi Fisha',
  'Lake Tota / Colombian Andes',
  'Colombia',
  'CO',
  'XTRI',
  'Ironman',
  '🇨🇴',
  'Verified',
  '[
    "High-altitude swim",
    "Cold water",
    "Andean altitude",
    "3,200 m bike climbing",
    "2,000 m run climbing",
    "Mountain terrain",
    "Altitude adaptation"
  ]'::jsonb
)
on conflict (slug)
do update set
  name = excluded.name,
  short_name = excluded.short_name,
  location = excluded.location,
  country = excluded.country,
  country_code = excluded.country_code,
  series = excluded.series,
  format = excluded.format,
  emoji = excluded.emoji,
  data_quality = excluded.data_quality,
  characteristics = excluded.characteristics;


insert into public.race_editions (
  race_id, race_date, edition_year,
  swim, bike, run,
  data_quality, verified_fields
)
select
  id,
  '2027-01-30',
  2027,

  '{"distanceKm":3.0,"environment":"Lake"}'::jsonb,

  '{
    "distanceKm":185,
    "elevationGainM":3200,
    "elevationDisplay":"3,200 m",
    "profile":"Mountainous",
    "technicality":"High"
  }'::jsonb,

  '{
    "distanceKm":43,
    "elevationGainM":2000,
    "elevationDisplay":"2,000 m",
    "profile":"Mountainous",
    "surface":"Trail"
  }'::jsonb,

  'Verified',
  '["race_date","course_distances","bike.elevationGainM","run.elevationGainM"]'::jsonb

from public.races
where slug = 'chibchi-fisha'

on conflict (race_id, edition_year)
do update set
  race_date = excluded.race_date,
  swim = excluded.swim,
  bike = excluded.bike,
  run = excluded.run,
  data_quality = excluded.data_quality,
  verified_fields = excluded.verified_fields;



-- ---------------------------------------------------------
-- 7. IRONMAN COPENHAGEN
-- ---------------------------------------------------------

insert into public.races (
  slug, name, short_name, location,
  country, country_code, series, format,
  emoji, data_quality, characteristics, notes
)
values (
  'ironman-copenhagen',
  'IRONMAN Copenhagen',
  'IRONMAN Copenhagen',
  'Copenhagen, Denmark',
  'Denmark',
  'DK',
  'IRONMAN',
  'Ironman',
  '🇩🇰',
  'Verified',
  '[
    "Calm lagoon swim",
    "Rolling bike course",
    "Fast city racing",
    "Urban marathon",
    "Long-course fueling",
    "Aero-position durability"
  ]'::jsonb,
  'Exact elevation intentionally omitted until a verified organizer total is available.'
)
on conflict (slug)
do update set
  name = excluded.name,
  short_name = excluded.short_name,
  location = excluded.location,
  country = excluded.country,
  country_code = excluded.country_code,
  series = excluded.series,
  format = excluded.format,
  emoji = excluded.emoji,
  data_quality = excluded.data_quality,
  characteristics = excluded.characteristics,
  notes = excluded.notes;



-- ---------------------------------------------------------
-- 8. IRONMAN KALMAR
-- ---------------------------------------------------------

insert into public.races (
  slug, name, short_name, location,
  country, country_code, series, format,
  emoji, data_quality, characteristics, notes
)
values (
  'ironman-kalmar',
  'IRONMAN Kalmar-Sweden',
  'IRONMAN Kalmar',
  'Kalmar, Sweden',
  'Sweden',
  'SE',
  'IRONMAN',
  'Ironman',
  '🇸🇪',
  'Verified',
  '[
    "Baltic Sea swim",
    "Flat bike course",
    "Öland bridge",
    "Wind exposure",
    "Flat run",
    "Long-course fueling",
    "Fast-course pacing"
  ]'::jsonb,
  'Exact elevation intentionally omitted until a verified organizer total is available.'
)
on conflict (slug)
do update set
  characteristics = excluded.characteristics,
  notes = excluded.notes;



-- ---------------------------------------------------------
-- 9. IRONMAN 70.3 NICE
-- ---------------------------------------------------------

insert into public.races (
  slug, name, short_name, location,
  country, country_code, series, format,
  emoji, data_quality, characteristics, notes
)
values (
  'ironman-703-nice',
  'IRONMAN 70.3 Nice',
  '70.3 Nice',
  'Nice, France',
  'France',
  'FR',
  'IRONMAN',
  '70.3',
  '🇫🇷',
  'Verified',
  '[
    "Mediterranean swim",
    "Hilly bike course",
    "Col de Vence",
    "Long climbing",
    "Technical descending",
    "Flat coastal run",
    "Heat exposure",
    "70.3 fueling"
  ]'::jsonb,
  'Exact total elevation intentionally omitted until a verified organizer total is available.'
)
on conflict (slug)
do update set
  characteristics = excluded.characteristics,
  notes = excluded.notes;



-- ---------------------------------------------------------
-- 11. IRONMAN 70.3 DALLAS — LITTLE ELM
-- ---------------------------------------------------------

insert into public.races (
  slug, name, short_name, location,
  country, country_code, series, format,
  emoji, data_quality, characteristics
)
values (
  'ironman-703-dallas-little-elm',
  'IRONMAN 70.3 Dallas–Little Elm',
  '70.3 Dallas–Little Elm',
  'Little Elm, Texas, USA',
  'United States',
  'US',
  'IRONMAN',
  '70.3',
  '🇺🇸',
  'Verified',
  '[
    "Lake swim",
    "Likely wetsuit conditions",
    "Gently rolling bike",
    "Fast bike course",
    "Flat run",
    "Hard-packed gravel run",
    "70.3 fueling"
  ]'::jsonb
)
on conflict (slug)
do update set
  characteristics = excluded.characteristics;


insert into public.race_editions (
  race_id, race_date, edition_year,
  swim, bike, run,
  data_quality, verified_fields
)
select
  id,
  '2027-03-14',
  2027,

  '{
    "distanceKm":1.9,
    "environment":"Lake",
    "expectedWaterTempC":16,
    "wetsuitLikely":true
  }'::jsonb,

  '{
    "distanceKm":90.1,
    "elevationGainM":427,
    "elevationDisplay":"~427 m",
    "profile":"Rolling",
    "technicality":"Low"
  }'::jsonb,

  '{
    "distanceKm":21.1,
    "profile":"Flat",
    "surface":"Trail"
  }'::jsonb,

  'Verified',
  '["race_date","course_distances","bike.elevationGainM","course_character"]'::jsonb

from public.races
where slug = 'ironman-703-dallas-little-elm'

on conflict (race_id, edition_year)
do update set
  race_date = excluded.race_date,
  swim = excluded.swim,
  bike = excluded.bike,
  run = excluded.run,
  data_quality = excluded.data_quality,
  verified_fields = excluded.verified_fields;
