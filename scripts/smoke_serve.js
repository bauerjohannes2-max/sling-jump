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

    const nonce = Math.random().toString(36).toUpperCase().replace(/[^23456789ABCDEFGHJKLMNPQRSTUVWXYZ]/g, '2').slice(0, 4);
    const idA = `#SMK2-${nonce}`;
    const idB = `#SMK3-${nonce}`;
    const hashA = 'aa'.repeat(32);
    const hashB = 'bb'.repeat(32);
    const nameA = `SmokeA${nonce}`;
    const nameB = `SmokeB${nonce}`;

    const guestSync = await request(gamePort, 'POST', '/api/player/sync', {
      body: { playerId: idA, state: { cores: 1, highScore: 1 } }
    });
    assert(guestSync.status === 400, `sync without password should be 400, got ${guestSync.status}`);

    const [syncA, syncB] = await Promise.all([
      request(gamePort, 'POST', '/api/player/sync', {
        body: {
          playerId: idA,
          passwordHash: hashA,
          username: nameA,
          state: { cores: 11, highScore: 100, playerProfile: { pilotName: nameA, accountName: nameA } }
        }
      }),
      request(gamePort, 'POST', '/api/player/sync', {
        body: {
          playerId: idB,
          passwordHash: hashB,
          username: nameB,
          state: { cores: 22, highScore: 200, playerProfile: { pilotName: nameB, accountName: nameB } }
        }
      })
    ]);
    assert(syncA.status === 200 && syncA.json && syncA.json.ok, 'sync A should succeed');
    assert(syncB.status === 200 && syncB.json && syncB.json.ok, 'sync B should succeed');

    const restNoPw = await request(gamePort, 'POST', '/api/player/restore', { body: { playerId: idA } });
    assert(restNoPw.status === 403, `restore without password should be 403, got ${restNoPw.status}`);

    const restA = await request(gamePort, 'POST', '/api/player/restore', { body: { playerId: idA, passwordHash: hashA } });
    const restB = await request(gamePort, 'POST', '/api/player/restore', { body: { username: nameB, passwordHash: hashB } });
    assert(restA.status === 200 && restA.json.player && restA.json.player.state.cores === 11, 'player A save must survive a parallel sync');
    assert(restB.status === 200 && restB.json.player && restB.json.player.state.cores === 22, 'player B save must restore by username');

    const loginName = await request(gamePort, 'POST', '/api/player/login', { body: { username: nameA, passwordHash: hashA } });
    assert(loginName.status === 200 && loginName.json && loginName.json.sessionToken, 'login by username should return a session token');

    const board = await request(gamePort, 'GET', '/api/leaderboard');
    assert(board.status === 200 && board.json && board.json.ok && Array.isArray(board.json.entries), 'GET /api/leaderboard should return entries');
    const names = board.json.entries.map((e) => e.name);
    const alpha = board.json.entries.find((e) => e.name === nameA);
    const bravo = board.json.entries.find((e) => e.name === nameB);
    assert(bravo && bravo.altitude === 200, `leaderboard must include ${nameB} at 200m`);
    assert(alpha && alpha.altitude === 100, `leaderboard must include ${nameA} at 100m`);
    assert(names.indexOf(nameB) < names.indexOf(nameA), 'leaderboard must sort by altitude descending');

    const guestId = `#SMK9-${nonce}`;
    const posted = await request(gamePort, 'POST', '/api/leaderboard', {
      body: { playerId: guestId, name: `Guest${nonce}`, altitude: 350 }
    });
    assert(posted.status === 200 && posted.json && posted.json.ok && posted.json.altitude === 350, 'POST /api/leaderboard should accept a guest score');
    const lower = await request(gamePort, 'POST', '/api/leaderboard', {
      body: { playerId: guestId, name: `Guest${nonce}`, altitude: 10 }
    });
    assert(lower.status === 200 && lower.json && lower.json.altitude === 350, 'POST /api/leaderboard must keep the higher score');
    const boardAfter = await request(gamePort, 'GET', '/api/leaderboard');
    const guest = boardAfter.json.entries.find((e) => e.playerId === guestId);
    assert(guest && guest.altitude === 350, 'guest score must appear on GET /api/leaderboard');

    const twinName = `Twin${nonce}`;
    const twinA = `#TWA2-${nonce}`;
    const twinB = `#TWB3-${nonce}`;
    const twinLow = await request(gamePort, 'POST', '/api/leaderboard', {
      body: { playerId: twinA, name: twinName, altitude: 120 }
    });
    const twinHigh = await request(gamePort, 'POST', '/api/leaderboard', {
      body: { playerId: twinB, name: twinName, altitude: 480 }
    });
    assert(twinLow.status === 200 && twinHigh.status === 200, 'same-name scores should be accepted');
    const twinBoard = await request(gamePort, 'GET', '/api/leaderboard');
    const twins = (twinBoard.json.entries || []).filter((e) => e.name === twinName);
    assert(twins.length === 1, `same display name must appear once, got ${twins.length}`);
    assert(twins[0].altitude === 480, 'same-name rows must keep the best altitude');

    console.log('[smoke] serve.js passed');
  } finally {
    await closeServer(gameServer);
  }
}

main().catch((err) => {
  console.error('[smoke] FAILED:', err.message);
  process.exit(1);
});
