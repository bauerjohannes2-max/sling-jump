/**
 * Sling Jump - Mobile Access Local Server with QR Code
 * Auto-detects LAN IPv4 and displays scannable terminal QR code for instant phone testing.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

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

function getActivePlayersCount() {
  const now = Date.now();
  for (const [sid, lastSeen] of activeSessions.entries()) {
    if (now - lastSeen > 45000) {
      activeSessions.delete(sid);
    }
  }
  return activeSessions.size;
}

function createServer() {
  return http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];

    // API: Telemetry Ingest (POST)
    if (req.method === 'POST' && reqUrl === '/api/telemetry') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body);
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
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({ ok: true, activeOnline: getActivePlayersCount() }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
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

module.exports = { startServer, getLocalIpAddress };
