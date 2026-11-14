#!/usr/bin/env node
/**
 * Find dependencies a workspace declares but never uses.
 *
 *   pnpm deps:unused            # report (exit 1 when something is unused)
 *   pnpm deps:unused --fix      # remove unused `dependencies`
 *   pnpm deps:unused --dev      # also list devDependencies (never auto-removed:
 *                               #   tooling is often referenced indirectly)
 *
 * A dependency counts as used when its name is imported/required (or
 * referenced as a string, e.g. in a Tailwind/PostCSS/Storybook config)
 * anywhere in the workspace, or when one of its binaries is called from
 * a package.json script.
 *
 * Unused runtime dependencies don't end up in the bundle on their own
 * (the bundler only includes what is imported), but they slow installs,
 * widen the audit surface and invite accidental imports - keep the list
 * honest.
 */

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import { dirname, extname, join, relative } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const fix = args.includes("--fix");
const includeDev = args.includes("--dev");

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".vue",
  ".svelte",
  ".css",
  ".html",
  ".json",
]);
const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  ".next",
  ".turbo",
  ".vercel",
  ".cache",
  "storybook-static",
  "coverage",
  "playwright-report",
  "test-results",
]);
const SKIP_FILES = new Set(["package.json", "pnpm-lock.yaml", "stats.json"]);

/** Never reported: used implicitly by tooling rather than imported. */
const ALWAYS_USED = [
  /^@types\//,
  /^typescript$/,
  /^@repo\/config$/, // tsconfig/eslint presets are referenced by path
  // Peer dependencies of other tools (Tailwind, Testing Library, presets).
  /^(postcss|autoprefixer|eslint|@testing-library\/dom)$/,
];

function sourceFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      // Build output served from public/ (e.g. the Next.js MFE) isn't source.
      if (entry === "assets" && dir.endsWith("public")) continue;
      out.push(...sourceFiles(full));
    } else if (
      SOURCE_EXTENSIONS.has(extname(entry)) &&
      !SKIP_FILES.has(entry) &&
      stat.size < 1024 * 1024
    ) {
      out.push(full);
    }
  }
  return out;
}

function binNames(workspaceDir, dep) {
  const manifest = join(workspaceDir, "node_modules", dep, "package.json");
  if (!existsSync(manifest)) return [];
  const { bin, name } = JSON.parse(readFileSync(manifest, "utf-8"));
  if (!bin) return [];
  return typeof bin === "string" ? [name.split("/").pop()] : Object.keys(bin);
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function isUsed(dep, corpus, scripts, workspaceDir) {
  if (ALWAYS_USED.some((pattern) => pattern.test(dep))) return true;
  // ESLint shorthand: "plugin:react/recommended", extends: ["next"].
  const eslintName = dep.match(/^eslint-(plugin|config)-(.+)$/)?.[2];
  if (
    eslintName &&
    new RegExp(`['"](plugin:)?${escapeRegExp(eslintName)}(/[^'"]*)?['"]`).test(
      corpus,
    )
  ) {
    return true;
  }
  // "dep", 'dep/sub', `dep` - import specifiers and config strings alike.
  const quoted = new RegExp(`['"\`]${escapeRegExp(dep)}(/[^'"\`]*)?['"\`]`);
  if (quoted.test(corpus)) return true;
  // PostCSS-style object keys: { tailwindcss: {}, autoprefixer: {} }
  const key = new RegExp(`(^|[\\s{,])${escapeRegExp(dep)}\\s*:`, "m");
  if (/^[a-z0-9-]+$/.test(dep) && key.test(corpus)) return true;
  return binNames(workspaceDir, dep).some((bin) =>
    new RegExp(`(^|[\\s"'&|;(])${escapeRegExp(bin)}(\\s|$)`).test(scripts),
  );
}

const workspaces = ["apps", "packages"].flatMap((group) =>
  readdirSync(join(ROOT, group))
    .map((name) => join(ROOT, group, name))
    .filter((dir) => existsSync(join(dir, "package.json"))),
);

let unusedTotal = 0;
for (const dir of workspaces) {
  const manifestPath = join(dir, "package.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  const corpus = sourceFiles(dir)
    .map((file) => readFileSync(file, "utf-8"))
    .join("\n");
  const scripts = Object.values(manifest.scripts ?? {}).join("\n");

  const fields = includeDev
    ? ["dependencies", "devDependencies"]
    : ["dependencies"];
  const unused = [];
  for (const field of fields) {
    for (const dep of Object.keys(manifest[field] ?? {})) {
      // Declared twice (dependencies + devDependencies): judged once.
      if (!isUsed(dep, corpus, scripts, dir)) unused.push({ field, dep });
    }
  }
  if (unused.length === 0) continue;

  unusedTotal += unused.length;
  console.log(`\n${relative(ROOT, dir)} (${manifest.name})`);
  for (const { field, dep } of unused) {
    console.log(`  - ${dep}  [${field}]`);
    if (fix && field === "dependencies") delete manifest[field][dep];
  }
  if (fix) {
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
}

if (unusedTotal === 0) {
  console.log("No unused dependencies found.");
} else if (fix) {
  console.log(
    "\nRemoved the unused `dependencies`. Run `pnpm install` to update the lockfile.",
  );
} else {
  console.log(
    `\n${unusedTotal} unused dependencies. Run \`pnpm deps:unused --fix\` to remove them.`,
  );
  process.exit(1);
}
