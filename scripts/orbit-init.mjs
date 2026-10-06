#!/usr/bin/env node
/**
 * Turn a fresh copy of Orbit into a new project.
 *
 *   pnpm orbit:init --name acme-portal [--title "Acme Portal"]
 *                   [--keep app-react,vue] [--dry-run] [--yes] [--no-install]
 *
 * - names the workspace and the shell (package.json, README, page title)
 * - keeps only the MFEs you list (ids or frameworks) and removes the rest
 *   everywhere they're wired: apps/, MFE_APPS, scripts/mfe.config.mjs, CI,
 *   docker-compose, turbo env, shell nav, env examples
 * - generates apps/shell/.env with a random SESSION_SECRET
 * - resets the CHANGELOG and runs `pnpm install` to refresh the lockfile
 *
 * Run it once, on a clean checkout, before your first commit.
 */

import { execSync } from "child_process";
import { randomBytes } from "crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { createInterface } from "readline/promises";
import { MFE_APPS } from "./mfe.config.mjs";
import {
  removeFromCi,
  removeFromCompose,
  removeFromNav,
  removeFromRegistry,
  removeFromScriptsConfig,
  removeFromTurbo,
  upperName,
} from "./lib/orbit-transforms.mjs";

const ROOT = process.cwd();
const args = parseArgs(process.argv.slice(2));
const dryRun = Boolean(args["dry-run"]);
const actions = [];

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const [key, inline] = arg.slice(2).split("=");
    if (inline !== undefined) out[key] = inline;
    else if (argv[i + 1] && !argv[i + 1].startsWith("--")) out[key] = argv[++i];
    else out[key] = true;
  }
  return out;
}

function file(rel) {
  return join(ROOT, rel);
}

function edit(rel, transform, label) {
  const path = file(rel);
  if (!existsSync(path)) return;
  const before = readFileSync(path, "utf-8");
  const after = transform(before);
  if (after === before) return;
  actions.push(`edit   ${rel}${label ? ` (${label})` : ""}`);
  if (!dryRun) writeFileSync(path, after);
}

function write(rel, content, label) {
  actions.push(`write  ${rel}${label ? ` (${label})` : ""}`);
  if (!dryRun) writeFileSync(file(rel), content);
}

function remove(rel) {
  if (!existsSync(file(rel))) return;
  actions.push(`delete ${rel}`);
  if (!dryRun) rmSync(file(rel), { recursive: true, force: true });
}

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// ---------------------------------------------------------------------------
// Inputs
// ---------------------------------------------------------------------------

async function resolveInputs() {
  let name = typeof args.name === "string" ? args.name : "";
  let keep = typeof args.keep === "string" ? args.keep : "";

  const interactive = process.stdin.isTTY && !args.yes;
  if (interactive && (!name || !keep)) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    if (!name) name = await rl.question("Project name (e.g. acme-portal): ");
    if (!keep) {
      const all = MFE_APPS.map((a) => a.name).join(", ");
      keep =
        (await rl.question(
          `Micro-frontends to keep [${all}] (comma-separated, empty = all): `,
        )) || all;
    }
    rl.close();
  }

  name = slugify(name);
  if (!name) {
    console.error(
      "❌ --name is required, e.g. pnpm orbit:init --name acme-portal",
    );
    process.exit(1);
  }
  const title =
    typeof args.title === "string"
      ? args.title
      : name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const wanted = keep
    ? keep
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const kept = wanted.length
    ? MFE_APPS.filter((app) =>
        wanted.some(
          (w) =>
            w === app.name ||
            w === app.framework ||
            w === app.name.replace(/^app-/, ""),
        ),
      )
    : MFE_APPS;

  const unknown = wanted.filter(
    (w) =>
      !MFE_APPS.some(
        (a) =>
          w === a.name ||
          w === a.framework ||
          w === a.name.replace(/^app-/, ""),
      ),
  );
  if (unknown.length) {
    console.error(`❌ Unknown micro-frontend(s): ${unknown.join(", ")}`);
    console.error(`   Available: ${MFE_APPS.map((a) => a.name).join(", ")}`);
    process.exit(1);
  }
  if (kept.length === 0) {
    console.error(
      "❌ Keep at least one micro-frontend (add more later with pnpm mfe:add).",
    );
    process.exit(1);
  }

  return {
    name,
    title,
    kept,
    removed: MFE_APPS.filter((a) => !kept.includes(a)),
  };
}

// ---------------------------------------------------------------------------
// Removing an MFE everywhere it is wired
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const { name, title, kept, removed } = await resolveInputs();

console.log(
  `\n🪐 Orbit init → ${title} (${name})${dryRun ? "  [dry run]" : ""}`,
);
console.log(`   keep:   ${kept.map((a) => a.name).join(", ")}`);
console.log(
  `   remove: ${removed.map((a) => a.name).join(", ") || "(none)"}\n`,
);

const registryApps = (() => {
  // slug/framework come from the TS registry; parse just what we need.
  const src = readFileSync(
    file("packages/config/src/constants/apps.ts"),
    "utf-8",
  );
  return Object.fromEntries(
    [...src.matchAll(/id: "([^"]+)",[\s\S]*?slug: "([^"]+)"/g)].map((m) => [
      m[1],
      { slug: m[2] },
    ]),
  );
})();

for (const app of removed) {
  const id = app.name;
  const meta = {
    ...app,
    slug: registryApps[id]?.slug ?? id.replace(/^app-/, ""),
  };
  remove(`apps/${id}`);
  edit(
    "packages/config/src/constants/apps.ts",
    (s) => removeFromRegistry(s, id),
    `drop ${id}`,
  );
  edit(
    "scripts/mfe.config.mjs",
    (s) => removeFromScriptsConfig(s, id),
    `drop ${id}`,
  );
  edit(
    ".github/workflows/ci-cd.yml",
    (s) => removeFromCi(s, id),
    `drop ${id} jobs`,
  );
  edit(
    "docker-compose.yml",
    (s) => removeFromCompose(s, id),
    `drop ${id} service`,
  );
  edit("turbo.json", (s) => removeFromTurbo(s, meta), `drop ${id} env`);
  edit(
    "apps/shell/app/components/layout/sidebar/nav-config.ts",
    (s) => removeFromNav(s, id),
    `drop ${id} icon`,
  );
  edit(
    "apps/shell/.env.example",
    (s) => s.replace(new RegExp(`^APP_${upperName(id)}_PORT=.*\\n`, "m"), ""),
    `drop ${id} port`,
  );
}

// Naming
edit(
  "package.json",
  (s) => {
    const json = JSON.parse(s);
    json.name = name;
    return JSON.stringify(json, null, 2) + "\n";
  },
  `name: ${name}`,
);

edit(
  "README.md",
  (s) =>
    s.replace(
      /^# .*$/m,
      `# ${title}\n\n> Built on [Orbit](https://github.com/tian972k/micro-fontend-base), a micro-frontend platform.`,
    ),
  "title",
);

edit(
  "apps/shell/app/root.tsx",
  (s) =>
    s.replace(
      /title: "Orbit \| Micro-Frontend Platform"/,
      `title: ${JSON.stringify(title)}`,
    ),
  "page title",
);

write(
  "CHANGELOG.md",
  `# Changelog\n\nAll notable changes to ${title} are documented in this file.\n\n## [Unreleased]\n\n- Project created from Orbit (micro-frontends: ${kept
    .map((a) => a.name)
    .join(", ")}).\n`,
  "reset",
);

if (!existsSync(file("apps/shell/.env"))) {
  write(
    "apps/shell/.env",
    `# Local development only (gitignored). Use a different secret per environment.\nSESSION_SECRET=${randomBytes(32).toString("base64")}\n`,
    "random SESSION_SECRET",
  );
}

for (const action of actions) console.log(`  ${action}`);

if (dryRun) {
  console.log("\nDry run: nothing was changed.");
  process.exit(0);
}

if (!args["no-install"]) {
  console.log("\n📦 pnpm install (refreshing the lockfile)...");
  execSync("pnpm install", { stdio: "inherit" });
}

console.log(`
✅ ${title} is ready.

Next steps
  1. Review MFE_APPS (packages/config/src/constants/apps.ts): names, titles, slugs.
  2. Replace verifyCredentials() in apps/shell/app/server/auth.server.ts
     with your identity provider.
  3. Per environment: SESSION_SECRET, MFE_URL_<ID> / VITE_APP_<SLUG>_HOST,
     CSP_EXTRA_ORIGINS, TELEMETRY_FORWARD_URL  (docs/configuration.md).
  4. Add MFEs any time: pnpm mfe:add <name> <react|vue|svelte|solidjs>
  5. pnpm dev, then commit.
`);
