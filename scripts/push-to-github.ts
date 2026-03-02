import { getUncachableGitHubClient } from "../server/github-client";
import * as fs from "fs";
import * as path from "path";

const OWNER = "Esparramador";
const REPO = "comiccrafter-ai";
const BRANCH = "main";
const BASE_DIR = process.cwd();

const IGNORE_PATTERNS = [
  "node_modules",
  ".git",
  ".local",
  ".cache",
  ".config",
  ".upm",
  "attached_assets",
  "tmp",
  ".replit",
  "replit.nix",
  "replit_zip_error_log.txt",
  ".generated.",
  "scripts/push-to-github.ts",
  "package-lock.json",
];

function shouldIgnore(filePath: string): boolean {
  return IGNORE_PATTERNS.some(p => filePath.includes(p));
}

function getAllFiles(dir: string, base: string = ""): { path: string; fullPath: string }[] {
  const results: { path: string; fullPath: string }[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = base ? `${base}/${entry.name}` : entry.name;
    const fullPath = path.join(dir, entry.name);

    if (shouldIgnore(relativePath)) continue;

    if (entry.isDirectory()) {
      results.push(...getAllFiles(fullPath, relativePath));
    } else if (entry.isFile()) {
      results.push({ path: relativePath, fullPath });
    }
  }
  return results;
}

function isBinaryFile(filePath: string): boolean {
  const binaryExts = [".png", ".jpg", ".jpeg", ".gif", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".mp3", ".mp4", ".glb", ".fbx", ".zip", ".tar", ".gz"];
  return binaryExts.some(ext => filePath.toLowerCase().endsWith(ext));
}

async function main() {
  console.log("Connecting to GitHub...");
  const octokit = await getUncachableGitHubClient();

  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${user.login}`);

  console.log("Getting current commit SHA...");
  const { data: ref } = await octokit.git.getRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
  });
  const latestCommitSha = ref.object.sha;
  console.log(`Latest commit: ${latestCommitSha}`);

  const { data: latestCommit } = await octokit.git.getCommit({
    owner: OWNER,
    repo: REPO,
    commit_sha: latestCommitSha,
  });

  console.log("Scanning project files...");
  const files = getAllFiles(BASE_DIR);
  console.log(`Found ${files.length} files to push`);

  console.log("Creating blobs...");
  const treeItems: any[] = [];
  let processed = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file.fullPath);
      const isBinary = isBinaryFile(file.fullPath);

      const { data: blob } = await octokit.git.createBlob({
        owner: OWNER,
        repo: REPO,
        content: content.toString(isBinary ? "base64" : "utf-8"),
        encoding: isBinary ? "base64" : "utf-8",
      });

      treeItems.push({
        path: file.path,
        mode: "100644" as const,
        type: "blob" as const,
        sha: blob.sha,
      });

      processed++;
      if (processed % 20 === 0) {
        console.log(`  ${processed}/${files.length} files processed...`);
      }
    } catch (err: any) {
      console.error(`  Error with ${file.path}: ${err.message}`);
    }
  }

  console.log(`All ${processed} blobs created. Building tree...`);

  const { data: tree } = await octokit.git.createTree({
    owner: OWNER,
    repo: REPO,
    tree: treeItems,
  });

  console.log(`Tree created: ${tree.sha}`);

  console.log("Creating commit...");
  const { data: newCommit } = await octokit.git.createCommit({
    owner: OWNER,
    repo: REPO,
    message: "Update: ComicCrafter IA Stories - Full platform (Express + React + PostgreSQL)\n\nComplete rewrite with:\n- AI-powered comic creation (DALL-E 3 HD + GPT-4o)\n- 3D model forge (Tripo3D)\n- Voice studio (ElevenLabs TTS)\n- Video creator with AI director\n- Gallery with batch generation\n- Google Drive/Sheets/Gmail integration\n- Admin dashboard with PIN auth\n- Professional dark theme UI",
    tree: tree.sha,
    parents: [latestCommitSha],
  });

  console.log(`Commit created: ${newCommit.sha}`);

  console.log("Updating branch reference...");
  await octokit.git.updateRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BRANCH}`,
    sha: newCommit.sha,
    force: true,
  });

  console.log(`\n✅ Successfully pushed to https://github.com/${OWNER}/${REPO}`);
  console.log(`   Commit: ${newCommit.sha}`);
  console.log(`   Files: ${processed}`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
