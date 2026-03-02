import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OWNER = "Esparramador";
const REPO = "comiccrafter-ai";
const BRANCH = "shopify-theme";
const THEME_DIR = path.resolve(__dirname, "../shopify-theme");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  console.error("Set GITHUB_TOKEN env var first.");
  console.error("Generate one at: https://github.com/settings/tokens");
  console.error("Needs 'repo' scope.");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
};

async function ghApi(endpoint: string, method = "GET", body?: any) {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok && res.status !== 422) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text}`);
  }
  return res.json();
}

function collectFiles(dir: string, prefix = ""): { path: string; content: string; encoding: string }[] {
  const results: any[] = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const relPath = prefix ? `${prefix}/${entry}` : entry;
    if (fs.statSync(full).isDirectory()) {
      results.push(...collectFiles(full, relPath));
    } else {
      const ext = path.extname(entry).toLowerCase();
      const isText = [".liquid", ".json", ".css", ".js", ".svg", ".md", ".txt"].includes(ext);
      if (isText) {
        results.push({ path: relPath, content: fs.readFileSync(full, "utf-8"), encoding: "utf-8" });
      } else {
        results.push({ path: relPath, content: fs.readFileSync(full).toString("base64"), encoding: "base64" });
      }
    }
  }
  return results;
}

async function main() {
  console.log("=== Creating shopify-theme branch ===");
  console.log(`Repo: ${OWNER}/${REPO}`);

  const mainRef = await ghApi(`/repos/${OWNER}/${REPO}/git/ref/heads/main`);
  const mainSha = mainRef.object.sha;
  console.log(`Main branch SHA: ${mainSha}`);

  const files = collectFiles(THEME_DIR);
  console.log(`Found ${files.length} theme files`);

  const blobs: { path: string; sha: string }[] = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const blob = await ghApi(`/repos/${OWNER}/${REPO}/git/blobs`, "POST", {
      content: f.content,
      encoding: f.encoding,
    });
    blobs.push({ path: f.path, sha: blob.sha });
    process.stdout.write(`\r  Creating blobs: ${i + 1}/${files.length}`);
  }
  console.log("");

  const tree = await ghApi(`/repos/${OWNER}/${REPO}/git/trees`, "POST", {
    tree: blobs.map(b => ({
      path: b.path,
      mode: "100644",
      type: "blob",
      sha: b.sha,
    })),
  });
  console.log(`Tree created: ${tree.sha}`);

  const commit = await ghApi(`/repos/${OWNER}/${REPO}/git/commits`, "POST", {
    message: "Shopify theme: Comic Crafter Pro v1.0",
    tree: tree.sha,
    parents: [mainSha],
  });
  console.log(`Commit created: ${commit.sha}`);

  try {
    await ghApi(`/repos/${OWNER}/${REPO}/git/refs`, "POST", {
      ref: `refs/heads/${BRANCH}`,
      sha: commit.sha,
    });
    console.log(`Branch '${BRANCH}' created!`);
  } catch (e: any) {
    if (e.message?.includes("422")) {
      await ghApi(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, "PATCH", {
        sha: commit.sha,
        force: true,
      });
      console.log(`Branch '${BRANCH}' updated!`);
    } else {
      throw e;
    }
  }

  console.log("\n=== Done! ===");
  console.log(`Now go to Shopify > Online Store > Themes > Connect theme`);
  console.log(`  Account: Esparramador`);
  console.log(`  Repository: comiccrafter-ai`);
  console.log(`  Branch: shopify-theme`);
}

main().catch(err => {
  console.error("Failed:", err.message);
  process.exit(1);
});
