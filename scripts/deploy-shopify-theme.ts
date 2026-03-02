import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHOPIFY_STORE = "comic-crafter.myshopify.com";
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = "2024-01";
const THEME_DIR = path.resolve(__dirname, "../shopify-theme");

if (!ACCESS_TOKEN) {
  console.error("SHOPIFY_ACCESS_TOKEN not set");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  "X-Shopify-Access-Token": ACCESS_TOKEN,
};

async function api(endpoint: string, method = "GET", body?: any) {
  const url = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}${endpoint}`;
  const res = await fetch(url, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify API error ${res.status}: ${text}`);
  }
  return res.json();
}

async function getOrCreateTheme(): Promise<number> {
  const data = await api("/themes.json");
  const existing = data.themes.find((t: any) => t.name === "Comic Crafter Pro");
  if (existing) {
    console.log(`Found existing theme: ${existing.name} (ID: ${existing.id})`);
    return existing.id;
  }
  console.log("Creating new theme 'Comic Crafter Pro'...");
  const created = await api("/themes.json", "POST", {
    theme: { name: "Comic Crafter Pro", role: "main" },
  });
  console.log(`Created theme ID: ${created.theme.id}`);
  return created.theme.id;
}

function getThemeFiles(): { key: string; value?: string; attachment?: string }[] {
  const files: { key: string; value?: string; attachment?: string }[] = [];
  const dirs = ["layout", "templates", "sections", "snippets", "config", "locales"];

  for (const dir of dirs) {
    const dirPath = path.join(THEME_DIR, dir);
    if (!fs.existsSync(dirPath)) continue;

    const entries = fs.readdirSync(dirPath, { recursive: true }) as string[];
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      if (fs.statSync(fullPath).isDirectory()) {
        const subEntries = fs.readdirSync(fullPath);
        for (const subEntry of subEntries) {
          const subPath = path.join(fullPath, subEntry);
          if (fs.statSync(subPath).isFile()) {
            const key = `${dir}/${entry}/${subEntry}`;
            files.push({ key, value: fs.readFileSync(subPath, "utf-8") });
          }
        }
      } else {
        const key = `${dir}/${entry}`;
        files.push({ key, value: fs.readFileSync(fullPath, "utf-8") });
      }
    }
  }

  const assetsDir = path.join(THEME_DIR, "assets");
  if (fs.existsSync(assetsDir)) {
    for (const file of fs.readdirSync(assetsDir)) {
      const fullPath = path.join(assetsDir, file);
      if (!fs.statSync(fullPath).isFile()) continue;
      const ext = path.extname(file).toLowerCase();
      const isText = [".css", ".js", ".json", ".svg", ".liquid"].includes(ext);
      if (isText) {
        files.push({ key: `assets/${file}`, value: fs.readFileSync(fullPath, "utf-8") });
      } else {
        files.push({
          key: `assets/${file}`,
          attachment: fs.readFileSync(fullPath).toString("base64"),
        });
      }
    }
  }

  return files;
}

async function uploadAsset(themeId: number, asset: { key: string; value?: string; attachment?: string }, index: number, total: number) {
  const body: any = { asset: { key: asset.key } };
  if (asset.value !== undefined) body.asset.value = asset.value;
  if (asset.attachment !== undefined) body.asset.attachment = asset.attachment;

  try {
    await api(`/themes/${themeId}/assets.json`, "PUT", body);
    console.log(`  [${index + 1}/${total}] ✓ ${asset.key}`);
  } catch (err: any) {
    console.error(`  [${index + 1}/${total}] ✗ ${asset.key}: ${err.message.substring(0, 100)}`);
  }
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function deploy() {
  console.log("═══════════════════════════════════════════");
  console.log("  Comic Crafter — Shopify Theme Deployer");
  console.log("═══════════════════════════════════════════");
  console.log(`Store: ${SHOPIFY_STORE}`);
  console.log(`Theme dir: ${THEME_DIR}`);
  console.log("");

  const themeId = await getOrCreateTheme();
  const files = getThemeFiles();
  console.log(`\nUploading ${files.length} files to theme ${themeId}...\n`);

  for (let i = 0; i < files.length; i++) {
    await uploadAsset(themeId, files[i], i, files.length);
    if ((i + 1) % 2 === 0) await sleep(500);
  }

  console.log("\n═══════════════════════════════════════════");
  console.log("  Theme deployment complete!");
  console.log(`  View: https://${SHOPIFY_STORE}/?preview_theme_id=${themeId}`);
  console.log("═══════════════════════════════════════════");
}

deploy().catch(err => {
  console.error("Deploy failed:", err.message);
  process.exit(1);
});
