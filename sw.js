const CACHE_NAME = 'news-week-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/about.html',
  '/index-news.html',
  '/styles/base/style.css',
  '/styles/general/header-styles.css',
  '/styles/general/footer-styles.css',
  '/styles/base/article-styles.css',
  '/ico/gamepad.ico',
  '/logo/NEWs WASD.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
}); 