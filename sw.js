/*
 * 期末急救计算器 Service Worker — 离线可用
 * 策略:核心资源 install 时预缓存;其余同源 GET 走 cache-first + 回源更新;断网兜底回首页。
 */
var CACHE = 'pof-v1';
var CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './css/vendor/modern-normalize.css',
  './css/vendor/animations.css',
  './css/vendor/hover.css',
  './css/vendor/csshake.css',
  './js/calc.js',
  './js/app.js',
  './js/vendor/canvas-confetti.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      }).catch(function () { return caches.match('./index.html'); });
    })
  );
});
