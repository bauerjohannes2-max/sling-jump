/**
 * HTTP smoke test for scripts/serve.js: version endpoint, game HTML, and two overlapping player syncs.
 */
const http = require('http');
const { createServer } = require('./serve.js');

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

async function main() {
  const gameServer = createServer();
  const gamePort = await listen(gameServer);

  try {
    const version = await request(gamePort, 'GET', '/api/version');
    assert(version.status === 200 && version.json && version.json.version, 'GET /api/version should return a version');

    const home = await request(gamePort, 'GET', '/');
    assert(home.status === 200 && /Space Jump/i.test(home.text), 'GET / should serve the game HTML');

    const goneDash = await request(gamePort, 'GET', '/dashboard');
    assert(goneDash.status === 404, `GET /dashboard should be 404, got ${goneDash.status}`);

    const goneIngest = await request(gamePort, 'POST', '/api/telemetry', { body: { event: 'session_start' } });
    assert(goneIngest.status === 404, `POST /api/telemetry should be 404, got ${goneIngest.status}`);

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

    console.log('[smoke] serve.js passed');
  } finally {
    await closeServer(gameServer);
  }
}

main().catch((err) => {
  console.error('[smoke] FAILED:', err.message);
  process.exit(1);
});
