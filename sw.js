/**
 * Space Jump - Service Worker (PWA Offline & Instant Updates)
 * Version: 5.18.55
 * Architecture: Network-First for Navigation (HTML), Stale-While-Revalidate for Assets
 */
const CACHE_NAME = 'space-jump-v5.18.55';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './favicon.ico',
  './assets/favicon.png',
  './assets/icon.svg',
  './css/style.css',
  './manifest.json',
  './apple-touch-icon-punch.png',
  './assets/app-icon-punch-192.png',
  './assets/app-icon-punch-512.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './js/config/Constants.js',
  './js/config/CloudConfig.js',
  './js/services/CloudBackend.js',
  './js/services/StorageService.js',
  './js/audio/AudioManager.js',
  './js/engine/ParticleSystem.js',
  './js/engine/InputManager.js',
  './js/engine/MissionManager.js',
  './js/entities/Node.js',
  './js/entities/EnergyOrb.js',
  './js/entities/ShipArt.js',
  './js/entities/Spaceship.js',
  './js/world/WorldManager.js',
  './js/engine/ShopManager.js',
  './js/engine/StateManager.js',
  './js/engine/UIManager.js',
  './js/engine/GameEngine.js',
  './js/main.js'
];

// 1. Install: Precache is best-effort. cache.addAll() is atomic — one 404 or
// GitHub Pages redirect aborts the entire install, so phones stay on the old
// worker forever. Skip waiting so a new worker activates without the old page
// having to message it; the page defers the reload if a run is in progress.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(PRECACHE_ASSETS.map((url) => cache.add(url).catch((err) => {
        console.warn('[SW] precache skipped', url, err);
      })));
    }).finally(() => self.skipWaiting())
  );
});

// 2. Activate: Delete all older caches and immediately claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Deleting stale cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. Fetch: Network-First for HTML/JS/CSS, Stale-While-Revalidate for static media
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never intercept other origins (GitHub raw version.json, fonts, CDNs).
  // An old cache-first handler here is why phones could not see published updates.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Bypass API calls completely (the game SW never caches player sync)
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // version.json and the web manifest must always hit the network.
  // Do not respondWith: intercepting here can pin phones to a CDN/SW copy
  // and the page already fetches these with cache: 'no-store'.
  // A cached manifest also keeps phones on the old homescreen icon URL.
  if (url.pathname.endsWith('version.json') || url.pathname.endsWith('manifest.json')) {
    return;
  }

  const isNavPath = url.pathname === '/' ||
    url.pathname === '/space-jump' ||
    url.pathname === '/space-jump/' ||
    url.pathname.endsWith('.html');
  const isNavigation = event.request.mode === 'navigate' || isNavPath;
  const isCoreCode = isNavigation || url.pathname.endsWith('.js') || url.pathname.endsWith('.css');

  if (isCoreCode) {
    // NETWORK-FIRST: Always fetch freshest HTML/JS/CSS when online; fallback to cache if offline
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const toCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, toCache));
        }
        return networkResponse;
      }).catch(() => {
        // Assets are requested with a ?v= cache-buster, so an exact match would miss every precached entry.
        return caches.match(event.request, { ignoreSearch: true }).then((cached) => cached || (isNavigation ? caches.match('./index.html') : null));
      })
    );
    return;
  }

  // ASSETS (images, audio, icons): Stale-While-Revalidate with fast network update
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Message Listener: Support explicit cache purge & update from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data && event.data.action === 'purgeCache') {
    caches.keys().then((names) => {
      return Promise.all(names.map((n) => caches.delete(n)));
    }).then(() => {
      self.clients.claim();
    });
  }
});
