/**
 * Regression tests for phone PWA updates.
 *
 * Phones were stuck on old builds because:
 *   1. version.json probes sent Cache-Control/Pragma headers, which are not
 *      CORS-safelisted. GitHub raw 403s the preflight, so the fallback that
 *      bypasses a stale Pages/SW copy never ran.
 *   2. cache.addAll() is atomic — one missing precache URL aborted install,
 *      so the new worker never activated.
 */
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');
const { createServer } = require('./serve.js');

const ROOT = path.join(__dirname, '..');

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
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

function extractFetchPublishedVersion(source) {
  const start = source.indexOf('async function fetchPublishedVersion');
  assert(start !== -1, 'fetchPublishedVersion must exist in js/main.js');
  const end = source.indexOf('async function resolveLatestPublishedVersion', start);
  assert(end !== -1, 'resolveLatestPublishedVersion must follow fetchPublishedVersion');
  return source.slice(start, end);
}

function sourceContracts() {
  const sw = read('sw.js');
  const main = read('js/main.js');
  const html = read('index.html');
  const swCode = sw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  assert(!/cache\.addAll\s*\(/.test(swCode), 'sw.js must not use atomic cache.addAll (one 404 blocks every phone update)');
  assert(/self\.skipWaiting\s*\(/.test(sw), 'sw.js install must skipWaiting so a new worker activates without the old page');
  assert(/cache\.add\(url\)\.catch\(/.test(sw), 'sw.js must precache URLs individually and ignore failures');

  const versionBypass = sw.split('url.pathname.endsWith(\'version.json\')')[1] || '';
  const handler = versionBypass.slice(0, 400);
  assert(handler.includes('return;'), 'sw.js must not intercept version.json');
  assert(!handler.includes('respondWith'), 'sw.js must not respondWith version.json');

  const fetchFn = extractFetchPublishedVersion(main)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
  assert(!/Cache-Control/.test(fetchFn), 'fetchPublishedVersion must not send Cache-Control (CORS preflight)');
  assert(!/Pragma/.test(fetchFn), 'fetchPublishedVersion must not send Pragma (CORS preflight)');
  assert(/cache:\s*'no-store'/.test(fetchFn), 'fetchPublishedVersion must use cache: no-store');

  assert(main.includes("addEventListener('pageshow'"), 'version check must run on pageshow for iOS PWA resume');
  assert(main.includes('updateViaCache: \'none\''), 'service worker registration must bypass HTTP cache');
  assert(html.includes("fetch(url, { cache: 'no-store' })"), 'index.html bootstrap must probe version.json without extra headers');
  assert(html.includes("path.indexOf('/space-jump/') !== 0"), 'GitHub Pages must canonicalize /space-jump to /space-jump/');

  console.log('[pwa-update] source contracts passed');
}

function startFixtureServer() {
  const swSource = `
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('pwa-update-fixture').then((cache) => {
      return Promise.all(['./ok.js', './missing.js'].map((url) => cache.add(url).catch(() => {})));
    }).finally(() => self.skipWaiting())
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
`;
  const html = `<!DOCTYPE html><script>
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none', scope: './' })
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => {
        window.__swReady = !!(reg && (reg.active || navigator.serviceWorker.controller));
      })
      .catch((err) => { window.__swError = String(err); });
  </script>`;

  const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    if (url === '/' || url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(html);
      return;
    }
    if (url === '/sw.js') {
      res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(swSource);
      return;
    }
    if (url === '/ok.js') {
      res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
      res.end('void 0;');
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('missing');
  });
  return server;
}

async function withBrowser(fn) {
  const browser = await chromium.launch({ args: ['--disable-web-security=false'] });
  try {
    return await fn(browser);
  } finally {
    await browser.close();
  }
}

async function testBestEffortInstall() {
  const server = startFixtureServer();
  const port = await listen(server);
  try {
    await withBrowser(async (browser) => {
      const page = await browser.newPage({ serviceWorkers: 'allow' });
      await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => window.__swReady === true || window.__swError, { timeout: 15000 });
      const result = await page.evaluate(() => ({ ready: window.__swReady, error: window.__swError || null }));
      assert(!result.error, `fixture SW must install despite a missing precache URL, got ${result.error}`);
      assert(result.ready, 'fixture SW must become active when precache is best-effort');
    });
    console.log('[pwa-update] best-effort precache install passed');
  } finally {
    await closeServer(server);
  }
}

async function testLiveGameWorker() {
  const server = createServer();
  const port = await listen(server);
  try {
    await withBrowser(async (browser) => {
      const page = await browser.newPage({ serviceWorkers: 'allow' });
      await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, { timeout: 20000 });
      const info = await page.evaluate(async () => {
        const ready = await navigator.serviceWorker.ready;
        return {
          script: ready.active && ready.active.scriptURL,
          controlled: !!navigator.serviceWorker.controller
        };
      });
      assert(info.controlled, 'the real game service worker must control the page');
      assert(/\/sw\.js$/.test(info.script || ''), `expected sw.js controller, got ${info.script}`);
    });
    console.log('[pwa-update] live game worker install passed');
  } finally {
    await closeServer(server);
  }
}

async function testDetectsNewerPublishedBuild() {
  const server = createServer();
  const port = await listen(server);
  const newer = JSON.stringify({ version: '9.9.9', tag: 'v9.9.9' });
  try {
    await withBrowser(async (browser) => {
      const page = await browser.newPage({ serviceWorkers: 'allow' });
      await page.route('**/*', async (route) => {
        const url = route.request().url();
        if (url.includes('version.json') || url.includes('/api/version') || url.includes('raw.githubusercontent.com')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: newer,
            headers: { 'Access-Control-Allow-Origin': '*' }
          });
          return;
        }
        await route.continue();
      });
      await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForURL((u) => u.searchParams.get('v') === '9.9.9', { timeout: 15000 });
    });
    console.log('[pwa-update] newer published build triggers reload passed');
  } finally {
    await closeServer(server);
  }
}

async function testGithubRawCors() {
  const rawUrl = 'https://raw.githubusercontent.com/bauerjohannes2-max/space-jump/main/version.json';
  let reachable = false;
  try {
    const probe = await fetch(`${rawUrl}?t=${Date.now()}`);
    reachable = probe.ok;
  } catch (e) {
    reachable = false;
  }
  if (!reachable) {
    console.log('[pwa-update] skipped GitHub raw CORS check (network unreachable)');
    return;
  }

  const html = `<!DOCTYPE html><title>cors</title>`;
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
  const port = await listen(server);
  try {
    await withBrowser(async (browser) => {
      const page = await browser.newPage();
      await page.goto(`http://127.0.0.1:${port}/`);
      const result = await page.evaluate(async (url) => {
        async function probe(headers) {
          try {
            const res = await fetch(`${url}?t=${Date.now()}`, { cache: 'no-store', headers });
            return { ok: res.ok, status: res.status };
          } catch (err) {
            return { ok: false, status: 0, error: String(err) };
          }
        }
        const safe = await probe({});
        const unsafe = await probe({ 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' });
        return { safe, unsafe };
      }, rawUrl);
      assert(result.safe.ok, `safe version.json fetch must succeed, got ${JSON.stringify(result.safe)}`);
      if (result.unsafe.ok) {
        console.log('[pwa-update] Chromium ignored Cache-Control/Pragma (Safari still preflights; headers stay omitted)');
      } else {
        console.log('[pwa-update] Cache-Control/Pragma CORS preflight blocked as expected');
      }
    });
    console.log('[pwa-update] GitHub raw CORS contract passed');
  } finally {
    await closeServer(server);
  }
}

async function testSettingsUpdateButtonWhenCurrent() {
  const server = createServer();
  const port = await listen(server);
  const pkg = JSON.parse(read('package.json'));
  const current = JSON.stringify({ version: pkg.version, tag: `v${pkg.version}` });
  try {
    await withBrowser(async (browser) => {
      const page = await browser.newPage({ serviceWorkers: 'allow' });
      await page.route('**/*', async (route) => {
        const url = route.request().url();
        if (url.includes('version.json') || url.includes('/api/version') || url.includes('raw.githubusercontent.com')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: current,
            headers: { 'Access-Control-Allow-Origin': '*' }
          });
          return;
        }
        await route.continue();
      });
      await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#btn-menu-settings', { timeout: 10000 });
      await page.click('#btn-menu-settings');
      await page.click('#btn-check-update');
      await page.waitForFunction(() => {
        const t = document.getElementById('btn-check-update');
        return t && t.textContent && t.textContent !== 'NACH UPDATES SUCHEN' && t.textContent !== 'PRÜFE UPDATE...';
      }, { timeout: 10000 });
      const label = await page.textContent('#btn-check-update');
      assert(
        label.includes(`VERSION AKTUELL (v${pkg.version})`),
        `settings update button should report current build, got ${label}`
      );
    });
    console.log('[pwa-update] settings update button (current) passed');
  } finally {
    await closeServer(server);
  }
}

async function main() {
  sourceContracts();
  await testBestEffortInstall();
  await testLiveGameWorker();
  await testDetectsNewerPublishedBuild();
  await testSettingsUpdateButtonWhenCurrent();
  await testGithubRawCors();
  console.log('[pwa-update] passed');
}

main().catch((err) => {
  console.error('[pwa-update] FAILED:', err.message);
  process.exit(1);
});
