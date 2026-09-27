create table if not exists public.ai_rate_limit_buckets (
  user_id uuid not null
    references auth.users(id)
    on delete cascade,
  bucket text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 0
    check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, bucket)
);

alter table public.ai_rate_limit_buckets
  enable row level security;

revoke all
  on table public.ai_rate_limit_buckets
  from public, anon, authenticated;

create index if not exists
  ai_rate_limit_buckets_updated_at_idx
  on public.ai_rate_limit_buckets(updated_at);


create or replace function public.consume_ai_rate_limit(
  p_user_id uuid,
  p_route text,
  p_route_limit integer,
  p_route_window_seconds integer,
  p_daily_limit integer,
  p_daily_window_seconds integer default 86400
)
returns table (
  allowed boolean,
  route_remaining integer,
  daily_remaining integer,
  retry_after_seconds integer,
  route_limit integer,
  daily_limit integer
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_now timestamptz := clock_timestamp();
  v_route_bucket text := 'route:' || p_route;
  v_daily_bucket text := 'daily:ai';
  v_route_started_at timestamptz;
  v_daily_started_at timestamptz;
  v_route_count integer;
  v_daily_count integer;
  v_allowed boolean;
  v_retry_after integer := 0;
  v_candidate_retry integer;
begin
  if p_user_id is null then
    raise exception
      'A verified user id is required.'
      using errcode = '22023';
  end if;

  if p_route not in (
    'coach',
    'goal-change-week',
    'next-week',
    'plan',
    'roadmap'
  ) then
    raise exception
      'Unsupported AI rate-limit route.'
      using errcode = '22023';
  end if;

  if
    p_route_limit <= 0 or
    p_route_window_seconds <= 0 or
    p_daily_limit <= 0 or
    p_daily_window_seconds <= 0
  then
    raise exception
      'Rate-limit values must be positive.'
      using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      p_user_id::text,
      0
    )
  );

  insert into public.ai_rate_limit_buckets as stored (
    user_id,
    bucket,
    window_started_at,
    request_count,
    updated_at
  )
  values (
    p_user_id,
    v_route_bucket,
    v_now,
    0,
    v_now
  )
  on conflict (user_id, bucket)
  do update set
    window_started_at =
      case
        when
          stored.window_started_at +
          p_route_window_seconds *
          interval '1 second' <= v_now
        then v_now
        else stored.window_started_at
      end,
    request_count =
      case
        when
          stored.window_started_at +
          p_route_window_seconds *
          interval '1 second' <= v_now
        then 0
        else stored.request_count
      end,
    updated_at = v_now;

  insert into public.ai_rate_limit_buckets as stored (
    user_id,
    bucket,
    window_started_at,
    request_count,
    updated_at
  )
  values (
    p_user_id,
    v_daily_bucket,
    v_now,
    0,
    v_now
  )
  on conflict (user_id, bucket)
  do update set
    window_started_at =
      case
        when
          stored.window_started_at +
          p_daily_window_seconds *
          interval '1 second' <= v_now
        then v_now
        else stored.window_started_at
      end,
    request_count =
      case
        when
          stored.window_started_at +
          p_daily_window_seconds *
          interval '1 second' <= v_now
        then 0
        else stored.request_count
      end,
    updated_at = v_now;

  select
    stored.window_started_at,
    stored.request_count
  into
    v_route_started_at,
    v_route_count
  from public.ai_rate_limit_buckets as stored
  where
    stored.user_id = p_user_id and
    stored.bucket = v_route_bucket
  for update;

  select
    stored.window_started_at,
    stored.request_count
  into
    v_daily_started_at,
    v_daily_count
  from public.ai_rate_limit_buckets as stored
  where
    stored.user_id = p_user_id and
    stored.bucket = v_daily_bucket
  for update;

  v_allowed :=
    v_route_count < p_route_limit and
    v_daily_count < p_daily_limit;

  if v_allowed then
    update public.ai_rate_limit_buckets as stored
    set
      request_count =
        stored.request_count + 1,
      updated_at =
        v_now
    where
      stored.user_id = p_user_id and
      stored.bucket in (
        v_route_bucket,
        v_daily_bucket
      );

    v_route_count := v_route_count + 1;
    v_daily_count := v_daily_count + 1;
  else
    if v_route_count >= p_route_limit then
      v_candidate_retry :=
        ceil(
          extract(
            epoch from (
              v_route_started_at +
              p_route_window_seconds *
              interval '1 second' -
              v_now
            )
          )
        )::integer;

      if v_candidate_retry > v_retry_after then
        v_retry_after := v_candidate_retry;
      end if;
    end if;

    if v_daily_count >= p_daily_limit then
      v_candidate_retry :=
        ceil(
          extract(
            epoch from (
              v_daily_started_at +
              p_daily_window_seconds *
              interval '1 second' -
              v_now
            )
          )
        )::integer;

      if v_candidate_retry > v_retry_after then
        v_retry_after := v_candidate_retry;
      end if;
    end if;

    if v_retry_after < 1 then
      v_retry_after := 1;
    end if;
  end if;

  return query
  select
    v_allowed,
    case
      when p_route_limit - v_route_count > 0
      then p_route_limit - v_route_count
      else 0
    end,
    case
      when p_daily_limit - v_daily_count > 0
      then p_daily_limit - v_daily_count
      else 0
    end,
    v_retry_after,
    p_route_limit,
    p_daily_limit;
end;
$function$;

revoke all
  on function public.consume_ai_rate_limit(
    uuid,
    text,
    integer,
    integer,
    integer,
    integer
  )
  from public, anon, authenticated;

grant execute
  on function public.consume_ai_rate_limit(
    uuid,
    text,
    integer,
    integer,
    integer,
    integer
  )
  to service_role;
