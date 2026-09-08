/**
 * Server-side dashboard PIN gate shared by scripts/serve.js and dashboard/server.js.
 * The browser only holds a short-lived token; the PIN itself never ships in client JS.
 *
 * Rate-limit / lockout Maps here are intentionally volatile: a process restart clears them.
 */
const crypto = require('crypto');

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;
const dashboardTokens = new Map(); // token -> { expiresAt }
const loginLockoutStore = new Map(); // ip -> { failures, lockoutUntil }

function expectedPin() {
  return String(process.env.DASHBOARD_PIN || '2026');
}

function pinMatches(pin) {
  const expected = crypto.createHash('sha256').update(expectedPin(), 'utf8').digest();
  const actual = crypto.createHash('sha256').update(String(pin || ''), 'utf8').digest();
  return crypto.timingSafeEqual(expected, actual);
}

function extractBearer(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

function validateDashboardToken(token) {
  if (!token || typeof token !== 'string') return false;
  const rec = dashboardTokens.get(token);
  if (!rec) return false;
  if (Date.now() > rec.expiresAt) {
    dashboardTokens.delete(token);
    return false;
  }
  return true;
}

function isDashboardAuthorized(req) {
  return validateDashboardToken(extractBearer(req));
}

function revokeDashboardToken(token) {
  if (token) dashboardTokens.delete(token);
}

function checkDashboardLockout(ip) {
  const now = Date.now();
  const record = loginLockoutStore.get(ip);
  if (record && record.lockoutUntil > now) {
    const retryAfter = Math.max(1, Math.ceil((record.lockoutUntil - now) / 1000));
    return { locked: true, retryAfter };
  }
  return { locked: false };
}

function recordDashboardLoginFailure(ip, maxFailures = 5, lockoutMs = 60000) {
  const now = Date.now();
  let record = loginLockoutStore.get(ip);
  if (!record || (record.lockoutUntil && record.lockoutUntil < now)) {
    record = { failures: 1, lockoutUntil: 0 };
  } else {
    record.failures += 1;
  }
  if (record.failures >= maxFailures) {
    record.lockoutUntil = now + lockoutMs;
  }
  loginLockoutStore.set(ip, record);
}

function recordDashboardLoginSuccess(ip) {
  loginLockoutStore.delete(ip);
}

function attemptDashboardLogin(pin, ip) {
  const lock = checkDashboardLockout(ip);
  if (lock.locked) {
    return {
      ok: false,
      status: 429,
      retryAfter: lock.retryAfter,
      error: `ZU VIELE FEHLVERSUCHE. BITTE ${lock.retryAfter} SEKUNDEN WARTEN.`
    };
  }
  if (!pinMatches(pin)) {
    recordDashboardLoginFailure(ip);
    return { ok: false, status: 403, error: 'UNGÜLTIGER PIN' };
  }
  recordDashboardLoginSuccess(ip);
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  dashboardTokens.set(token, { expiresAt });
  return { ok: true, token, expiresAt };
}

module.exports = {
  TOKEN_TTL_MS,
  extractBearer,
  isDashboardAuthorized,
  revokeDashboardToken,
  attemptDashboardLogin
};
