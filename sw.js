/* PTE 公司車 APP 離線外殼：頁面先抓網路（拿新版），斷網才用手機上存的那份。紀錄本身存在 localStorage，不在這裡。 */
const CACHE = 'pte-vehicle-v1';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || r.url.indexOf('script.google') >= 0) return;   // 後端呼叫不經過快取
  e.respondWith(fetch(r).then(res => {
    if (res.ok && (r.mode === 'navigate' || SHELL.some(s => r.url.endsWith(s.replace('./', ''))))) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('index.html'))));
});
