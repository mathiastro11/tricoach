-- =========================================================
-- BASSE — ATHLETE CAPABILITY PROFILE V1
-- =========================================================
--
-- Purpose:
--
-- Preserve the existing profiles.experience / swim_level /
-- bike_level / run_level columns as backwards-compatible
-- legacy fields.
--
-- The richer athlete capability model is stored separately
-- so Basse can represent advanced, elite and professional
-- athletes without depending on unknown legacy constraints.
--
-- Existing athletes require no migration of their values.
-- An empty object means "use legacy profile fields".
-- =========================================================

begin;


alter table public.profiles
  add column if not exists capability_profile jsonb
  not null
  default '{}'::jsonb;


comment on column public.profiles.capability_profile is
  'Basse athlete capability model. Empty object means use legacy experience and discipline-level fields as fallback.';


do $$
begin

  if not exists (
    select 1
    from pg_constraint
    where conname =
      'profiles_capability_profile_object_check'
      and conrelid =
        'public.profiles'::regclass
  ) then

    alter table public.profiles
      add constraint profiles_capability_profile_object_check
      check (
        jsonb_typeof(capability_profile) =
        'object'
      )
      not valid;

  end if;

end
$$;


alter table public.profiles
  validate constraint
    profiles_capability_profile_object_check;


commit;
