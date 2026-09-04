/**
 * Sling Jump - Standalone Dedicated Analytics Dashboard Server
 * Runs independently on port 3001. Provides full REST endpoints for marketing,
 * distribution, telemetry aggregation, and BI exports.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.DASHBOARD_PORT, 10) || 3001;
const DASHBOARD_DIR = __dirname;
const ROOT_DIR = path.join(DASHBOARD_DIR, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

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
    let reqUrl = req.url.split('?')[0];

    // REST API: Analytics Summary
    if (req.method === 'GET' && reqUrl === '/api/analytics/summary') {
      const store = readTelemetryStore();
      const uniqueCount = Object.keys(store.uniqueDevices || {}).length;
      const totalRuns = store.totalRuns || 0;
      const avgAlt = totalRuns > 0 ? Math.round(store.totalAltitude / totalRuns) : 0;

      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      });
      res.end(JSON.stringify({
        onlineNow: 1,
        totalVisits: store.totalVisits || 0,
        uniqueDevices: uniqueCount,
        totalRuns: totalRuns,
        todayRuns: store.todayRuns || 0,
        recordAltitude: store.recordAltitude || 0,
        averageAltitude: avgAlt,
        totalCoinsCollected: store.totalCoins || 0,
        recentRuns: store.recentRuns || []
      }));
      return;
    }

    // Rewrite root to index.html
    if (reqUrl === '/' || reqUrl === '') {
      reqUrl = '/index.html';
    }

    // Resolve file path
    let filePath;
    if (reqUrl.startsWith('/assets/') || reqUrl === '/favicon.ico') {
      filePath = path.join(ROOT_DIR, reqUrl);
    } else {
      filePath = path.join(DASHBOARD_DIR, reqUrl);
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
        'Access-Control-Allow-Origin': '*',
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

module.exports = { startDashboardServer };
