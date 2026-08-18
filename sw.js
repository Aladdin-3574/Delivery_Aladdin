/**
 * @fileoverview Service Worker principal para la PWA de FastFood.
 * @version 3.0.0
 */

/** @const {string} CACHE_NAME - Identificador de la caché para recursos estáticos. */
const CACHE_NAME = 'fastfood-static-v3';

/** @const {string} DATA_CACHE_NAME - Identificador de la caché para peticiones de red/API. */
const DATA_CACHE_NAME = 'fastfood-data-v3';

/** * @const {Array<string>} ASSETS_TO_CACHE - Rutas relativas del App Shell para entornos con subdirectorios (GitHub Pages). 
 */
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './css/materialize.min.css',
  './js/index.js',
  './js/db.js',
  './js/materialize.min.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './img/logo.jpg',
  './pages/about.html',
  './pages/contact.html',
  './pages/pedidos.html'
];

/**
 * Evento 'install': Realiza el precaching del App Shell.
 * @param {ExtendableEvent} event - Evento del ciclo de vida del SW.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Precaching App Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

/**
 * Evento 'activate': Purga cachés de versiones anteriores.
 * @param {ExtendableEvent} event - Evento del ciclo de vida del SW.
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('[ServiceWorker] Eliminando caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/**
 * Evento 'fetch': Intercepta y enruta las peticiones basándose en la estrategia definida.
 * @param {FetchEvent} event - Evento de red.
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Estrategia: Network First para la API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          })
          .catch((err) => {
            console.warn('[ServiceWorker] Fallo de red. Sirviendo desde caché.', err);
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // Estrategia: Cache First (con fallback a red) para estáticos
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((response) => {
        // Opcional: Cachear dinámicamente recursos no previstos en ASSETS_TO_CACHE
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request.url, response.clone());
          return response;
        });
      });
    })
  );
});