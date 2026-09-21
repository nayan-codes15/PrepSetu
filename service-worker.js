// service-worker.js — PrepSetu Offline PWA Layer
const CACHE_NAME = 'prepsetu-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './dashboard.html',
  './quiz.html',
  './manifest.json',
  './logo.png',
  './security-utils.js',
  './ui-utils.js',
  './state-manager.js',
  './firebase-config.js',
  './firebase-utils.js'
];

// Install Event — Precaching Core Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[ServiceWorker] Some assets could not be cached during install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event — Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API Requests: Network First with Graceful Fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => response)
        .catch(() => {
          if (url.pathname.includes('/api/ai-chat')) {
            return new Response(JSON.stringify({
              ok: true,
              reply: "### 📡 Offline Assistant Mode\n\nYou are currently preparing offline. All your saved flashcards, mock quizzes, and study progress are active and synchronized locally!",
              action: null
            }), { headers: { 'Content-Type': 'application/json' } });
          }
          return new Response(JSON.stringify({ ok: false, error: 'Offline mode active' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Static Assets: Cache First, Network Fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache dynamic assets if valid
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback to dashboard.html if HTML navigation fails
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./dashboard.html');
        }
      });
    })
  );
});
