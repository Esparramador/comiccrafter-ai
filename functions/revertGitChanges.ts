import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const REPO_URL = "https://github.com/Esparramador/comiccrafter-ai.git";
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

async function runCommand(cmd, cwd = null) {
  const command = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    cwd: cwd,
    stdout: "piped",
    stderr: "piped"
  });
  
  const { stdout, stderr, success } = await command.output();
  return {
    success,
    stdout: new TextDecoder().decode(stdout),
    stderr: new TextDecoder().decode(stderr)
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tmpDir = `/tmp/comic-revert-${Date.now()}`;
    
    // Clone repo
    const cloneResult = await runCommand(["git", "clone", REPO_URL, tmpDir]);
    if (!cloneResult.success) {
      throw new Error("Failed to clone repository: " + cloneResult.stderr);
    }

    // Get commits with times
    const logsResult = await runCommand(
      ["git", "log", "--all", "--format=%H %ai"],
      tmpDir
    );

    const lines = logsResult.stdout.split('\n').filter(l => l);
    let targetCommit = null;
    let closestDiff = Infinity;

    for (const line of lines) {
      const parts = line.split(' ');
      const hash = parts[0];
      const time = parts[2];
      
      if (!time) continue;
      
      const [hours, minutes] = time.split(':');
      const commitMins = parseInt(hours) * 60 + parseInt(minutes);
      const targetMins = 4 * 60 + 38;
      const diff = Math.abs(commitMins - targetMins);

      if (diff < closestDiff) {
        closestDiff = diff;
        targetCommit = hash;
      }
    }

    if (!targetCommit) {
      throw new Error("No commits found near 04:38");
    }

    // Reset to that commit
    const resetResult = await runCommand(
      ["git", "reset", "--hard", targetCommit],
      tmpDir
    );

    if (!resetResult.success) {
      throw new Error("Reset failed: " + resetResult.stderr);
    }

    // Configure git
    await runCommand(["git", "config", "user.email", user.email], tmpDir);
    await runCommand(["git", "config", "user.name", user.full_name || "User"], tmpDir);

    // Force push
    const remoteUrl = REPO_URL.replace("https://", `https://${GITHUB_TOKEN}@`);
    
    const pushResult = await runCommand(
      ["git", "push", "-f", remoteUrl, "HEAD:main"],
      tmpDir
    );

    // Cleanup
    await runCommand(["rm", "-rf", tmpDir]);

    if (pushResult.success) {
      return Response.json({ 
        success: true, 
        message: `Reverted to commit ${targetCommit}`,
        commit: targetCommit
      });
    } else {
      throw new Error("Push failed: " + pushResult.stderr);
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});