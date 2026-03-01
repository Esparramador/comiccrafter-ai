import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const githubToken = Deno.env.get('GITHUB_TOKEN_PWA');
    if (!githubToken) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    const owner = 'Esparramador';
    const repo = 'comiccrafter-ai';
    const branch = 'main';

    // Manifest.json content
    const manifestContent = {
      name: "ComicCrafter AI",
      short_name: "ComicCrafter",
      description: "Crea cómics, cortometrajes animados y modelos 3D con IA",
      start_url: "/",
      scope: "/",
      display: "standalone",
      orientation: "portrait-primary",
      background_color: "#ffffff",
      theme_color: "#000000",
      icons: [
        {
          src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%23000' width='192' height='192'/><text x='50%' y='50%' font-size='120' font-weight='bold' fill='%23fff' text-anchor='middle' dominant-baseline='middle'>CC</text></svg>",
          sizes: "192x192",
          type: "image/svg+xml",
          purpose: "any"
        },
        {
          src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect fill='%23000' width='512' height='512'/><text x='50%' y='50%' font-size='300' font-weight='bold' fill='%23fff' text-anchor='middle' dominant-baseline='middle'>CC</text></svg>",
          sizes: "512x512",
          type: "image/svg+xml",
          purpose: "any"
        }
      ],
      categories: ["graphics", "productivity"]
    };

    // Service Worker content
    const swContent = `const CACHE_NAME = 'comiccrafter-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/globals.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(err => {
        console.log('Cache addAll error:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (!url.protocol.startsWith('http')) {
    return;
  }

  if (url.pathname.includes('/api/') || url.pathname.includes('/functions/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        return response;
      }

      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });

        return response;
      }).catch(() => {
        return new Response('Offline - Contenido no disponible', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      });
    })
  );
});`;

    const headers = {
      'Authorization': \`token \${githubToken}\`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    // Upload manifest.json
    const manifestPath = 'public/manifest.json';
    const manifestResponse = await fetch(
      \`https://api.github.com/repos/\${owner}/\${repo}/contents/\${manifestPath}\`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: 'Add PWA manifest.json',
          content: btoa(JSON.stringify(manifestContent, null, 2)),
          branch
        })
      }
    );

    if (!manifestResponse.ok) {
      const error = await manifestResponse.json();
      throw new Error(\`Failed to upload manifest.json: \${error.message}\`);
    }

    // Upload service-worker.js
    const swPath = 'public/service-worker.js';
    const swResponse = await fetch(
      \`https://api.github.com/repos/\${owner}/\${repo}/contents/\${swPath}\`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: 'Add PWA service-worker.js',
          content: btoa(swContent),
          branch
        })
      }
    );

    if (!swResponse.ok) {
      const error = await swResponse.json();
      throw new Error(\`Failed to upload service-worker.js: \${error.message}\`);
    }

    return Response.json({
      success: true,
      message: 'PWA files uploaded successfully',
      files: {
        manifest: manifestPath,
        serviceWorker: swPath
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});