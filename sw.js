const CACHE_NAME = 'control-gastos-v2';
const FILES_TO_CACHE = [
  '/App-control/index.html',
  '/App-control/manifest.json',
  '/App-control/icon-192.png',
  '/App-control/icon-512.png'
];

// Instalación: pre-cachear archivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: limpiar cachés viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: servir desde caché (offline-first)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => caches.match('/App-control/index.html'));
    })
  );
});
