const CACHE_NAME = 'comiccrafter-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/globals.css',
  '/src/main.jsx'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        console.log('Algunos assets no pudieron ser cacheados durante la instalación');
      });
    })
  );
  self.skipWaiting();
});

// Activar Service Worker y limpiar caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia de caché: Network First para APIs, Cache First para assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // No cachear requests a API, WebSockets, o extensiones
  if (url.pathname.startsWith('/api/') || request.method !== 'GET') {
    return event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            return response;
          }
          return caches.match(request).catch(() => new Response('Error de red', { status: 503 }));
        })
        .catch(() => {
          return caches.match(request).catch(() => new Response('Sin conexión', { status: 503 }));
        })
    );
  }

  // Cache First para assets estáticos
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'image') {
    return event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        }).catch(() => {
          return new Response('Asset no disponible', { status: 404 });
        });
      })
    );
  }

  // Network First para el resto de requests
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.method === 'GET') {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clonedResponse);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).catch(() => new Response('Sin conexión', { status: 503 }));
      })
  );
});

// Mensaje desde el cliente para actualizar Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});