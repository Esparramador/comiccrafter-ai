import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verificar si el usuario está autenticado (opcional para PWA pública)
    const isAuthenticated = await base44.auth.isAuthenticated();

    const serviceWorkerCode = `const CACHE_NAME = 'comiccrafter-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/globals.css',
  '/src/main.jsx'
];

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

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

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

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});`;

    return new Response(serviceWorkerCode, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});