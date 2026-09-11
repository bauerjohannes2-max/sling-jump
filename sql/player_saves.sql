-- Space Jump cloud saves (Supabase SQL editor)
-- The anon key stays in the client; RLS + these RPCs are what protect player data.
-- Direct table reads/writes are revoked. Password hashes never leave the database.
-- Passwords are stored with pgcrypto bcrypt. Restore always needs a password.

create extension if not exists pgcrypto;

create table if not exists public.player_saves (
  player_id text primary key,
  username text,
  password_hash text,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.player_sessions (
  token text primary key,
  player_id text not null references public.player_saves(player_id) on delete cascade,
  expires_at timestamptz not null
);

create index if not exists player_sessions_player_id_idx on public.player_sessions (player_id);
create index if not exists player_sessions_expires_at_idx on public.player_sessions (expires_at);
create unique index if not exists player_saves_username_ci_idx
  on public.player_saves (lower(username))
  where username is not null;

alter table public.player_saves enable row level security;
alter table public.player_sessions enable row level security;

do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('player_saves', 'player_sessions')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

revoke all on public.player_saves from public, anon, authenticated;
revoke all on public.player_sessions from public, anon, authenticated;

create or replace function public._hash_password(p_secret text)
returns text
language plpgsql
volatile
set search_path = public, extensions
as $$
begin
  if p_secret is null or trim(p_secret) = '' then
    return null;
  end if;
  return crypt(trim(p_secret), gen_salt('bf', 10));
end;
$$;

create or replace function public._password_matches(p_stored text, p_secret text)
returns boolean
language plpgsql
immutable
set search_path = public, extensions
as $$
begin
  if p_stored is null or p_stored = '' or p_secret is null or trim(p_secret) = '' then
    return false;
  end if;
  if left(p_stored, 3) in ('$2a', '$2b', '$2y') then
    return p_stored = crypt(trim(p_secret), p_stored);
  end if;
  return p_stored = trim(p_secret);
end;
$$;

revoke all on function public._hash_password(text) from public, anon, authenticated;
revoke all on function public._password_matches(text, text) from public, anon, authenticated;

create or replace function public._scrub_save_state(p_state jsonb)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  clean jsonb;
begin
  if p_state is null or jsonb_typeof(p_state) <> 'object' then
    return '{}'::jsonb;
  end if;
  clean := p_state;
  if clean ? 'playerProfile' and jsonb_typeof(clean->'playerProfile') = 'object' then
    clean := jsonb_set(clean, '{playerProfile,passwordHash}', 'null'::jsonb, true);
    clean := jsonb_set(clean, '{playerProfile,sessionToken}', 'null'::jsonb, true);
  end if;
  return clean;
end;
$$;

revoke all on function public._scrub_save_state(jsonb) from public, anon, authenticated;

create or replace function public._issue_player_session(p_player_id text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  new_token text;
begin
  delete from public.player_sessions where expires_at < now();
  delete from public.player_sessions
   where player_id = p_player_id
     and token in (
       select token from (
         select token
           from public.player_sessions
          where player_id = p_player_id
          order by expires_at desc
          offset 4
       ) old_tokens
     );
  new_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.player_sessions (token, player_id, expires_at)
  values (new_token, p_player_id, now() + interval '30 days');
  return new_token;
end;
$$;

revoke all on function public._issue_player_session(text) from public, anon, authenticated;

create or replace function public.sync_player_save(
  p_player_id text,
  p_username text default null,
  p_password_hash text default null,
  p_session_token text default null,
  p_state jsonb default '{}'::jsonb,
  p_remove_password boolean default false
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_id text;
  clean_name text;
  clean_hash text;
  clean_token text;
  clean_state jsonb;
  rec public.player_saves%rowtype;
  authed boolean := false;
  taken_id text;
  new_token text;
begin
  clean_id := upper(trim(coalesce(p_player_id, '')));
  if clean_id is null or length(clean_id) < 4 or length(clean_id) > 24 then
    return json_build_object('ok', false, 'error', 'INVALID_ID');
  end if;

  if octet_length(coalesce(p_state, '{}'::jsonb)::text) > 102400 then
    return json_build_object('ok', false, 'error', 'SAVE_TOO_LARGE');
  end if;

  clean_state := public._scrub_save_state(p_state);
  clean_hash := nullif(trim(coalesce(p_password_hash, '')), '');
  clean_token := nullif(trim(coalesce(p_session_token, '')), '');
  clean_name := nullif(left(trim(coalesce(p_username, '')), 24), '');

  select * into rec from public.player_saves where player_id = clean_id;

  if not found then
    if clean_hash is null then
      return json_build_object('ok', false, 'error', 'PASSWORT ERFORDERLICH', 'requiresPassword', true);
    end if;
    if clean_name is not null then
      select s.player_id into taken_id
        from public.player_saves s
       where lower(s.username) = lower(clean_name)
       limit 1;
      if taken_id is not null then
        return json_build_object('ok', false, 'error', 'NAME_TAKEN', 'nameTaken', true);
      end if;
    end if;
    insert into public.player_saves (player_id, username, password_hash, state, updated_at)
    values (clean_id, clean_name, public._hash_password(clean_hash), clean_state, now())
    returning * into rec;
  else
    if clean_token is not null then
      if exists (
        select 1 from public.player_sessions
         where token = clean_token
           and player_id = clean_id
           and expires_at > now()
      ) then
        authed := true;
      elsif clean_hash is null then
        return json_build_object('ok', false, 'error', 'TOKEN_EXPIRED', 'tokenExpired', true);
      end if;
    end if;

    if not authed then
      if rec.password_hash is not null and rec.password_hash <> '' then
        if clean_hash is null then
          return json_build_object('ok', false, 'error', 'PASSWORT ERFORDERLICH', 'requiresPassword', true);
        end if;
        if not public._password_matches(rec.password_hash, clean_hash) then
          return json_build_object('ok', false, 'error', 'FALSCHES PASSWORT');
        end if;
      elsif clean_hash is null then
        return json_build_object('ok', false, 'error', 'PASSWORT ERFORDERLICH', 'requiresPassword', true);
      end if;
      authed := true;
    end if;

    if clean_name is not null then
      select s.player_id into taken_id
        from public.player_saves s
       where lower(s.username) = lower(clean_name)
         and s.player_id <> clean_id
       limit 1;
      if taken_id is not null then
        return json_build_object('ok', false, 'error', 'NAME_TAKEN', 'nameTaken', true);
      end if;
    end if;

    update public.player_saves
       set username = coalesce(clean_name, username),
           password_hash = case
             when p_remove_password then null
             when clean_hash is not null then public._hash_password(clean_hash)
             else password_hash
           end,
           state = clean_state,
           updated_at = now()
     where player_id = clean_id
     returning * into rec;
  end if;

  new_token := public._issue_player_session(clean_id);
  return json_build_object(
    'ok', true,
    'sessionToken', new_token,
    'updatedAt', rec.updated_at
  );
end;
$$;

create or replace function public.restore_player_save(
  p_player_id text default null,
  p_username text default null,
  p_password_hash text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_id text;
  clean_name text;
  clean_hash text;
  rec public.player_saves%rowtype;
  new_token text;
begin
  clean_id := nullif(upper(trim(coalesce(p_player_id, ''))), '');
  clean_name := nullif(left(trim(coalesce(p_username, '')), 24), '');
  clean_hash := nullif(trim(coalesce(p_password_hash, '')), '');

  if clean_name is not null then
    select * into rec
      from public.player_saves
     where lower(username) = lower(clean_name)
     limit 1;
  elsif clean_id is not null then
    select * into rec from public.player_saves where player_id = clean_id;
  else
    return json_build_object('ok', false, 'error', 'INVALID_ID');
  end if;

  if not found then
    return json_build_object('ok', false, 'error', 'SPIELER NICHT GEFUNDEN');
  end if;

  if clean_hash is null then
    return json_build_object('ok', false, 'error', 'PASSWORT ERFORDERLICH', 'requiresPassword', true);
  end if;
  if not public._password_matches(rec.password_hash, clean_hash) then
    return json_build_object('ok', false, 'error', 'FALSCHES PASSWORT');
  end if;

  new_token := public._issue_player_session(rec.player_id);
  return json_build_object(
    'ok', true,
    'sessionToken', new_token,
    'player', json_build_object(
      'playerId', rec.player_id,
      'state', public._scrub_save_state(rec.state),
      'updatedAt', rec.updated_at
    )
  );
end;
$$;

revoke all on function public.sync_player_save(text, text, text, text, jsonb, boolean) from public;
revoke all on function public.restore_player_save(text, text, text) from public;
grant execute on function public.sync_player_save(text, text, text, text, jsonb, boolean) to anon, authenticated;
grant execute on function public.restore_player_save(text, text, text) to anon, authenticated;

create or replace function public.delete_player_account(
  p_player_id text,
  p_password_hash text default null,
  p_session_token text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_id text;
  clean_hash text;
  clean_token text;
  rec public.player_saves%rowtype;
  authed boolean := false;
begin
  clean_id := upper(trim(coalesce(p_player_id, '')));
  if clean_id is null or length(clean_id) < 4 or length(clean_id) > 24 then
    return json_build_object('ok', false, 'error', 'INVALID_ID');
  end if;

  clean_hash := nullif(trim(coalesce(p_password_hash, '')), '');
  clean_token := nullif(trim(coalesce(p_session_token, '')), '');

  select * into rec from public.player_saves where player_id = clean_id;
  if not found then
    return json_build_object('ok', false, 'error', 'SPIELER NICHT GEFUNDEN');
  end if;

  if clean_token is not null then
    if exists (
      select 1 from public.player_sessions
       where token = clean_token
         and player_id = clean_id
         and expires_at > now()
    ) then
      authed := true;
    end if;
  end if;

  if not authed then
    if rec.password_hash is not null and rec.password_hash <> '' then
      if clean_hash is null then
        return json_build_object('ok', false, 'error', 'PASSWORT ERFORDERLICH', 'requiresPassword', true);
      end if;
      if not public._password_matches(rec.password_hash, clean_hash) then
        return json_build_object('ok', false, 'error', 'FALSCHES PASSWORT');
      end if;
    else
      return json_build_object('ok', false, 'error', 'PASSWORT ERFORDERLICH', 'requiresPassword', true);
    end if;
  end if;

  delete from public.leaderboard where player_id = clean_id;
  delete from public.player_saves where player_id = clean_id;

  return json_build_object('ok', true);
end;
$$;

revoke all on function public.delete_player_account(text, text, text) from public;
grant execute on function public.delete_player_account(text, text, text) to anon, authenticated;
