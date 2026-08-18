/**
 * @fileoverview Service Worker principal para la PWA de FastFood.
 * @version 3.0.1
 */

/** @const {string} CACHE_NAME - Identificador de la caché para recursos estáticos. */
const CACHE_NAME = 'fastfood-static-v3';

/** @const {string} DATA_CACHE_NAME - Identificador de la caché dinámica. */
const DATA_CACHE_NAME = 'fastfood-data-v3';

/** 
 * @const {Array<string>} ASSETS_TO_CACHE - Rutas relativas del App Shell para GitHub Pages. 
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
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Precaching App Shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // CRÍTICO: Obliga al SW a tomar el control inmediatamente, descartando versiones anteriores.
  self.skipWaiting();
});

/**
 * Evento 'activate': Purga cachés de versiones anteriores y reclama los clientes.
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
 * Evento 'fetch': Intercepta y enruta las peticiones de forma segura.
 */
self.addEventListener('fetch', (event) => {
  // 1. FILTRO DE EXCLUSIÓN: Ignorar peticiones que no sean GET y tráfico de Firebase/Extensiones
  if (
    event.request.method !== 'GET' || 
    event.request.url.includes('firestore.googleapis.com') ||
    event.request.url.includes('identitytoolkit.googleapis.com') ||
    !event.request.url.startsWith('http')
  ) {
    return; // Permite que el navegador maneje el tráfico de BD de forma nativa
  }

  // 2. ESTRATEGIA: Cache First (con fallback a red) para recursos estáticos
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((response) => {
        // Validación estricta: Solo cachear respuestas exitosas y de nuestro propio origen
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request.url, response.clone());
          return response;
        });
      });
    }).catch(() => {
      // Opcional: Retornar un recurso offline genérico si falla la red y no está en caché
      console.warn('[ServiceWorker] Fallo de red detectado.');
    })
  );
});