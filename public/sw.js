// Bump this on every meaningful change so old installed SWs replace themselves
// instead of continuing to serve a stale cache from before a deploy.
const CACHE = 'octopus-fur-v2';
const SHELL = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Admin and all API routes are never intercepted or cached — they must
  // always hit the network fresh. The SW's scope is origin-wide by default,
  // so this exclusion has to live here even though admin doesn't register it.
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) {
    return; // let the browser handle it natively, no respondWith
  }

  // Network-first for everything else, falling back to cache only when
  // offline. Cache-first was serving stale JS bundles after every deploy.
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
