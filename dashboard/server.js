/**
 * Space Jump - Standalone Dedicated Analytics Dashboard Server
 * Runs independently on port 3001. Provides full REST endpoints for marketing,
 * distribution, telemetry aggregation, and BI exports.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const {
  attemptDashboardLogin,
  isDashboardAuthorized,
  extractBearer,
  revokeDashboardToken
} = require('../scripts/dashboard_gate');

const PORT = parseInt(process.env.DASHBOARD_PORT, 10) || 3001;
const DASHBOARD_DIR = __dirname;
const ROOT_DIR = path.join(DASHBOARD_DIR, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const MAX_BODY_BYTES = 100 * 1024;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket ? req.socket.remoteAddress : '127.0.0.1';
}

function readJsonBody(req, res, callback) {
  let body = '';
  let exceeded = false;
  req.on('data', chunk => {
    if (exceeded) return;
    body += chunk;
    if (body.length > MAX_BODY_BYTES) {
      exceeded = true;
      res.writeHead(413, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: 'PAYLOAD ZU GROSS (MAX 100KB)' }));
    }
  });
  req.on('end', () => {
    if (exceeded) return;
    try {
      callback(null, JSON.parse(body || '{}'));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: 'UNGÜLTIGES JSON' }));
    }
  });
}

function sendJson(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache',
    ...extraHeaders
  });
  res.end(JSON.stringify(payload));
}

function telemetryPayload() {
  const store = readTelemetryStore();
  const uniqueCount = Object.keys(store.uniqueDevices || {}).length;
  const totalRuns = store.totalRuns || 0;
  const avgAlt = totalRuns > 0 ? Math.round(store.totalAltitude / totalRuns) : 0;
  return {
    onlineNow: 1,
    totalVisits: store.totalVisits || 0,
    uniqueDevices: uniqueCount,
    totalRuns: totalRuns,
    todayRuns: store.todayRuns || 0,
    recordAltitude: store.recordAltitude || 0,
    averageAltitude: avgAlt,
    totalCoinsCollected: store.totalCoins || 0,
    recentRuns: store.recentRuns || []
  };
}

function readTelemetryStore() {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      return JSON.parse(fs.readFileSync(ANALYTICS_FILE, 'utf8'));
    }
  } catch (e) {}
  return {
    totalVisits: 0,
    uniqueDevices: {},
    totalRuns: 0,
    todayRuns: 0,
    recordAltitude: 0,
    totalAltitude: 0,
    totalCoins: 0,
    recentRuns: []
  };
}

function createDashboardServer() {
  return http.createServer((req, res) => {
    const reqUrl = req.url.split('?')[0];

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      res.end();
      return;
    }

    if (req.method === 'POST' && reqUrl === '/api/dashboard/login') {
      readJsonBody(req, res, (err, payload) => {
        const result = attemptDashboardLogin(payload.pin, getClientIp(req));
        const extra = result.retryAfter ? { 'Retry-After': String(result.retryAfter) } : {};
        if (result.ok) {
          sendJson(res, 200, { ok: true, token: result.token, expiresAt: result.expiresAt }, extra);
        } else {
          sendJson(res, result.status, { ok: false, error: result.error, retryAfter: result.retryAfter }, extra);
        }
      });
      return;
    }

    if (req.method === 'POST' && reqUrl === '/api/dashboard/logout') {
      revokeDashboardToken(extractBearer(req));
      sendJson(res, 200, { ok: true });
      return;
    }

    // REST API: Telemetry Stats. Same route name and payload as scripts/serve.js so the
    // dashboard's LIVE mode works against either server. Requires a dashboard token.
    if (req.method === 'GET' && reqUrl === '/api/telemetry/stats') {
      if (!isDashboardAuthorized(req)) {
        sendJson(res, 401, { ok: false, error: 'DASHBOARD-ANMELDUNG ERFORDERLICH' });
        return;
      }
      sendJson(res, 200, telemetryPayload());
      return;
    }

    let fileUrl = reqUrl;
    if (fileUrl === '/' || fileUrl === '') {
      fileUrl = '/index.html';
    }

    let filePath;
    if (fileUrl.startsWith('/assets/') || fileUrl === '/favicon.ico') {
      filePath = path.join(ROOT_DIR, fileUrl);
    } else {
      filePath = path.join(DASHBOARD_DIR, fileUrl);
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found - Dashboard App');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });

      fs.createReadStream(filePath).pipe(res);
    });
  });
}

function startDashboardServer(port = PORT) {
  const server = createDashboardServer();
  server.listen(port, '0.0.0.0', () => {
    console.log(`[Dashboard App] Standalone Server active on http://localhost:${port}`);
  });
  return server;
}

if (require.main === module) {
  startDashboardServer();
}

module.exports = { startDashboardServer, createDashboardServer };
