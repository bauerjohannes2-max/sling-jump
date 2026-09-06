/**
 * Sling Jump - Mobile Access Local Server with QR Code
 * Auto-detects LAN IPv4 and displays scannable terminal QR code for instant phone testing.
 */
const http = require('http');
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

// Telemetry Persistence and Memory Store
const DATA_DIR = path.join(ROOT_DIR, 'data');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

function loadAnalytics() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(ANALYTICS_FILE)) {
      return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
    }
  } catch (e) {}
  return {
    totalVisits: 0,
    uniqueDevices: {},
    totalRuns: 0,
    todayRuns: 0,
    currentDate: new Date().toISOString().slice(0, 10),
    recordAltitude: 0,
    totalAltitude: 0,
    totalCoins: 0,
    recentRuns: []
  };
}

let analyticsStore = loadAnalytics();
const activeSessions = new Map(); // sessionId -> lastHeartbeat (ms)

function saveAnalytics() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analyticsStore, null, 2), 'utf8');
  } catch (e) {}
}

// Cross-Device Player Cloud Store
const PLAYERS_FILE = path.join(DATA_DIR, 'players.json');

function loadPlayers() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(PLAYERS_FILE)) {
      return JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
}

let playersStore = loadPlayers();

function reloadPlayers() {
  playersStore = loadPlayers();
  return playersStore;
}

function savePlayers() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(PLAYERS_FILE, JSON.stringify(playersStore, null, 2), 'utf8');
  } catch (e) {}
}

// Cross-Device Player Ephemeral Sessions Store
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function loadSessions() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(SESSIONS_FILE)) {
      return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
}

let sessionsStore = loadSessions();

function reloadSessions() {
  sessionsStore = loadSessions();
  return sessionsStore;
}

function saveSessions() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessionsStore, null, 2), 'utf8');
  } catch (e) {}
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


function getActivePlayersCount() {
  const now = Date.now();
  for (const [sid, lastSeen] of activeSessions.entries()) {
    if (now - lastSeen > 45000) {
      activeSessions.delete(sid);
    }
  }
  return activeSessions.size;
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

// In-Memory Rate Limiting & Brute-Force Protection
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
  for (const [k, v] of Object.entries(sessionsStore)) {
    if (v.expiresAt && now > v.expiresAt) delete sessionsStore[k];
  }
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

const ID_REGEX = /^#[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4,10}$/;

function sanitizeState(state) {
  if (!state || typeof state !== 'object') return {};
  const clean = {};
  for (const [k, v] of Object.entries(state)) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
    clean[k] = v;
  }
  return clean;
}

function createServer() {
  return http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
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
    if (reqUrl.startsWith('/api/player/')) {
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
        let rawId = (payload.playerId || '').trim().toUpperCase();
        if (!rawId) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ ok: false, error: 'Missing playerId' }));
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

        const record = playersStore[rawId];
        if (!record) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ ok: false, error: 'Player not found', queriedId: rawId }));
          return;
        }

        const clientPwHash = (payload.passwordHash || '').trim() || null;

        if (hasPassword(record)) {
          const authResult = verifyPassword(record.passwordHash, clientPwHash);
          if (!authResult.valid) {
            recordAuthFailure(authKey, 5, 60000);
            res.writeHead(403, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
            res.end(JSON.stringify({ ok: false, error: 'FALSCHES PASSWORT', requiresPassword: true }));
            return;
          }
          if (authResult.needsUpgrade && clientPwHash) {
            record.passwordHash = createSaltedPassword(clientPwHash);
            savePlayers();
          }
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

    // API: Player Cloud Sync (POST)
    if (req.method === 'POST' && reqUrl === '/api/player/sync') {
      readJsonBody(req, res, corsOrigin, (err, payload) => {
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

        playersStore[rawId] = {
          playerId: rawId,
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
      });
      return;
    }

    // API: Player Cloud Restore (POST /api/player/restore) - Secure JSON body
    if (req.method === 'POST' && reqUrl === '/api/player/restore') {
      readJsonBody(req, res, corsOrigin, (err, payload) => {
        let rawId = (payload.playerId || '').trim().toUpperCase();
        if (!rawId) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ ok: false, error: 'Missing playerId' }));
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

        const clientPwHash = (payload.passwordHash || '').trim() || null;
        const record = playersStore[rawId];

        if (!record) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
          res.end(JSON.stringify({ ok: false, error: 'Player not found', queriedId: rawId }));
          return;
        }

        if (hasPassword(record)) {
          const authResult = verifyPassword(record.passwordHash, clientPwHash);
          if (!authResult.valid) {
            recordAuthFailure(authKey, 5, 60000);
            res.writeHead(403, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': corsOrigin || '*' });
            res.end(JSON.stringify({ ok: false, error: 'FALSCHES PASSWORT', requiresPassword: true }));
            return;
          }
          // Transparent upgrade of legacy unsalted records upon successful authentication
          if (authResult.needsUpgrade && clientPwHash) {
            record.passwordHash = createSaltedPassword(clientPwHash);
            savePlayers();
          }
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
      });
      return;
    }

    // API: Player Cloud Restore Legacy (GET /api/player/:id?pw=hash)
    if (req.method === 'GET' && reqUrl.startsWith('/api/player/')) {
      let rawId = decodeURIComponent(reqUrl.replace('/api/player/', '')).trim().toUpperCase();
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
          'Content-Type': 'application/json; charset=utf-8',
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

      // Parse password hash from query string
      const fullUrl = req.url;
      const qIdx = fullUrl.indexOf('?');
      const params = qIdx >= 0 ? new URLSearchParams(fullUrl.slice(qIdx)) : new URLSearchParams();
      const clientPw = (params.get('pw') || '').trim();

      const record = playersStore[rawId];
      if (record) {
        // Validate password if record is password-protected
        if (hasPassword(record)) {
          const authResult = verifyPassword(record.passwordHash, clientPw);
          if (!authResult.valid) {
            recordAuthFailure(authKey, 5, 60000);
            res.writeHead(403, {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': corsOrigin || '*',
              'Vary': 'Origin'
            });
            res.end(JSON.stringify({ ok: false, error: 'FALSCHES PASSWORT', requiresPassword: true }));
            return;
          }
          // Transparent upgrade of legacy unsalted records upon successful authentication
          if (authResult.needsUpgrade && clientPw) {
            record.passwordHash = createSaltedPassword(clientPw);
            savePlayers();
          }
        }

        recordAuthSuccess(authKey);

        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': corsOrigin || '*',
          'Cache-Control': 'no-cache',
          'Vary': 'Origin'
        });
        res.end(JSON.stringify({ ok: true, player: record }));
      } else {
        res.writeHead(404, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': corsOrigin || '*',
          'Vary': 'Origin'
        });
        res.end(JSON.stringify({ ok: false, error: 'Player not found', queriedId: rawId }));
      }
      return;
    }

    // API: Telemetry Ingest (POST)
    if (req.method === 'POST' && reqUrl === '/api/telemetry') {
      readJsonBody(req, res, corsOrigin, (err, payload) => {
          const today = new Date().toISOString().slice(0, 10);
          if (analyticsStore.currentDate !== today) {
            analyticsStore.currentDate = today;
            analyticsStore.todayRuns = 0;
          }

          if (payload.sessionId) {
            activeSessions.set(payload.sessionId, Date.now());
          }

          if (payload.event === 'session_start') {
            analyticsStore.totalVisits = (analyticsStore.totalVisits || 0) + 1;
            if (payload.deviceId) {
              analyticsStore.uniqueDevices[payload.deviceId] = (analyticsStore.uniqueDevices[payload.deviceId] || 0) + 1;
            }
            saveAnalytics();
          } else if (payload.event === 'run_completed' && payload.data) {
            analyticsStore.totalRuns = (analyticsStore.totalRuns || 0) + 1;
            analyticsStore.todayRuns = (analyticsStore.todayRuns || 0) + 1;
            const alt = payload.data.altitude || 0;
            const coins = payload.data.coins || 0;
            analyticsStore.totalAltitude = (analyticsStore.totalAltitude || 0) + alt;
            analyticsStore.totalCoins = (analyticsStore.totalCoins || 0) + coins;
            if (alt > (analyticsStore.recordAltitude || 0)) {
              analyticsStore.recordAltitude = alt;
            }

            if (!analyticsStore.recentRuns) analyticsStore.recentRuns = [];
            analyticsStore.recentRuns.unshift({
              timestamp: new Date().toISOString(),
              altitude: alt,
              coins: coins,
              shipId: payload.data.shipId || 'arrow',
              duration: payload.data.durationSeconds || 0,
              isNewRecord: !!payload.data.isNewRecord
            });
            if (analyticsStore.recentRuns.length > 30) {
              analyticsStore.recentRuns.length = 30;
            }
            saveAnalytics();
          }

          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': corsOrigin || '*',
            'Vary': 'Origin'
          });
          res.end(JSON.stringify({ ok: true, activeOnline: getActivePlayersCount() }));
      });
      return;
    }

    // API: Telemetry Stats (GET)
    if (req.method === 'GET' && reqUrl === '/api/telemetry/stats') {
      const activeCount = getActivePlayersCount();
      const uniqueCount = Object.keys(analyticsStore.uniqueDevices || {}).length;
      const totalRuns = analyticsStore.totalRuns || 0;
      const avgAlt = totalRuns > 0 ? Math.round(analyticsStore.totalAltitude / totalRuns) : 0;

      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      res.end(JSON.stringify({
        onlineNow: activeCount,
        totalVisits: analyticsStore.totalVisits || 0,
        uniqueDevices: uniqueCount,
        totalRuns: totalRuns,
        todayRuns: analyticsStore.todayRuns || 0,
        recordAltitude: analyticsStore.recordAltitude || 0,
        averageAltitude: avgAlt,
        totalCoinsCollected: analyticsStore.totalCoins || 0,
        recentRuns: analyticsStore.recentRuns || []
      }));
      return;
    }

    // API: Live Version Check (GET)
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

    // Friendly URL rewrite for Dashboard
    if (reqUrl === '/dashboard') {
      reqUrl = '/dashboard.html';
    }

    if (reqUrl === '/' || reqUrl === '') {
      reqUrl = '/index.html';
    }

    const safePath = path.normalize(decodeURIComponent(reqUrl)).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(ROOT_DIR, safePath);

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const isCriticalFile = ext === '.html' || ext === '.json' || safePath.includes('sw.js') || safePath.includes('Constants.js');

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
  });
}

function startServer(port = PORT) {
  const server = createServer();
  const localIp = getLocalIpAddress();
  const localUrl = `http://localhost:${port}`;
  const networkUrl = `http://${localIp}:${port}`;

  server.listen(port, '0.0.0.0', () => {
    console.log('\n======================================================');
    console.log('              SLING JUMP - MOBILE SERVER              ');
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

  return { server, localUrl, networkUrl };
}

if (require.main === module) {
  startServer();
}

module.exports = {
  createServer,
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
  revokePlayerSessions
};
