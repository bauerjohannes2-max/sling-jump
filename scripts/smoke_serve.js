/**
 * HTTP smoke test for scripts/serve.js: version endpoint, dashboard PIN gate,
 * protected telemetry stats, and two overlapping player syncs.
 */
const http = require('http');
const { createServer } = require('./serve.js');
const { createDashboardServer } = require('../dashboard/server.js');

function request(port, method, urlPath, { body, headers } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: urlPath,
      method,
      headers: {
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({ status: res.statusCode, json, text: data });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function listen(server) {
  return new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
    server.on('error', reject);
  });
}

function closeServer(server) {
  return new Promise((resolve) => server.close(() => resolve()));
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

async function exerciseProtectedStats(port, label) {
  const denied = await request(port, 'GET', '/api/telemetry/stats');
  assert(denied.status === 401, `${label}: stats without token should be 401, got ${denied.status}`);

  const badLogin = await request(port, 'POST', '/api/dashboard/login', { body: { pin: '0000' } });
  assert(badLogin.status === 403, `${label}: wrong PIN should be 403, got ${badLogin.status}`);

  const pin = process.env.DASHBOARD_PIN || '2026';
  const login = await request(port, 'POST', '/api/dashboard/login', { body: { pin } });
  assert(login.status === 200 && login.json && login.json.token, `${label}: login should return a token`);

  const ok = await request(port, 'GET', '/api/telemetry/stats', {
    headers: { Authorization: 'Bearer ' + login.json.token }
  });
  assert(ok.status === 200 && ok.json && typeof ok.json.totalRuns === 'number', `${label}: authed stats should be 200`);
}

async function main() {
  const gameServer = createServer();
  const dashServer = createDashboardServer();
  const gamePort = await listen(gameServer);
  const dashPort = await listen(dashServer);

  try {
    const version = await request(gamePort, 'GET', '/api/version');
    assert(version.status === 200 && version.json && version.json.version, 'GET /api/version should return a version');

    const home = await request(gamePort, 'GET', '/');
    assert(home.status === 200 && /Space Jump/i.test(home.text), 'GET / should serve the game HTML');

    const dashRedirect = await request(gamePort, 'GET', '/dashboard');
    assert(dashRedirect.status === 302, 'GET /dashboard should redirect to /dashboard/');

    await exerciseProtectedStats(gamePort, 'serve.js');
    await exerciseProtectedStats(dashPort, 'dashboard/server.js');

    const idA = '#SMK2-AAA2';
    const idB = '#SMK2-BBB2';
    const [syncA, syncB] = await Promise.all([
      request(gamePort, 'POST', '/api/player/sync', { body: { playerId: idA, state: { cores: 11, highScore: 100 } } }),
      request(gamePort, 'POST', '/api/player/sync', { body: { playerId: idB, state: { cores: 22, highScore: 200 } } })
    ]);
    assert(syncA.status === 200 && syncA.json && syncA.json.ok, 'sync A should succeed');
    assert(syncB.status === 200 && syncB.json && syncB.json.ok, 'sync B should succeed');

    const restA = await request(gamePort, 'POST', '/api/player/restore', { body: { playerId: idA } });
    const restB = await request(gamePort, 'POST', '/api/player/restore', { body: { playerId: idB } });
    assert(restA.status === 200 && restA.json.player && restA.json.player.state.cores === 11, 'player A save must survive a parallel sync');
    assert(restB.status === 200 && restB.json.player && restB.json.player.state.cores === 22, 'player B save must survive a parallel sync');

    console.log('[smoke] serve.js and dashboard gate passed');
  } finally {
    await closeServer(gameServer);
    await closeServer(dashServer);
  }
}

main().catch((err) => {
  console.error('[smoke] FAILED:', err.message);
  process.exit(1);
});
