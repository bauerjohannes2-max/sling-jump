-- Space Jump public leaderboard (Supabase SQL editor, run once)
-- Anon key stays in the client; RLS + this RPC are what protect the table.

create table if not exists public.leaderboard (
  player_id text primary key,
  name text not null,
  altitude integer not null check (altitude >= 0 and altitude <= 500000),
  updated_at timestamptz not null default now()
);

alter table public.leaderboard enable row level security;

drop policy if exists "public read leaderboard" on public.leaderboard;
create policy "public read leaderboard"
  on public.leaderboard
  for select
  to anon, authenticated
  using (true);

grant select on public.leaderboard to anon, authenticated;

create or replace function public.submit_leaderboard(p_player_id text, p_name text, p_altitude integer)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_id text;
  clean_name text;
  clean_alt integer;
  result_row public.leaderboard%rowtype;
begin
  clean_id := upper(trim(coalesce(p_player_id, '')));
  if clean_id is null or length(clean_id) < 5 or length(clean_id) > 16 then
    return json_build_object('ok', false, 'error', 'INVALID_ID');
  end if;

  clean_name := left(trim(coalesce(p_name, 'Pilot')), 24);
  if clean_name = '' then
    clean_name := 'Pilot';
  end if;

  clean_alt := least(greatest(coalesce(p_altitude, 0), 0), 500000);
  if clean_alt <= 0 then
    return json_build_object('ok', false, 'error', 'NO_SCORE');
  end if;

  insert into public.leaderboard (player_id, name, altitude, updated_at)
  values (clean_id, clean_name, clean_alt, now())
  on conflict (player_id) do update
    set name = excluded.name,
        altitude = greatest(public.leaderboard.altitude, excluded.altitude),
        updated_at = now()
  returning * into result_row;

  return json_build_object('ok', true, 'altitude', result_row.altitude);
end;
$$;

grant execute on function public.submit_leaderboard(text, text, integer) to anon, authenticated;
