import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const githubToken = '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';
    const repo = 'Esparramador/comiccrafter-ai';
    const cloneDir = `/tmp/comiccrafter-pwa-${Date.now()}`;

    // Clone repo
    const cloneCmd = new Deno.Command('git', {
      args: ['clone', `https://${githubToken}@github.com/${repo}.git`, cloneDir]
    });

    const cloneResult = await cloneCmd.output();
    if (!cloneResult.success) {
      throw new Error('Clone failed');
    }

    // Create public directory if it doesn't exist
    try {
      await Deno.mkdir(`${cloneDir}/public`, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    // Create manifest.json
    const manifest = {
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

    await Deno.writeTextFile(
      `${cloneDir}/public/manifest.json`,
      JSON.stringify(manifest, null, 2)
    );

    // Create service-worker.js
    const serviceWorker = `self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());`;

    await Deno.writeTextFile(
      `${cloneDir}/public/service-worker.js`,
      serviceWorker
    );

    // Git config
    const configEmail = new Deno.Command('git', {
      args: ['config', 'user.email', 'automation@comiccrafter.ai'],
      cwd: cloneDir
    });
    await configEmail.output();

    const configName = new Deno.Command('git', {
      args: ['config', 'user.name', 'ComicCrafter Bot'],
      cwd: cloneDir
    });
    await configName.output();

    // Git add
    const addCmd = new Deno.Command('git', {
      args: ['add', 'public/manifest.json', 'public/service-worker.js'],
      cwd: cloneDir
    });
    await addCmd.output();

    // Git commit
    const commitCmd = new Deno.Command('git', {
      args: ['commit', '-m', 'Add PWA manifest and service worker'],
      cwd: cloneDir
    });
    const commitResult = await commitCmd.output();

    if (!commitResult.success) {
      const stderr = new TextDecoder().decode(commitResult.stderr);
      if (!stderr.includes('nothing to commit')) {
        throw new Error(`Commit failed: ${stderr}`);
      }
    }

    // Git push
    const pushCmd = new Deno.Command('git', {
      args: ['push', 'origin', 'main'],
      cwd: cloneDir
    });
    const pushResult = await pushCmd.output();

    if (!pushResult.success) {
      const stderr = new TextDecoder().decode(pushResult.stderr);
      throw new Error(`Push failed: ${stderr}`);
    }

    // Cleanup
    await Deno.remove(cloneDir, { recursive: true }).catch(() => {});

    return Response.json({
      success: true,
      message: 'PWA files created and pushed successfully',
      files: ['public/manifest.json', 'public/service-worker.js']
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});