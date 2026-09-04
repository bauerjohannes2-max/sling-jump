/**
 * Sling Jump - Service Worker (PWA Offline & Instant Updates)
 * Version: 3.32.0
 * Architecture: Network-First for Navigation (HTML), Stale-While-Revalidate for Assets
 */
const CACHE_NAME = 'sling-jump-v3.32.0';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './version.json',
  './favicon.ico',
  './assets/favicon.png',
  './assets/icon.svg',
  './css/style.css',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './js/config/Constants.js',
  './js/services/StorageService.js',
  './js/services/AnalyticsService.js',
  './js/audio/AudioManager.js',
  './js/engine/ParticleSystem.js',
  './js/engine/InputManager.js',
  './js/engine/MissionManager.js',
  './js/entities/Node.js',
  './js/entities/EnergyOrb.js',
  './js/entities/Spaceship.js',
  './js/world/WorldManager.js',
  './js/engine/ShopManager.js',
  './js/engine/StateManager.js',
  './js/engine/UIManager.js',
  './js/engine/GameEngine.js',
  './js/main.js'
];

// 1. Install: Pre-cache core shell & immediately take over
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
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

// 3. Fetch: Network-First for HTML/Navigation, Stale-While-Revalidate for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass API and Telemetry calls completely
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Always fetch version.json with no-store directly from network
  if (url.pathname.endsWith('version.json')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() => caches.match(event.request))
    );
    return;
  }

  const isNavigation = event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/';
  const isCoreCode = isNavigation || url.pathname.endsWith('.js') || url.pathname.endsWith('.css');

  if (isCoreCode) {
    // NETWORK-FIRST: Always fetch freshest HTML/JS/CSS when online; fallback to cache if offline
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' }).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const toCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, toCache));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(event.request).then((cached) => cached || (isNavigation ? caches.match('./index.html') : null));
      })
    );
    return;
  }

  // ASSETS: Stale-While-Revalidate with fast network update
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
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
