/**
 * Space Jump - Mobile Access Local Server with QR Code
 * Auto-detects LAN IPv4 and displays scannable terminal QR code for instant phone testing.
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

let qrcode = null;
try {
  qrcode = require('qrcode-terminal');
} catch (e) {}

const PORT = parseInt(process.env.PORT, 10) || 3000;
const ROOT_DIR = path.join(__dirname, '..');
const CERTS_DIR = path.join(ROOT_DIR, 'certs');
const KEY_FILE = path.join(CERTS_DIR, 'key.pem');
const CERT_FILE = path.join(CERTS_DIR, 'cert.pem');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

// Player and session JSON stores
const DATA_DIR = path.join(ROOT_DIR, 'data');

function readJsonStore(file) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (e) {
    console.warn(`[Server] ${path.basename(file)} unreadable, starting from defaults: ${e.message}`);
  }
  return null;
}

/**
 * Writes to a temp file and renames it over the target. A crash or a second writer can then
 * never leave a half-written store on disk, which would wipe every player's cloud save.
 */
function writeJsonStore(file, data) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmpFile = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmpFile, file);
    return true;
  } catch (e) {
    console.warn(`[Server] Could not persist ${path.basename(file)}: ${e.message}`);
    return false;
  }
}

// Cross-Device Player Cloud Store
const PLAYERS_FILE = path.join(DATA_DIR, 'players.json');
const PUBLIC_LB_FILE = path.join(DATA_DIR, 'public-leaderboard.json');

function loadPlayers() {
  return readJsonStore(PLAYERS_FILE) || {};
}

let playersStore = loadPlayers();

function reloadPlayers() {
  playersStore = loadPlayers();
  return playersStore;
}

function savePlayers() {
  return writeJsonStore(PLAYERS_FILE, playersStore);
}

// One queue for the whole players file so two overlapping syncs cannot reload/write
// past each other and drop a save. Each turn reloads from disk first.
let playersWriteChain = Promise.resolve();

function withPlayersStoreLock(fn) {
  const run = playersWriteChain.then(() => {
    reloadPlayers();
    return fn();
  });
  playersWriteChain = run.then(() => undefined, () => {});
  return run;
}

// Cross-Device Player Ephemeral Sessions Store
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function loadSessions() {
  return readJsonStore(SESSIONS_FILE) || {};
}

let sessionsStore = loadSessions();

function reloadSessions() {
  sessionsStore = loadSessions();
  return sessionsStore;
}

function saveSessions() {
  return writeJsonStore(SESSIONS_FILE, sessionsStore);
}

function createSessionToken(playerId) {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  sessionsStore[token] = {
    playerId,
    createdAt: new Date(now).toISOString(),
    expiresAt: now + SESSION_EXPIRY_MS
  };
  saveSessions();
  return token;
}

function validateSessionToken(token, expectedPlayerId) {
  if (!token || typeof token !== 'string') return { valid: false, reason: 'MISSING_TOKEN' };
  const session = sessionsStore[token];
  if (!session) return { valid: false, reason: 'INVALID_TOKEN' };
  if (Date.now() > session.expiresAt) {
    delete sessionsStore[token];
    saveSessions();
    return { valid: false, reason: 'EXPIRED_TOKEN' };
  }
  if (expectedPlayerId && session.playerId !== expectedPlayerId) {
    return { valid: false, reason: 'PLAYER_MISMATCH' };
  }
  return { valid: true, session };
}

function revokePlayerSessions(playerId) {
  let changed = false;
  for (const [t, s] of Object.entries(sessionsStore)) {
    if (s.playerId === playerId) {
      delete sessionsStore[t];
      changed = true;
    }
  }
  if (changed) saveSessions();
}


function safeCompareHashes(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// Server-Side PBKDF2 Password Key Derivation & Salting
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 32;
const PBKDF2_DIGEST = 'sha256';

function derivePasswordKey(clientHash, salt) {
  if (!clientHash || !salt) return null;
  return crypto.pbkdf2Sync(clientHash, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST).toString('hex');
}

function createSaltedPassword(clientHash) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedHash = derivePasswordKey(clientHash, salt);
  return { salt, derivedHash };
}

function hasPassword(record) {
  if (!record || !record.passwordHash) return false;
  if (typeof record.passwordHash === 'object' && record.passwordHash.derivedHash) return true;
  if (typeof record.passwordHash === 'string' && record.passwordHash.trim().length > 0) return true;
  return false;
}

function verifyPassword(storedPasswordHash, clientPwHash) {
  if (!storedPasswordHash) {
    return { valid: true, requiresPassword: false, needsUpgrade: false };
  }
  if (!clientPwHash) {
    return { valid: false, requiresPassword: true, reason: 'MISSING_PASSWORD' };
  }

  // Salted PBKDF2 format: { salt, derivedHash }
  if (typeof storedPasswordHash === 'object' && storedPasswordHash.salt && storedPasswordHash.derivedHash) {
    const computed = derivePasswordKey(clientPwHash, storedPasswordHash.salt);
    const valid = safeCompareHashes(storedPasswordHash.derivedHash, computed);
    return { valid, requiresPassword: true, needsUpgrade: false };
  }

  // Legacy format: raw SHA-256 string without salt
  if (typeof storedPasswordHash === 'string' && storedPasswordHash.trim().length > 0) {
    const valid = safeCompareHashes(storedPasswordHash.trim(), clientPwHash);
    return { valid, requiresPassword: true, needsUpgrade: true };
  }

  return { valid: true, requiresPassword: false, needsUpgrade: false };
}

// Intentionally volatile: IP rate limits and brute-force lockouts live only in
// memory. A restart clears them. That is preferred over writing attacker IPs to disk.
// Session tokens in sessions.json are persisted; the sweeper below must call
// saveSessions() so expired tokens leave disk as well as memory.
const ipRateLimitStore = new Map(); // ip -> { count, resetTime }
const authLockoutStore = new Map(); // key (ip:playerId) -> { failures, lockoutUntil }

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket ? req.socket.remoteAddress : '127.0.0.1';
}

function checkIpRateLimit(ip, maxRequests = 60, windowMs = 60000) {
  const now = Date.now();
  let record = ipRateLimitStore.get(ip);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    ipRateLimitStore.set(ip, record);
    return { limited: false };
  }
  record.count += 1;
  if (record.count > maxRequests) {
    const retryAfter = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return { limited: true, retryAfter };
  }
  return { limited: false };
}

function checkAuthLockout(key) {
  const now = Date.now();
  const record = authLockoutStore.get(key);
  if (record && record.lockoutUntil > now) {
    const retryAfter = Math.max(1, Math.ceil((record.lockoutUntil - now) / 1000));
    return { locked: true, retryAfter };
  }
  return { locked: false };
}

function recordAuthFailure(key, maxFailures = 5, lockoutMs = 60000) {
  const now = Date.now();
  let record = authLockoutStore.get(key);
  if (!record || (record.lockoutUntil && record.lockoutUntil < now)) {
    record = { failures: 1, lockoutUntil: 0 };
  } else {
    record.failures += 1;
  }
  if (record.failures >= maxFailures) {
    record.lockoutUntil = now + lockoutMs;
  }
  authLockoutStore.set(key, record);
}

function recordAuthSuccess(key) {
  authLockoutStore.delete(key);
}

const rateLimitCleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [k, v] of ipRateLimitStore.entries()) {
    if (now > v.resetTime) ipRateLimitStore.delete(k);
  }
  for (const [k, v] of authLockoutStore.entries()) {
    if (v.lockoutUntil && now > v.lockoutUntil) authLockoutStore.delete(k);
  }
  let sessionsChanged = false;
  for (const [k, v] of Object.entries(sessionsStore)) {
    if (v.expiresAt && now > v.expiresAt) {
      delete sessionsStore[k];
      sessionsChanged = true;
    }
  }
  if (sessionsChanged) saveSessions();
}, 300000);
if (rateLimitCleanupInterval.unref) rateLimitCleanupInterval.unref();

const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
  /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
  /^https?:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+(:\d+)?$/,
  /^https:\/\/bauerjohannes2-max\.github\.io$/
];

function getCorsOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return '*';
  const isAllowed = ALLOWED_ORIGIN_PATTERNS.some(p => p.test(origin));
  return isAllowed ? origin : null;
}

const MAX_BODY_BYTES = 100 * 1024;

function readJsonBody(req, res, corsOrigin, callback) {
  let body = '';
  let exceeded = false;
  req.on('data', chunk => {
    if (exceeded) return;
    body += chunk;
    if (body.length > MAX_BODY_BYTES) {
      exceeded = true;
      res.writeHead(413, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': corsOrigin || '*'
      });
      res.end(JSON.stringify({ ok: false, error: 'PAYLOAD ZU GROSS (MAX 100KB)' }));
    }
  });
  req.on('end', () => {
    if (exceeded) return;
    try {
      const parsed = JSON.parse(body || '{}');
      callback(null, parsed);
    } catch (e) {
      res.writeHead(400, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': corsOrigin || '*'
      });
      res.end(JSON.stringify({ ok: false, error: 'UNGÜLTIGES JSON' }));
    }
  });
}

const ID_REGEX = /^#[23456789ABCDEFGHJKLMNPQRSTUVWXYZ-]{4,10}$/;

function normalizeUsername(name) {
  return String(name || '').trim().toLowerCase();
}

function getRecordUsername(record) {
  if (!record) return '';
  if (record.username) return String(record.username);
  const profile = record.state && record.state.playerProfile;
  if (profile && profile.accountName) return String(profile.accountName);
  if (profile && profile.pilotName) return String(profile.pilotName);
  return '';
}

function findAccountByUsername(username) {
  const needle = normalizeUsername(username);
  if (!needle) return null;
  for (const [id, rec] of Object.entries(playersStore)) {
    if (!hasPassword(rec)) continue;
    if (normalizeUsername(getRecordUsername(rec)) === needle) {
      return { id, record: rec };
    }
  }
  return null;
}

function parsePlayerId(raw) {
  let rawId = String(raw || '').trim().toUpperCase();
  if (!rawId) return null;
  if (!rawId.startsWith('#')) rawId = '#' + rawId;
  if (!ID_REGEX.test(rawId)) return null;
  return rawId;
}

function resolveAccountIdentity(payload) {
  const username = payload && payload.username ? String(payload.username).trim() : '';
  if (username) {
    const found = findAccountByUsername(username);
    if (found) return { ok: true, playerId: found.id, record: found.record };
    return { ok: false, status: 404, error: 'Name oder Passwort falsch.' };
  }
  const playerId = parsePlayerId(payload && payload.playerId);
  if (!playerId) {
    return { ok: false, status: 400, error: 'Name oder Passwort fehlt.' };
  }
  return { ok: true, playerId, record: playersStore[playerId] || null };
}

function incomingUsername(payload) {
  if (payload && payload.username) return String(payload.username).trim();
  const profile = payload && payload.state && payload.state.playerProfile;
  if (profile && profile.accountName) return String(profile.accountName).trim();
  if (profile && profile.pilotName) return String(profile.pilotName).trim();
  return '';
}

let APP_CONSTANTS = null;
try {
  APP_CONSTANTS = require(path.join(ROOT_DIR, 'js', 'config', 'Constants.js'));
} catch (e) {
  APP_CONSTANTS = null;
}

const VALID_SHIPS = (APP_CONSTANTS && Array.isArray(APP_CONSTANTS.SHIPS) && APP_CONSTANTS.SHIPS.length > 0)
  ? APP_CONSTANTS.SHIPS.map(s => s.id)
  : ['pfeil', 'habicht', 'lanze', 'jaeger', 'falke'];

const VALID_TRAILS = (APP_CONSTANTS && Array.isArray(APP_CONSTANTS.TRAILS) && APP_CONSTANTS.TRAILS.length > 0)
  ? APP_CONSTANTS.TRAILS.map(t => t.id)
  : ['neon_cyan'];

const VALID_THEMES = (APP_CONSTANTS && Array.isArray(APP_CONSTANTS.THEMES) && APP_CONSTANTS.THEMES.length > 0)
  ? APP_CONSTANTS.THEMES.map(t => t.id)
  : ['deep_space', 'cyberpunk', 'solar_flare', 'monolith_dark'];

const SCHEMA_BOUNDS = {
  MAX_HIGH_SCORE: 500000,
  MAX_CORES: 1000000,
  MAX_HYPER_CRYSTALS: 1000,
  MAX_STAT_VALUE: 100000000,
  MAX_COMBO: 100
};

function clampInt(val, min, max, defaultVal = 0) {
  if (typeof val !== 'number' || !Number.isFinite(val) || isNaN(val)) {
    return defaultVal;
  }
  return Math.max(min, Math.min(max, Math.floor(val)));
}

function sanitizeState(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return {};
  const clean = {};
  for (const [k, v] of Object.entries(state)) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
    clean[k] = v;
  }

  // 1. Numeric bounds enforcement
  if ('highScore' in clean) {
    clean.highScore = clampInt(clean.highScore, 0, SCHEMA_BOUNDS.MAX_HIGH_SCORE, 0);
  }
  if ('cores' in clean) {
    clean.cores = clampInt(clean.cores, 0, SCHEMA_BOUNDS.MAX_CORES, 0);
  }
  if ('hyperCrystals' in clean) {
    clean.hyperCrystals = clampInt(clean.hyperCrystals, 0, SCHEMA_BOUNDS.MAX_HYPER_CRYSTALS, 1);
  }

  // 2. Equipment catalog validation
  if ('selectedShip' in clean) {
    clean.selectedShip = VALID_SHIPS.includes(clean.selectedShip) ? clean.selectedShip : (VALID_SHIPS[0] || 'pfeil');
  }
  if ('selectedTrail' in clean) {
    clean.selectedTrail = VALID_TRAILS.includes(clean.selectedTrail) ? clean.selectedTrail : (VALID_TRAILS[0] || 'neon_cyan');
  }
  if ('selectedTheme' in clean) {
    clean.selectedTheme = VALID_THEMES.includes(clean.selectedTheme) ? clean.selectedTheme : (VALID_THEMES[0] || 'deep_space');
  }

  if (Array.isArray(clean.unlockedShips)) {
    clean.unlockedShips = clean.unlockedShips.filter(id => typeof id === 'string' && VALID_SHIPS.includes(id));
    if (!clean.unlockedShips.includes(VALID_SHIPS[0])) clean.unlockedShips.unshift(VALID_SHIPS[0]);
  }
  if (Array.isArray(clean.unlockedTrails)) {
    clean.unlockedTrails = clean.unlockedTrails.filter(id => typeof id === 'string' && VALID_TRAILS.includes(id));
    if (!clean.unlockedTrails.includes(VALID_TRAILS[0])) clean.unlockedTrails.unshift(VALID_TRAILS[0]);
  }
  if (Array.isArray(clean.unlockedThemes)) {
    clean.unlockedThemes = clean.unlockedThemes.filter(id => typeof id === 'string' && VALID_THEMES.includes(id));
    if (!clean.unlockedThemes.includes(VALID_THEMES[0])) clean.unlockedThemes.unshift(VALID_THEMES[0]);
  }

  // 3. Sub-object sanitization (stats, playerProfile)
  if (clean.stats && typeof clean.stats === 'object' && !Array.isArray(clean.stats)) {
    const cleanStats = {};
    for (const [sk, sv] of Object.entries(clean.stats)) {
      if (sk === '__proto__' || sk === 'constructor' || sk === 'prototype') continue;
      if (sk === 'bestCombo') {
        cleanStats[sk] = clampInt(sv, 0, SCHEMA_BOUNDS.MAX_COMBO, 0);
      } else if (typeof sv === 'number') {
        cleanStats[sk] = clampInt(sv, 0, SCHEMA_BOUNDS.MAX_STAT_VALUE, 0);
      } else {
        cleanStats[sk] = sv;
      }
    }
    clean.stats = cleanStats;
  }

  if (clean.playerProfile && typeof clean.playerProfile === 'object' && !Array.isArray(clean.playerProfile)) {
    const cleanProfile = {};
    for (const [pk, pv] of Object.entries(clean.playerProfile)) {
      if (pk === '__proto__' || pk === 'constructor' || pk === 'prototype') continue;
      if (pk === 'nameChanges') {
        cleanProfile[pk] = clampInt(pv, 0, 10, 0);
      } else {
        cleanProfile[pk] = pv;
      }
    }
    clean.playerProfile = cleanProfile;
  }

  return clean;
}

function sanitizeLeaderboardName(name) {
  if (typeof name !== 'string') return 'Pilot';
  const cleaned = name.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 24);
  return cleaned || 'Pilot';
}

function leaderboardNameKey(name) {
  return sanitizeLeaderboardName(name).toLowerCase();
}

function rememberLeaderboardEntry(best, playerId, name, altitude) {
  const cleanName = sanitizeLeaderboardName(name);
  const nameKey = leaderboardNameKey(cleanName);
  let targetId = playerId;
  for (const [id, row] of best.entries()) {
    if (leaderboardNameKey(row.name) === nameKey) {
      targetId = id;
      break;
    }
  }
  const existing = best.get(targetId);
  if (!existing || altitude > existing.altitude) {
    best.set(targetId, { name: cleanName, altitude, playerId: targetId });
  } else if (existing && cleanName && cleanName !== 'Pilot') {
    existing.name = cleanName;
  }
  if (playerId && playerId !== targetId) {
    best.delete(playerId);
  }
}

function buildPublicLeaderboard() {
  const best = new Map();
  for (const [id, record] of Object.entries(playersStore || {})) {
    if (!record || typeof record !== 'object') continue;
    if (id === '__proto__' || id === 'constructor' || id === 'prototype') continue;
    const state = record.state && typeof record.state === 'object' && !Array.isArray(record.state)
      ? record.state
      : {};
    const altitude = clampInt(state.highScore, 0, SCHEMA_BOUNDS.MAX_HIGH_SCORE, 0);
    if (altitude <= 0) continue;
    const profile = state.playerProfile && typeof state.playerProfile === 'object' && !Array.isArray(state.playerProfile)
      ? state.playerProfile
      : {};
    const name = record.username || profile.accountName || profile.pilotName || '';
    const playerId = typeof record.playerId === 'string' ? record.playerId : id;
    rememberLeaderboardEntry(best, playerId, name, altitude);
  }

  const extras = readJsonStore(PUBLIC_LB_FILE) || {};
  for (const [id, row] of Object.entries(extras)) {
    if (!row || typeof row !== 'object') continue;
    if (id === '__proto__' || id === 'constructor' || id === 'prototype') continue;
    const playerId = parsePlayerId(row.playerId || id);
    const altitude = clampInt(row.altitude, 0, SCHEMA_BOUNDS.MAX_HIGH_SCORE, 0);
    if (!playerId || altitude <= 0) continue;
    rememberLeaderboardEntry(best, playerId, row.name || '', altitude);
  }

  return Array.from(best.values()).sort((a, b) => b.altitude - a.altitude).slice(0, 100);
}

function serveDesignIndex(res) {
  const dir = path.join(ROOT_DIR, 'design');
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((name) => name.toLowerCase().endsWith('.html')).sort();
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }
  const items = files.map((name) => `<li><a href="/design/${encodeURIComponent(name)}">${name}</a></li>`).join('');
  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><title>Space Jump Mockups</title>
<style>body{font-family:sans-serif;background:#0b0d13;color:#e2e8f0;padding:32px}a{color:#38e8ff}li{margin:10px 0}</style>
</head><body><h1>Design mockups</h1><ul>${items}</ul></body></html>`;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(html);
}

function createRequestListener() {
  return (req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/space-jump' || reqUrl === '/space-jump/') {
      reqUrl = '/';
    } else if (reqUrl.startsWith('/space-jump/')) {
      reqUrl = reqUrl.slice('/space-jump'.length) || '/';
    }
    const corsOrigin = getCorsOrigin(req);

    // Block disallowed external cross-origin requests
    if (req.headers.origin && !corsOrigin) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'ORIGIN NICHT ERLAUBT' }));
      return;
    }

    // CORS Preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': corsOrigin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Vary': 'Origin'
      });
      res.end();
      return;
    }

    // Rate limit check on API endpoints
    const clientIp = getClientIp(req);
    if (reqUrl.startsWith('/api/player/') || reqUrl === '/api/leaderboard') {
      const ipLimit = checkIpRateLimit(clientIp, 60, 60000);
      if (ipLimit.limited) {
        res.writeHead(429, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin || '*',
          'Retry-After': String(ipLimit.retryAfter),
          'Vary': 'Origin'
        });
        res.end(JSON.stringify({
          ok: false,
          error: `ZU VIELE ANFRAGEN. BITTE ${ipLimit.retryAfter} SEKUNDEN WARTEN.`,
          retryAfter: ipLimit.retryAfter
        }));
        return;
      }
    }

    // API: Player Login (POST /api/player/login) -> Ephemeral Session Token
    if (req.method === 'POST' && reqUrl === '/api/player/login') {
      readJsonBody(req, res, corsOrigin, (err, payload) => {
        const identity = resolveAccountIdentity(payload);
        if (!identity.ok) {
          res.writeHead(identity.status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ ok: false, error: identity.error }));
          return;
        }
        const rawId = identity.playerId;

        const authKey = `${clientIp}:${rawId}`;
        const lockCheck = checkAuthLockout(authKey);
        if (lockCheck.locked) {
          res.writeHead(429, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': corsOrigin || '*',
            'Retry-After': String(lockCheck.retryAfter),
            'Vary': 'Origin'
          });
          res.end(JSON.stringify({
            ok: false,
            error: `ZU VIELE FEHLVERSUCHE. BITTE ${lockCheck.retryAfter} SEKUNDEN WARTEN.`,
            retryAfter: lockCheck.retryAfter
          }));
          return;
        }

        const record = identity.record;
        if (!record || !hasPassword(record)) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ ok: false, error: 'Name oder Passwort falsch.' }));
          return;
        }

        const clientPwHash = (payload.passwordHash || '').trim() || null;
        if (!clientPwHash) {
          recordAuthFailure(authKey, 5, 60000);
          res.writeHead(403, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ ok: false, error: 'Passwort erforderlich.', requiresPassword: true }));
          return;
        }

        const authResult = verifyPassword(record.passwordHash, clientPwHash);
        if (!authResult.valid) {
          recordAuthFailure(authKey, 5, 60000);
          res.writeHead(403, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ ok: false, error: 'Name oder Passwort falsch.', requiresPassword: true }));
          return;
        }
        if (authResult.needsUpgrade && clientPwHash) {
          record.passwordHash = createSaltedPassword(clientPwHash);
          savePlayers();
        }

        recordAuthSuccess(authKey);

        const token = createSessionToken(rawId);
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': corsOrigin || '*',
          'Vary': 'Origin'
        });
        res.end(JSON.stringify({
          ok: true,
          playerId: rawId,
          sessionToken: token,
          expiresAt: sessionsStore[token].expiresAt
        }));
      });
      return;
    }

    // API: Delete cloud account (POST /api/player/delete)
    if (req.method === 'POST' && reqUrl === '/api/player/delete') {
      readJsonBody(req, res, corsOrigin, (err, payload) => {
        withPlayersStoreLock(() => {
        let rawId = (payload.playerId || '').trim().toUpperCase();
        if (rawId && !rawId.startsWith('#')) rawId = '#' + rawId;
        if (!rawId || !ID_REGEX.test(rawId)) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ ok: false, error: 'INVALID_ID' }));
          return;
        }

        const record = playersStore[rawId];
        if (!record) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ ok: false, error: 'SPIELER NICHT GEFUNDEN' }));
          return;
        }

        const clientPwHash = (payload.passwordHash || '').trim() || null;
        let token = (payload.sessionToken || '').trim() || null;
        const authHeader = req.headers['authorization'];
        if (!token && authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
          token = authHeader.slice(7).trim();
        }

        let authed = false;
        if (token) {
          const session = validateSessionToken(token, rawId);
          authed = !!(session && session.valid);
        }
        if (!authed) {
          const authResult = verifyPassword(record.passwordHash, clientPwHash);
          if (!authResult.valid) {
            res.writeHead(403, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
            res.end(JSON.stringify({ ok: false, error: 'FALSCHES PASSWORT', requiresPassword: true }));
            return;
          }
        }

        revokePlayerSessions(rawId);
        delete playersStore[rawId];
        savePlayers();
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': corsOrigin || '*',
          'Vary': 'Origin'
        });
        res.end(JSON.stringify({ ok: true }));
        });
      });
      return;
    }

    // API: Player Cloud Sync (POST)
    if (req.method === 'POST' && reqUrl === '/api/player/sync') {
      readJsonBody(req, res, corsOrigin, (err, payload) => {
        withPlayersStoreLock(() => {
        let rawId = (payload.playerId || '').trim().toUpperCase();
        if (!rawId) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ error: 'Missing playerId' }));
          return;
        }
        if (!rawId.startsWith('#')) rawId = '#' + rawId;

        if (!ID_REGEX.test(rawId)) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ ok: false, error: 'UNGÜLTIGES USER-ID FORMAT' }));
          return;
        }

        const authKey = `${clientIp}:${rawId}`;
        const lockCheck = checkAuthLockout(authKey);
        if (lockCheck.locked) {
          res.writeHead(429, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': corsOrigin || '*',
            'Retry-After': String(lockCheck.retryAfter),
            'Vary': 'Origin'
          });
          res.end(JSON.stringify({
            ok: false,
            error: `ZU VIELE FEHLVERSUCHE. BITTE ${lockCheck.retryAfter} SEKUNDEN WARTEN.`,
            retryAfter: lockCheck.retryAfter
          }));
          return;
        }

        // Check for session token in Authorization header or request payload
        let token = null;
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
          token = authHeader.slice(7).trim();
        } else if (payload.sessionToken) {
          token = String(payload.sessionToken).trim();
        }

        const clientPwHash = (payload.passwordHash || '').trim() || null;
        const existing = playersStore[rawId];
        let tokenAuthenticated = false;

        if (token) {
          const tokenCheck = validateSessionToken(token, rawId);
          if (!tokenCheck.valid) {
            res.writeHead(401, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': corsOrigin || '*',
              'Vary': 'Origin'
            });
            res.end(JSON.stringify({ ok: false, error: 'UNGUELTIGES ODER ABGELAUFENES TOKEN', tokenExpired: true }));
            return;
          }
          tokenAuthenticated = true;
        }

        if (!existing && !clientPwHash && !tokenAuthenticated) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ ok: false, error: 'Passwort erforderlich.' }));
          return;
        }

        // If record exists with a password, enforce authentication before overwriting
        if (existing && hasPassword(existing) && !tokenAuthenticated) {
          const authResult = verifyPassword(existing.passwordHash, clientPwHash);
          if (!authResult.valid) {
            recordAuthFailure(authKey, 5, 60000);
            res.writeHead(403, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
            res.end(JSON.stringify({ error: 'FALSCHES PASSWORT', requiresPassword: true }));
            return;
          }
        }

        recordAuthSuccess(authKey);

        // Support explicit password removal if requested and authenticated
        let finalPasswordHash = null;
        if (payload.removePassword) {
          finalPasswordHash = null;
          revokePlayerSessions(rawId);
        } else if (clientPwHash) {
          if (existing && existing.passwordHash && typeof existing.passwordHash === 'object' && existing.passwordHash.salt && existing.passwordHash.derivedHash) {
            const computed = derivePasswordKey(clientPwHash, existing.passwordHash.salt);
            if (safeCompareHashes(existing.passwordHash.derivedHash, computed)) {
              finalPasswordHash = existing.passwordHash;
            } else {
              finalPasswordHash = createSaltedPassword(clientPwHash);
              revokePlayerSessions(rawId);
            }
          } else {
            finalPasswordHash = createSaltedPassword(clientPwHash);
          }
        } else if (existing && hasPassword(existing)) {
          finalPasswordHash = existing.passwordHash;
        }

        if (!finalPasswordHash && !payload.removePassword) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ ok: false, error: 'Passwort erforderlich.' }));
          return;
        }

        const username = incomingUsername(payload);
        if (username && finalPasswordHash) {
          const clash = findAccountByUsername(username);
          if (clash && clash.id !== rawId) {
            res.writeHead(409, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
            res.end(JSON.stringify({ ok: false, error: 'NAME SCHON VERGEBEN', nameTaken: true }));
            return;
          }
        }

        playersStore[rawId] = {
          playerId: rawId,
          username: username || getRecordUsername({ username, state: payload.state }) || null,
          updatedAt: new Date().toISOString(),
          passwordHash: finalPasswordHash,
          state: sanitizeState(payload.state)
        };
        savePlayers();

        // Maintain or issue session token for authenticated password-protected accounts
        let issuedToken = tokenAuthenticated ? token : null;
        if (!issuedToken && hasPassword(playersStore[rawId])) {
          issuedToken = createSessionToken(rawId);
        }

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin || '*',
          'Vary': 'Origin'
        });
        res.end(JSON.stringify({
          ok: true,
          playerId: rawId,
          updatedAt: playersStore[rawId].updatedAt,
          hasPassword: hasPassword(playersStore[rawId]),
          sessionToken: issuedToken || undefined
        }));
        }).catch((e) => {
          console.warn(`[Server] player sync failed: ${e.message}`);
          if (!res.headersSent) {
            res.writeHead(500, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': corsOrigin || '*'
            });
            res.end(JSON.stringify({ ok: false, error: 'SPEICHERFEHLER' }));
          }
        });
      });
      return;
    }

    // API: Player Cloud Restore (POST /api/player/restore) - Secure JSON body
    if (req.method === 'POST' && reqUrl === '/api/player/restore') {
      readJsonBody(req, res, corsOrigin, (err, payload) => {
        withPlayersStoreLock(() => {
        const identity = resolveAccountIdentity(payload);
        if (!identity.ok) {
          res.writeHead(identity.status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ ok: false, error: identity.error }));
          return;
        }
        const rawId = identity.playerId;

        const authKey = `${clientIp}:${rawId}`;
        const lockCheck = checkAuthLockout(authKey);
        if (lockCheck.locked) {
          res.writeHead(429, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': corsOrigin || '*',
            'Retry-After': String(lockCheck.retryAfter),
            'Vary': 'Origin'
          });
          res.end(JSON.stringify({
            ok: false,
            error: `ZU VIELE FEHLVERSUCHE. BITTE ${lockCheck.retryAfter} SEKUNDEN WARTEN.`,
            retryAfter: lockCheck.retryAfter
          }));
          return;
        }

        const clientPwHash = (payload.passwordHash || '').trim() || null;
        const record = identity.record;

        if (!record || !hasPassword(record)) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ ok: false, error: 'Name oder Passwort falsch.' }));
          return;
        }

        if (!clientPwHash) {
          recordAuthFailure(authKey, 5, 60000);
          res.writeHead(403, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ ok: false, error: 'Passwort erforderlich.', requiresPassword: true }));
          return;
        }

        const authResult = verifyPassword(record.passwordHash, clientPwHash);
        if (!authResult.valid) {
          recordAuthFailure(authKey, 5, 60000);
          res.writeHead(403, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ ok: false, error: 'Name oder Passwort falsch.', requiresPassword: true }));
          return;
        }
        if (authResult.needsUpgrade && clientPwHash) {
          record.passwordHash = createSaltedPassword(clientPwHash);
          savePlayers();
        }

        recordAuthSuccess(authKey);

        const sessionToken = createSessionToken(rawId);

        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': corsOrigin || '*',
          'Cache-Control': 'no-cache',
          'Vary': 'Origin'
        });
        res.end(JSON.stringify({ ok: true, player: record, sessionToken }));
        }).catch((e) => {
          console.warn(`[Server] player restore failed: ${e.message}`);
          if (!res.headersSent) {
            res.writeHead(500, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': corsOrigin || '*'
            });
            res.end(JSON.stringify({ ok: false, error: 'SPEICHERFEHLER' }));
          }
        });
      });
      return;
    }

    // Retired: GET /api/player/:id?pw=hash leaked password hashes into URLs and access logs.
    // Superseded by POST /api/player/restore.
    if (req.method === 'GET' && reqUrl.startsWith('/api/player/')) {
      res.writeHead(410, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': corsOrigin || '*',
        'Vary': 'Origin'
      });
      res.end(JSON.stringify({ ok: false, error: 'ENDPUNKT ENTFERNT. BITTE POST /api/player/restore VERWENDEN.' }));
      return;
    }

    // API: Live Version Check (GET)
    if (req.method === 'POST' && reqUrl === '/api/leaderboard') {
      readJsonBody(req, res, corsOrigin, (err, payload) => {
        const playerId = parsePlayerId(payload && payload.playerId);
        const altitude = clampInt(payload && payload.altitude, 0, SCHEMA_BOUNDS.MAX_HIGH_SCORE, 0);
        const name = sanitizeLeaderboardName(payload && payload.name);
        if (!playerId || altitude <= 0) {
          res.writeHead(400, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': corsOrigin || '*'
          });
          res.end(JSON.stringify({ ok: false, error: 'UNGÜLTIGER SCORE' }));
          return;
        }

        const store = readJsonStore(PUBLIC_LB_FILE) || {};
        let targetId = playerId;
        const nameKey = leaderboardNameKey(name);
        for (const [id, row] of Object.entries(store)) {
          if (!row || typeof row !== 'object') continue;
          if (leaderboardNameKey(row.name) === nameKey) {
            const existingId = parsePlayerId(row.playerId || id);
            if (existingId) {
              targetId = existingId;
              break;
            }
          }
        }
        const existing = store[targetId] || store[playerId];
        const nextAltitude = existing && existing.altitude > altitude ? existing.altitude : altitude;
        store[targetId] = {
          playerId: targetId,
          name,
          altitude: nextAltitude,
          updatedAt: new Date().toISOString()
        };
        if (playerId !== targetId && store[playerId]) {
          delete store[playerId];
        }
        if (!writeJsonStore(PUBLIC_LB_FILE, store)) {
          res.writeHead(500, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': corsOrigin || '*'
          });
          res.end(JSON.stringify({ ok: false, error: 'SPEICHERFEHLER' }));
          return;
        }

        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': corsOrigin || '*',
          'Vary': 'Origin'
        });
        res.end(JSON.stringify({ ok: true, altitude: nextAltitude, playerId }));
      });
      return;
    }

    if (req.method === 'GET' && reqUrl === '/api/leaderboard') {
      reloadPlayers();
      const entries = buildPublicLeaderboard();
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': corsOrigin || '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Vary': 'Origin'
      });
      res.end(JSON.stringify({ ok: true, entries }));
      return;
    }

    if (req.method === 'GET' && reqUrl === '/api/version') {
      let currentVer = '3.17.0';
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
        if (pkg && pkg.version) currentVer = pkg.version;
      } catch (e) {}

      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(JSON.stringify({
        version: currentVer,
        tag: `v${currentVer}`,
        timestamp: Date.now()
      }));
      return;
    }

    if (reqUrl === '/' || reqUrl === '') {
      reqUrl = '/index.html';
    }

    const relPath = path.normalize(decodeURIComponent(reqUrl)).replace(/^(\.\.[\/\\])+/, '').replace(/^[/\\]+/, '');
    const filePath = path.join(ROOT_DIR, relPath);

    if (relPath === 'design' || relPath === 'design' + path.sep) {
      serveDesignIndex(res);
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isDirectory() && relPath === 'design') {
        serveDesignIndex(res);
        return;
      }
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const isCriticalFile = ext === '.html' || ext === '.json' || relPath.includes('sw.js') || relPath.includes('Constants.js');

      const headers = {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': isCriticalFile ? 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' : 'no-cache'
      };

      if (isCriticalFile) {
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
        headers['Surrogate-Control'] = 'no-store';
      }

      res.writeHead(200, headers);

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
  };
}

function createServer(sslOptions = null) {
  const handler = createRequestListener();
  if (sslOptions && sslOptions.key && sslOptions.cert) {
    return https.createServer(sslOptions, handler);
  }
  return http.createServer(handler);
}

function startServer(port = PORT, options = {}) {
  const useHttps = options.https !== undefined
    ? options.https
    : (process.argv.includes('--https') || process.env.HTTPS === 'true' || process.env.USE_HTTPS === 'true');

  const localIp = getLocalIpAddress();

  if (useHttps || (options.autoDetectCerts && fs.existsSync(KEY_FILE) && fs.existsSync(CERT_FILE))) {
    if (!fs.existsSync(KEY_FILE) || !fs.existsSync(CERT_FILE)) {
      console.log('[TLS] Keine Zertifikate in certs/ gefunden. Erzeuge lokale Entwickler-Zertifikate...');
      try {
        const { generateCerts } = require(path.join(__dirname, 'generate_certs.js'));
        generateCerts();
      } catch (err) {
        console.error('[TLS] Fehler beim Erzeugen der Zertifikate:', err);
      }
    }

    if (fs.existsSync(KEY_FILE) && fs.existsSync(CERT_FILE)) {
      const sslOptions = {
        key: fs.readFileSync(KEY_FILE),
        cert: fs.readFileSync(CERT_FILE)
      };

      const httpsPort = options.httpsPort || parseInt(process.env.HTTPS_PORT, 10) || (port === 3000 ? 3443 : port + 443);
      const server = createServer(sslOptions);
      const localUrl = `https://localhost:${httpsPort}`;
      const networkUrl = `https://${localIp}:${httpsPort}`;

      server.listen(httpsPort, '0.0.0.0', () => {
        console.log('\n======================================================');
        console.log('         SPACE JUMP - MOBILE SERVER (HTTPS/TLS)       ');
        console.log('======================================================\n');
        console.log(`  Local:    ${localUrl}`);
        console.log(`  Network:  ${networkUrl}\n`);

        if (qrcode) {
          console.log('  SCAN MIT DEM SMARTPHONE (im selben WLAN):\n');
          qrcode.generate(networkUrl, { small: true }, (qr) => {
            console.log(qr);
          });
        }

        console.log('======================================================');
        console.log('  Druecke Strg+C zum Beenden des Servers');
        console.log('======================================================\n');
      });

      // HTTP to HTTPS Redirect server
      const httpRedirectServer = http.createServer((req, res) => {
        const hostHeader = req.headers.host || `localhost:${port}`;
        const hostWithoutPort = hostHeader.split(':')[0];
        const redirectUrl = `https://${hostWithoutPort}:${httpsPort}${req.url}`;
        res.writeHead(301, {
          'Location': redirectUrl,
          'Content-Type': 'text/plain; charset=utf-8'
        });
        res.end(`Redirecting to ${redirectUrl}`);
      });

      httpRedirectServer.listen(port, '0.0.0.0', () => {
        console.log(`  HTTP Redirect: http://localhost:${port} -> https://localhost:${httpsPort}\n`);
      });

      return { server, httpRedirectServer, localUrl, networkUrl, isHttps: true, httpsPort, httpPort: port };
    }
  }

  // Standard HTTP server fallback
  const startHttp = (tryPort, attempt) => {
    const server = createServer();
    const localUrl = `http://localhost:${tryPort}`;
    const networkUrl = `http://${localIp}:${tryPort}`;

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && attempt < 20) {
        console.warn(`[Server] Port ${tryPort} belegt, weiche auf ${tryPort + 1} aus.`);
        startHttp(tryPort + 1, attempt + 1);
        return;
      }
      console.error(err);
      process.exit(1);
    });

    server.listen(tryPort, '0.0.0.0', () => {
      console.log('\n======================================================');
      console.log('              SPACE JUMP - MOBILE SERVER              ');
      console.log('======================================================\n');
      console.log(`  Local:    ${localUrl}`);
      console.log(`  Network:  ${networkUrl}`);
      console.log(`  Mockups:  ${localUrl}/design/\n`);

      if (qrcode) {
        console.log('  SCAN MIT DEM SMARTPHONE (im selben WLAN):\n');
        qrcode.generate(networkUrl, { small: true }, (qr) => {
          console.log(qr);
        });
      }

      console.log('  Tipp: Starte mit "npm run start:https" fuer verschluesselten TLS-Zugriff.\n');
      console.log('======================================================');
      console.log('  Druecke Strg+C zum Beenden des Servers');
      console.log('======================================================\n');
    });

    return { server, localUrl, networkUrl, isHttps: false, httpPort: tryPort };
  };

  return startHttp(port, 0);
}

if (require.main === module) {
  startServer();
}

module.exports = {
  createServer,
  createRequestListener,
  startServer,
  getLocalIpAddress,
  reloadPlayers,
  derivePasswordKey,
  createSaltedPassword,
  verifyPassword,
  hasPassword,
  loadSessions,
  reloadSessions,
  createSessionToken,
  validateSessionToken,
  revokePlayerSessions,
  sanitizeState,
  SCHEMA_BOUNDS,
  KEY_FILE,
  CERT_FILE,
  CERTS_DIR
};
