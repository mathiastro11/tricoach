/*
  BASSE USER DATA SECURITY V1

  Canonical schema, privileges and Row Level Security for:
  - profiles
  - training_state
  - app_feedback

  This migration is intentionally idempotent and preserves existing rows.
  Existing policies are removed inside the transaction before the exact
  least-privilege policy set is installed.
*/

begin;


/*
  ========================================================
  TABLES AND APPLICATION COLUMNS
  ========================================================
*/

create table if not exists public.profiles (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,
  name text,
  goal text,
  race_date date,
  target_race jsonb,
  hours_per_week double precision,
  weakest_discipline text,
  experience text,
  capability_profile jsonb
    default '{}'::jsonb,
  current_training_hours double precision,
  swim_level text,
  bike_level text,
  run_level text,
  available_days text[],
  longest_session_minutes integer,
  pool_access boolean,
  indoor_trainer boolean,
  gym_access boolean,
  limitations text,
  updated_at timestamptz
    not null default now()
);

alter table public.profiles
  add column if not exists user_id uuid,
  add column if not exists name text,
  add column if not exists goal text,
  add column if not exists race_date date,
  add column if not exists target_race jsonb,
  add column if not exists hours_per_week double precision,
  add column if not exists weakest_discipline text,
  add column if not exists experience text,
  add column if not exists capability_profile jsonb default '{}'::jsonb,
  add column if not exists current_training_hours double precision,
  add column if not exists swim_level text,
  add column if not exists bike_level text,
  add column if not exists run_level text,
  add column if not exists available_days text[],
  add column if not exists longest_session_minutes integer,
  add column if not exists pool_access boolean,
  add column if not exists indoor_trainer boolean,
  add column if not exists gym_access boolean,
  add column if not exists limitations text,
  add column if not exists updated_at timestamptz default now();


create table if not exists public.training_state (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,
  active_plan jsonb,
  workout_history jsonb
    not null default '[]'::jsonb,
  plan_history jsonb
    not null default '[]'::jsonb,
  training_archive jsonb
    not null default '[]'::jsonb,
  season_roadmap jsonb,
  roadmap_revisions jsonb
    not null default '[]'::jsonb,
  readiness_history jsonb
    not null default '[]'::jsonb,
  weekly_review jsonb,
  updated_at timestamptz
    not null default now()
);

alter table public.training_state
  add column if not exists user_id uuid,
  add column if not exists active_plan jsonb,
  add column if not exists workout_history jsonb default '[]'::jsonb,
  add column if not exists plan_history jsonb default '[]'::jsonb,
  add column if not exists training_archive jsonb default '[]'::jsonb,
  add column if not exists season_roadmap jsonb,
  add column if not exists roadmap_revisions jsonb default '[]'::jsonb,
  add column if not exists readiness_history jsonb default '[]'::jsonb,
  add column if not exists weekly_review jsonb,
  add column if not exists updated_at timestamptz default now();


create table if not exists public.app_feedback (
  id uuid primary key
    default gen_random_uuid(),
  user_id uuid
    references auth.users(id)
    on delete cascade,
  category text,
  message text,
  contact_email text,
  page_context text,
  metadata jsonb
    not null default '{}'::jsonb,
  created_at timestamptz
    not null default now()
);

alter table public.app_feedback
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists user_id uuid,
  add column if not exists category text,
  add column if not exists message text,
  add column if not exists contact_email text,
  add column if not exists page_context text,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now();


/*
  UPSERT requires one unique user row.
*/

create unique index if not exists
  basse_profiles_user_id_uidx
  on public.profiles(user_id);

create unique index if not exists
  basse_training_state_user_id_uidx
  on public.training_state(user_id);

create index if not exists
  basse_app_feedback_user_id_idx
  on public.app_feedback(user_id);

create index if not exists
  basse_app_feedback_created_at_idx
  on public.app_feedback(created_at desc);


/*
  Ensure existing tables also receive auth.users integrity.
  If historical orphan rows exist, the migration fails and
  rolls back rather than silently accepting unsafe data.
*/

do $$
begin

  if not exists (
    select 1
    from pg_constraint
    where conname =
      'basse_profiles_user_id_fk'
      and conrelid =
        'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint
        basse_profiles_user_id_fk
      foreign key (user_id)
      references auth.users(id)
      on delete cascade;
  end if;


  if not exists (
    select 1
    from pg_constraint
    where conname =
      'basse_training_state_user_id_fk'
      and conrelid =
        'public.training_state'::regclass
  ) then
    alter table public.training_state
      add constraint
        basse_training_state_user_id_fk
      foreign key (user_id)
      references auth.users(id)
      on delete cascade;
  end if;


  if not exists (
    select 1
    from pg_constraint
    where conname =
      'basse_app_feedback_user_id_fk'
      and conrelid =
        'public.app_feedback'::regclass
  ) then
    alter table public.app_feedback
      add constraint
        basse_app_feedback_user_id_fk
      foreign key (user_id)
      references auth.users(id)
      on delete cascade;
  end if;

end
$$;


/*
  ========================================================
  REMOVE UNKNOWN LEGACY POLICIES
  ========================================================

  PostgreSQL combines permissive policies with OR.
  Retaining an old broad policy could therefore defeat
  a new restrictive policy.
*/

do $$
declare
  policy_row record;
begin

  for policy_row in
    select
      schemaname,
      tablename,
      policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'profiles',
        'training_state',
        'app_feedback'
      )
  loop
    execute format(
      'drop policy %I on %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  end loop;

end
$$;


/*
  ========================================================
  PRIVILEGES AND ROW LEVEL SECURITY
  ========================================================
*/

alter table public.profiles
  enable row level security;

alter table public.training_state
  enable row level security;

alter table public.app_feedback
  enable row level security;


revoke all
  on table public.profiles
  from anon, authenticated;

revoke all
  on table public.training_state
  from anon, authenticated;

revoke all
  on table public.app_feedback
  from anon, authenticated;


grant
  select,
  insert,
  update,
  delete
  on table public.profiles
  to authenticated;

grant
  select,
  insert,
  update,
  delete
  on table public.training_state
  to authenticated;

grant
  insert
  on table public.app_feedback
  to authenticated;


/*
  ========================================================
  PROFILES — OWNER-ONLY ACCESS
  ========================================================
*/

create policy
  "profiles_select_own"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) =
  user_id
);

create policy
  "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (
  (select auth.uid()) =
  user_id
);

create policy
  "profiles_update_own"
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) =
  user_id
)
with check (
  (select auth.uid()) =
  user_id
);

create policy
  "profiles_delete_own"
on public.profiles
for delete
to authenticated
using (
  (select auth.uid()) =
  user_id
);


/*
  ========================================================
  TRAINING STATE — OWNER-ONLY ACCESS
  ========================================================
*/

create policy
  "training_state_select_own"
on public.training_state
for select
to authenticated
using (
  (select auth.uid()) =
  user_id
);

create policy
  "training_state_insert_own"
on public.training_state
for insert
to authenticated
with check (
  (select auth.uid()) =
  user_id
);

create policy
  "training_state_update_own"
on public.training_state
for update
to authenticated
using (
  (select auth.uid()) =
  user_id
)
with check (
  (select auth.uid()) =
  user_id
);

create policy
  "training_state_delete_own"
on public.training_state
for delete
to authenticated
using (
  (select auth.uid()) =
  user_id
);


/*
  ========================================================
  FEEDBACK — AUTHENTICATED INSERT ONLY
  ========================================================

  Athletes may submit feedback for themselves.
  They cannot browse feedback rows through the Data API.
  Administrative service-role access continues to bypass RLS.
*/

create policy
  "app_feedback_insert_own"
on public.app_feedback
for insert
to authenticated
with check (
  (select auth.uid()) =
  user_id
);


commit;
