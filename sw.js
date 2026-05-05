const CACHE_NAME = 'control-gastos-v3';
const FILES_TO_CACHE = [
  'https://igris5213.github.io/App-control/index.html',
  'https://igris5213.github.io/App-control/manifest.json',
  'https://igris5213.github.io/App-control/icon-192.png',
  'https://igris5213.github.io/App-control/icon-512.png'
];

// Instalación
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting(); // Activa el nuevo SW inmediatamente
});

// Activación: limpia cachés viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // Toma control de todas las pestañas abiertas
});

// Fetch: network-first — intenta red primero, caché como respaldo
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la red responde, actualiza el caché
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)) // Sin red, usa caché
  );
});

// Notifica a la app cuando hay una nueva versión lista
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
