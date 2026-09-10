/**
 * Daily Space Jump cloud backup onto this PC.
 *
 * Needs backups/.env with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * (Dashboard → Project Settings → API → service_role). Never commit that file.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BACKUP_DIR = path.join(ROOT, 'backups');
const ENV_FILE = path.join(BACKUP_DIR, '.env');
const KEEP = 30;
const TABLES = ['player_saves', 'player_sessions', 'leaderboard'];
const DEFAULT_URL = 'https://smektrzoymciosepaehr.supabase.co';

function loadEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
  }
  return env;
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function pruneOld(dir) {
  const files = fs.readdirSync(dir)
    .filter((name) => /^space-jump-.*\.json$/.test(name))
    .map((name) => ({ name, t: fs.statSync(path.join(dir, name)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  for (const extra of files.slice(KEEP)) {
    fs.unlinkSync(path.join(dir, extra.name));
  }
}

async function fetchTable(baseUrl, key, table) {
  const res = await fetch(`${baseUrl}/rest/v1/${table}?select=*`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json'
    }
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${table} HTTP ${res.status}: ${body.slice(0, 240)}`);
  }
  return res.json();
}

async function main() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const fileEnv = loadEnvFile(ENV_FILE);
  const url = (process.env.SUPABASE_URL || fileEnv.SUPABASE_URL || DEFAULT_URL).replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || fileEnv.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!key || key.includes('paste-')) {
    const msg = [
      'Missing service_role key.',
      `Create ${ENV_FILE} with:`,
      `SUPABASE_URL=${DEFAULT_URL}`,
      'SUPABASE_SERVICE_ROLE_KEY=<service_role from Dashboard → Settings → API>',
      'https://supabase.com/dashboard/project/smektrzoymciosepaehr/settings/api'
    ].join('\n');
    fs.writeFileSync(path.join(BACKUP_DIR, 'last-run.log'), `${new Date().toISOString()} FAIL\n${msg}\n`);
    console.error(msg);
    process.exit(1);
  }

  const dump = {
    takenAt: new Date().toISOString(),
    project: 'space-jump',
    source: url
  };
  for (const table of TABLES) {
    dump[table] = await fetchTable(url, key, table);
  }

  const outFile = path.join(BACKUP_DIR, `space-jump-${stamp()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(dump, null, 2));
  pruneOld(BACKUP_DIR);
  const summary = `${new Date().toISOString()} OK ${path.basename(outFile)} saves=${dump.player_saves.length} sessions=${dump.player_sessions.length} scores=${dump.leaderboard.length}`;
  fs.writeFileSync(path.join(BACKUP_DIR, 'last-run.log'), `${summary}\n`);
  console.log(summary);
}

main().catch((err) => {
  const msg = `${new Date().toISOString()} FAIL ${err && err.message ? err.message : err}`;
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    fs.writeFileSync(path.join(BACKUP_DIR, 'last-run.log'), `${msg}\n`);
  } catch (e) {}
  console.error(msg);
  process.exit(1);
});
