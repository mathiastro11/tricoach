/*
  ============================================================
  BASSE — CROSS-DEVICE TRAINING CONTEXT
  ============================================================

  Next Week and Calendar availability were historically stored
  only in localStorage.

  Persist them in training_state so an authenticated athlete
  sees the same planning context across phone, tablet and a
  restored/reinstalled app.
*/

alter table public.training_state
  add column if not exists next_week_preview jsonb,
  add column if not exists training_availability jsonb
    not null default '[]'::jsonb;


/*
  Preserve the expected JSON shapes at the database boundary.
*/

do $$
begin

  if not exists (
    select 1
    from pg_constraint
    where conname =
      'training_state_next_week_preview_object_check'
      and conrelid =
        'public.training_state'::regclass
  ) then

    alter table public.training_state
      add constraint
        training_state_next_week_preview_object_check
      check (
        next_week_preview is null
        or jsonb_typeof(next_week_preview) = 'object'
      );

  end if;


  if not exists (
    select 1
    from pg_constraint
    where conname =
      'training_state_training_availability_array_check'
      and conrelid =
        'public.training_state'::regclass
  ) then

    alter table public.training_state
      add constraint
        training_state_training_availability_array_check
      check (
        jsonb_typeof(training_availability) = 'array'
      );

  end if;

end
$$;
