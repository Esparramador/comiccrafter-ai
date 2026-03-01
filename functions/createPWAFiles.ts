import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const githubToken = Deno.env.get('GITHUB_TOKEN_PWA');
    const owner = 'Esparramador';
    const repo = 'comiccrafter-ai';
    const branch = 'main';

    // Create manifest.json
    const manifestContent = {
      name: "ComicCrafter AI",
      short_name: "ComicCrafter",
      description: "Crea cómics y videos con IA",
      start_url: "/",
      display: "standalone",
      theme_color: "#000000",
      background_color: "#ffffff",
      icons: [
        {
          src: "https://base44.com/logo_v2.svg",
          sizes: "192x192",
          type: "image/svg+xml"
        }
      ]
    };

    const manifestBase64 = btoa(JSON.stringify(manifestContent, null, 2));

    // Create service-worker.js
    const swContent = `self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());`;

    const swBase64 = btoa(swContent);

    // Get current manifest to get SHA (if it exists)
    let manifestSha = null;
    try {
      const manifestResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/public/manifest.json?ref=${branch}`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      if (manifestResponse.ok) {
        const data = await manifestResponse.json();
        manifestSha = data.sha;
      }
    } catch (e) {
      // File doesn't exist yet
    }

    // Get current service worker to get SHA (if it exists)
    let swSha = null;
    try {
      const swResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/public/service-worker.js?ref=${branch}`,
        {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      if (swResponse.ok) {
        const data = await swResponse.json();
        swSha = data.sha;
      }
    } catch (e) {
      // File doesn't exist yet
    }

    // Upload manifest.json
    const manifestResult = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/public/manifest.json`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Add PWA manifest file',
          content: manifestBase64,
          branch: branch,
          ...(manifestSha && { sha: manifestSha })
        })
      }
    );

    if (!manifestResult.ok) {
      const error = await manifestResult.json();
      throw new Error(`Failed to create manifest: ${JSON.stringify(error)}`);
    }

    // Upload service-worker.js
    const swResult = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/public/service-worker.js`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Add PWA service worker file',
          content: swBase64,
          branch: branch,
          ...(swSha && { sha: swSha })
        })
      }
    );

    if (!swResult.ok) {
      const error = await swResult.json();
      throw new Error(`Failed to create service worker: ${JSON.stringify(error)}`);
    }

    return Response.json({
      success: true,
      message: 'PWA files created successfully in public/',
      files: ['public/manifest.json', 'public/service-worker.js']
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});