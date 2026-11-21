/*
 * Service worker – "network first":
 *  - online: vždy sa načíta najnovšia verzia z GitHub Pages (žiadne zaseknuté staré verzie),
 *    a zároveň sa uloží kópia do cache
 *  - offline: appka z plochy sa otvorí z poslednej uloženej kópie
 * Cudzie domény (Google Fonts) sa nechávajú prehliadaču – offline sa použije záložný mono font.
 */
var CACHE = 'bouquet-v1';
var CORE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'js/botanic.js',
  'js/bouquet.js',
  'js/ascii-render.js',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/icon-192.png',
  'assets/icons/favicon-32.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) { return cache.addAll(CORE); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) {
        return hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined);
      });
    })
  );
});
