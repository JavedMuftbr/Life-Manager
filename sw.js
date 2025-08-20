
const CACHE = 'life-manager-cache-v1';
const ASSETS = [
  './life_manager_pwa.html',
  './life_manager_final.html',
  './manifest.json',
  './pwa_icons/icon-192.png',
  './pwa_icons/icon-512.png',
  './pwa_icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if (k !== CACHE) return caches.delete(k);
    })))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Prefer network for POST/PUT etc
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, copy)).catch(()=>{});
        return resp;
      }).catch(() => cached || Promise.reject('no-match'));
    })
  );
});
