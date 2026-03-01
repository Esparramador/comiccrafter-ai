import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const REPO_URL = "https://github.com/Esparramador/comiccrafter-ai.git";
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tmpDir = `/tmp/comic-revert-${Date.now()}`;
    
    // Clone repo
    const cloneResult = await new Promise((resolve) => {
      const process = Deno.run({
        cmd: ["git", "clone", REPO_URL, tmpDir],
        stdout: "piped",
        stderr: "piped"
      });
      process.status().then(() => resolve(true));
    });

    if (!cloneResult) {
      throw new Error("Failed to clone repository");
    }

    // Get commits from today around 04:38
    const getLogsProcess = Deno.run({
      cmd: ["git", "log", "--all", "--oneline", "--since=today"],
      cwd: tmpDir,
      stdout: "piped",
      stderr: "piped"
    });

    const logsOutput = await getLogsProcess.output();
    const logsText = new TextDecoder().decode(logsOutput);
    const commits = logsText.split('\n').filter(l => l);

    // Find commit closest to 04:38
    const getCommitTimeProcess = Deno.run({
      cmd: ["git", "log", "--all", "--format=%H %ai"],
      cwd: tmpDir,
      stdout: "piped"
    });

    const timesOutput = await getCommitTimeProcess.output();
    const timesText = new TextDecoder().decode(timesOutput);
    const lines = timesText.split('\n').filter(l => l);

    let targetCommit = null;
    let closestDiff = Infinity;

    for (const line of lines) {
      const [hash, date, time] = line.split(' ');
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
    const resetProcess = Deno.run({
      cmd: ["git", "reset", "--hard", targetCommit],
      cwd: tmpDir,
      stdout: "piped"
    });

    await resetProcess.status();

    // Configure git
    const configUserProcess = Deno.run({
      cmd: ["git", "config", "user.email", user.email],
      cwd: tmpDir
    });
    await configUserProcess.status();

    const configNameProcess = Deno.run({
      cmd: ["git", "config", "user.name", user.full_name || "User"],
      cwd: tmpDir
    });
    await configNameProcess.status();

    // Force push
    const remoteUrl = REPO_URL.replace("https://", `https://${GITHUB_TOKEN}@`);
    
    const pushProcess = Deno.run({
      cmd: ["git", "push", "-f", remoteUrl, "HEAD:main"],
      cwd: tmpDir,
      stdout: "piped",
      stderr: "piped"
    });

    const pushStatus = await pushProcess.status();

    // Cleanup
    const rmProcess = Deno.run({
      cmd: ["rm", "-rf", tmpDir]
    });
    await rmProcess.status();

    if (pushStatus.success) {
      return Response.json({ 
        success: true, 
        message: `Reverted to commit ${targetCommit}`,
        commit: targetCommit
      });
    } else {
      throw new Error("Push failed");
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});