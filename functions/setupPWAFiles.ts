import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const manifestContent = {
  name: "ComicCrafter AI",
  short_name: "ComicCrafter",
  description: "Crea cómics, cortometrajes animados y modelos 3D con IA",
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#000000",
  icons: [
    {
      src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%23000' width='192' height='192'/><text x='50%' y='50%' font-size='120' font-weight='bold' fill='%23fff' text-anchor='middle' dominant-baseline='middle'>CC</text></svg>",
      sizes: "192x192",
      type: "image/svg+xml",
      purpose: "any"
    }
  ]
};

const swContent = `const CACHE_NAME = 'comiccrafter-v1';
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(r => r || fetch(event.request).then(r => {
    caches.open(CACHE_NAME).then(c => c.put(event.request, r.clone()));
    return r;
  }).catch(() => new Response('Offline'))));
});`;

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

    const headers = new Headers({
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    });

    // Helper function to encode to base64
    function base64Encode(str) {
      return btoa(unescape(encodeURIComponent(str)));
    }

    // Upload manifest.json
    const manifestPath = 'public/manifest.json';
    const manifestBody = JSON.stringify({
      message: 'Add PWA manifest.json',
      content: base64Encode(JSON.stringify(manifestContent, null, 2)),
      branch
    });

    const manifestResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${manifestPath}`,
      {
        method: 'PUT',
        headers,
        body: manifestBody
      }
    );

    if (!manifestResponse.ok) {
      const error = await manifestResponse.json();
      throw new Error(`Manifest error: ${error.message || manifestResponse.statusText}`);
    }

    // Upload service-worker.js
    const swPath = 'public/service-worker.js';
    const swBody = JSON.stringify({
      message: 'Add PWA service-worker.js',
      content: base64Encode(swContent),
      branch
    });

    const swResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${swPath}`,
      {
        method: 'PUT',
        headers,
        body: swBody
      }
    );

    if (!swResponse.ok) {
      const error = await swResponse.json();
      throw new Error(`Service Worker error: ${error.message || swResponse.statusText}`);
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