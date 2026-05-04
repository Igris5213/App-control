const CACHE_NAME = 'control-gastos-v2';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// INSTALAR
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

// ACTIVAR (limpia versiones viejas)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH (estrategia inteligente)
self.addEventListener('fetch', event => {
  const req = event.request;

  // 🔹 NO cachear Firebase ni APIs externas
  if (req.url.includes('firebase') || req.url.includes('googleapis')) {
    return event.respondWith(fetch(req));
  }

  // 🔹 HTML → siempre intenta red (para ver cambios)
  if (req.headers.get('accept')?.includes('text/html')) {
    return event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
  }

  // 🔹 Otros archivos → cache primero
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req))
  );
});
