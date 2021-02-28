const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/css/style.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
    "/db.js",
    "/index.js",
    "/manifest.json"
  ];

  const PRECAHCE = "budget-tracker-cache"
  const RUNTIME = "budget-tracker-data-cache"
  
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches
        .open(PRECAHCE)
        .then((cache) => cache.addAll(FILES_TO_CACHE))
        .then(self.skipWaiting())
    );
  });

  // The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", (event) => {
  const currentCaches = [PRECAHCE, RUNTIME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});
  
// fetch
self.addEventListener("fetch", function(event) {
    if (event.request.includes("/api/")) {
      event.respondWith(
        caches.open(PRECAHCE).then(cache => {
          return fetch(event.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          })
          .catch(err => {
            return cache.match(event.request);
          });
        }).catch(err => console.log(err))
      );
      return;
    }
    event.respondWith(
      caches.open(PRECAHCE).then(cache => {
        return cache.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        });
      })
    );
  });