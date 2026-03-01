import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const githubToken = Deno.env.get('GITHUB_TOKEN');
    if (!githubToken) {
      return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    const sourceRepo = 'Esparramador/comiccrafter-ai';
    const targetRepo = 'Esparramador/ComicCrafterDesign';
    const themePath = 'shopify-theme';

    // 1. Clone source repo
    const cloneDir = `/tmp/comiccrafter-ai-${Date.now()}`;
    const cloneCmd = new Deno.Command('git', {
      args: [
        'clone',
        `https://${githubToken}@github.com/${sourceRepo}.git`,
        cloneDir
      ]
    });

    const cloneResult = await cloneCmd.output();
    if (!cloneResult.success) {
      const stderr = new TextDecoder().decode(cloneResult.stderr);
      throw new Error(`Clone failed: ${stderr}`);
    }

    // 2. Check if shopify-theme exists
    const themeDir = `${cloneDir}/${themePath}`;
    try {
      await Deno.stat(themeDir);
    } catch {
      throw new Error(`shopify-theme directory not found in source repo`);
    }

    // 3. Clone target repo
    const targetDir = `/tmp/comiccrafter-design-${Date.now()}`;
    const cloneTargetCmd = new Deno.Command('git', {
      args: [
        'clone',
        `https://${githubToken}@github.com/${targetRepo}.git`,
        targetDir
      ]
    });

    const cloneTargetResult = await cloneTargetCmd.output();
    if (!cloneTargetResult.success) {
      const stderr = new TextDecoder().decode(cloneTargetResult.stderr);
      throw new Error(`Clone target failed: ${stderr}`);
    }

    // 4. Copy shopify-theme to target repo
    const copyCmdExec = new Deno.Command('cp', {
      args: ['-r', themeDir, `${targetDir}/${themePath}`]
    });

    const copyResult = await copyCmdExec.output();
    if (!copyResult.success) {
      const stderr = new TextDecoder().decode(copyResult.stderr);
      throw new Error(`Copy failed: ${stderr}`);
    }

    // 5. Configure git and push to target repo
    const gitConfig1Cmd = new Deno.Command('git', {
      args: ['config', 'user.email', 'automation@comiccrafter.ai'],
      cwd: targetDir
    });
    await gitConfig1Cmd.output();

    const gitConfig2Cmd = new Deno.Command('git', {
      args: ['config', 'user.name', 'ComicCrafter Bot'],
      cwd: targetDir
    });
    await gitConfig2Cmd.output();

    const gitAddCmd = new Deno.Command('git', {
      args: ['add', themePath],
      cwd: targetDir
    });
    await gitAddCmd.output();

    const gitCommitCmd = new Deno.Command('git', {
      args: ['commit', '-m', 'Add shopify-theme from comiccrafter-ai'],
      cwd: targetDir
    });
    const commitResult = await gitCommitCmd.output();

    if (!commitResult.success) {
      const stderr = new TextDecoder().decode(commitResult.stderr);
      if (!stderr.includes('nothing to commit')) {
        throw new Error(`Commit failed: ${stderr}`);
      }
    }

    const gitPushCmd = new Deno.Command('git', {
      args: ['push', 'origin', 'main'],
      cwd: targetDir
    });

    const pushResult = await gitPushCmd.output();
    if (!pushResult.success) {
      const stderr = new TextDecoder().decode(pushResult.stderr);
      throw new Error(`Push failed: ${stderr}`);
    }

    // 6. Cleanup
    await Deno.remove(cloneDir, { recursive: true }).catch(() => {});
    await Deno.remove(targetDir, { recursive: true }).catch(() => {});

    return Response.json({
      success: true,
      message: `shopify-theme moved successfully from ${sourceRepo} to ${targetRepo}`,
      details: {
        source: `${sourceRepo}/shopify-theme`,
        target: `${targetRepo}/${themePath}`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});