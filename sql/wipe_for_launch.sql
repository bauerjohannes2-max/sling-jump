-- Space Jump 1.0 launch wipe
-- Paste this WHOLE script into the Supabase SQL editor, then click Run.
-- Do this once before inviting friends. It deletes every score and cloud account.

truncate table public.player_saves restart identity cascade;
truncate table public.leaderboard restart identity cascade;

create unique index if not exists player_saves_username_ci_idx
  on public.player_saves (lower(username))
  where username is not null;
