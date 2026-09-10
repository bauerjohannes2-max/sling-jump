/**
 * Public cloud config for GitHub Pages.
 *
 * Leave both strings empty for local `npm start` (uses serve.js).
 * For a worldwide leaderboard and locked cloud saves, create a free Supabase project,
 * run sql/leaderboard.sql and sql/player_saves.sql, then paste Project URL + anon public key below and commit.
 *
 * The anon key is designed to be public. Never paste the service_role key.
 */
(function () {
  const SUPABASE_URL = String('https://smektrzoymciosepaehr.supabase.co' || '').trim();
  const SUPABASE_ANON_KEY = String('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZWt0cnpveW1jaW9zZXBhZWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMzcwNTcsImV4cCI6MjEwNDYxMzA1N30.ziSC4wyhYJgYDUXPY_AAUqxJ77jKWogZowUv2hyBk4s' || '').trim();

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  if (typeof window === 'undefined') return;

  window.SPACE_JUMP_CLOUD_CONFIG = {
    type: 'supabase',
    options: {
      supabaseUrl: SUPABASE_URL.replace(/\/+$/, ''),
      supabaseAnonKey: SUPABASE_ANON_KEY,
      leaderboardTable: 'leaderboard'
    }
  };
})();
