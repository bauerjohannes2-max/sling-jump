# Local cloud backups

JSON dumps of `player_saves`, `player_sessions`, and `leaderboard` for this PC only.

1. Copy `.env.example` to `.env`.
2. Paste the **service_role** key from [API settings](https://supabase.com/dashboard/project/smektrzoymciosepaehr/settings/api).
3. `npm run backup:cloud`

Windows Task Scheduler job `SpaceJumpCloudBackup` runs that command daily at 20:00 while this PC is on. Keep the last 30 files; do not commit `.env` or `*.json`.
