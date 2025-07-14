// Basic service worker for PalTattoo
const CACHE_NAME = 'paltattoo-v2';
const urlsToCache = [
  '/',
  '/paltattoo-icono.png'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add files individually to catch errors
        return Promise.allSettled(
          urlsToCache.map(url => {
            return fetch(url).then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
              console.warn(`Failed to cache ${url}: ${response.status}`);
            }).catch(error => {
              console.warn(`Failed to fetch ${url}:`, error);
            });
          })
        );
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', event => {
  // Skip caching for API requests
  if (event.request.url.includes('/api/') || event.request.url.includes('http://localhost:5000')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});