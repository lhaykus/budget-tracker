const STATIC_ASSETS = 'static-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

const staticAssets = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/styles.css',
    'index.js',
    '/icons/icon-192x192.png',
    '/icons/icon=-512x512.png',

];

//Install
self.addEventListener('install', event => {
    event.waitUntil(caches.open(STATIC_ASSETS).then(cache => cache.addAll(staticAssets)));
    self.skipWaiting();
});

//Activate
self.addEventListener('activate', event => {
    self.addEventListener('activate', event => {
        event.waitUntil(caches.keys().then(cacheName => {
            return Promise. all(
                cacheName.map(key => {
                   if (key !== STATIC_ASSETS && key !== DATA_CACHE_NAME) {
                       console.log('removing old cache data', key);
                       return caches.delete(key);
                   }
                })
            ); 
        }));
        self.clients.claim();
});

//Fetch
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request.url).then(response => response || fetch(event.request.url))
    )
});