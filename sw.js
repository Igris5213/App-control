const CACHE_NAME = 'control-gastos-v6';
const STATIC_ASSETS = [
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

// Instalar — cachear solo assets estáticos (íconos, manifest)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activar — limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isHTML = url.pathname.endsWith('.html') || url.pathname.endsWith('/');
  const isFirebase = url.hostname.includes('firebase') || url.hostname.includes('google');

  // HTML e index: siempre red primero, sin cache
  if(isHTML || isFirebase){
    event.respondWith(fetch(event.request));
    return;
  }

  // Assets estáticos: red primero, cache como fallback offline
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('message', event => {
  if(event.data === 'skipWaiting') self.skipWaiting();
});
