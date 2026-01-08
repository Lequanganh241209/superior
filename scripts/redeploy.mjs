// Redeploy current workspace to Vercel using Direct Upload API
// Usage: node scripts/redeploy.mjs <project-name>
import fs from "fs";
import path from "path";

const VERCEL_API_URL = "https://api.vercel.com";

function loadEnv(file) {
  try {
    const content = fs.readFileSync(file, "utf-8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = val;
      }
    }
  } catch {}
}

async function ensureProject(name, token) {
  await fetch(`${VERCEL_API_URL}/v9/projects`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, framework: "nextjs" }),
  }).catch(() => {});
}

function collectWorkspaceFiles() {
  const base = process.cwd();
  const includeExt = new Set([".js", ".ts", ".tsx", ".json", ".css", ".md", ".sql", ".svg"]);
  const ignoreDirs = new Set(["node_modules", ".next", ".git", ".vercel"]);
  const ignoreFiles = [/^\.env/i, /^\.DS_Store$/i];
  const files = [];
  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (ignoreDirs.has(e.name)) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else {
        if (ignoreFiles.some((rx) => rx.test(e.name))) continue;
        const ext = path.extname(e.name).toLowerCase();
        if (!includeExt.has(ext)) continue;
        const rel = path.relative(base, full).replace(/\\/g, "/");
        const content = fs.readFileSync(full, "utf-8");
        files.push({ file: rel.startsWith("/") ? rel.slice(1) : rel, data: content });
      }
    }
  };
  walk(base);
  return files;
}

async function deploy(name, files, token) {
  const res = await fetch(`${VERCEL_API_URL}/v13/deployments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      files,
      projectSettings: { framework: "nextjs" },
      target: "production",
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Failed to upload deployment");
  }
  return data;
}

async function bindAlias(name, deploymentId, token) {
  await fetch(`${VERCEL_API_URL}/v13/deployments/${deploymentId}/aliases`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ alias: `${name}.vercel.app` }),
  }).catch(() => {});
}

async function setEnv(name, token) {
  const envs = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  };
  const projRes = await fetch(`${VERCEL_API_URL}/v9/projects/${name}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!projRes.ok) return;
  const proj = await projRes.json();
  const listRes = await fetch(`${VERCEL_API_URL}/v9/projects/${proj.id}/env`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const existing = listRes.ok ? await listRes.json() : { envs: [] };
  const map = {};
  for (const e of existing.envs || []) map[e.key] = e;
  for (const [key, value] of Object.entries(envs)) {
    if (!value) continue;
    if (map[key]?.id) {
      await fetch(`${VERCEL_API_URL}/v9/projects/${proj.id}/env/${map[key].id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ value, target: ["production", "preview"] }),
      }).catch(() => {});
    } else {
      await fetch(`${VERCEL_API_URL}/v9/projects/${proj.id}/env`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, target: ["production", "preview"] }),
      }).catch(() => {});
    }
  }
}

async function disableProtection(name, token) {
  const projRes = await fetch(`${VERCEL_API_URL}/v9/projects/${name}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!projRes.ok) return;
  const proj = await projRes.json();
  await fetch(`${VERCEL_API_URL}/v9/projects/${proj.id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      vercelAuth: false,
      passwordProtection: false,
      deploymentProtection: { enabled: false },
    }),
  }).catch(() => {});
}

async function main() {
  const raw = process.argv[2] || "";
  const name = raw.toLowerCase().replace(/\s+/g, "-");
  let token = process.env.VERCEL_ACCESS_TOKEN;
  if (!token) {
    loadEnv(path.join(process.cwd(), ".env.local"));
    loadEnv(path.join(process.cwd(), ".env"));
    token = process.env.VERCEL_ACCESS_TOKEN;
  }
  if (!name) {
    console.error("Usage: node scripts/redeploy.mjs <project-name>");
    process.exit(1);
  }
  if (!token) {
    console.error("VERCEL_ACCESS_TOKEN is missing");
    process.exit(1);
  }
  await ensureProject(name, token);
  await setEnv(name, token);
  await disableProtection(name, token);
  const files = collectWorkspaceFiles();
  const data = await deploy(name, files, token);
  const deploymentId = data.id || data.deploymentId;
  if (deploymentId) await bindAlias(name, deploymentId, token);
  const url = data.url ? `https://${data.url}` : `https://${name}.vercel.app`;
  console.log(JSON.stringify({ success: true, url, inspector: `https://vercel.com${data.inspectorUrl || ""}` }, null, 2));
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
