const CACHE = 'laxus-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request)),
  );
});
