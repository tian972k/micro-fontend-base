#!/usr/bin/env node
/**
 * Bundle size report for every built app.
 *
 *   pnpm size                      # table of JS/CSS per app (raw + gzip)
 *   pnpm size --top 5              # also list the 5 largest files per app
 *   pnpm size --save               # write the result as the new baseline
 *   pnpm size --check              # fail when an app grew past the budget
 *   pnpm size --check --max-growth 5   # allowed growth in % (default 10)
 *
 * The baseline lives in scripts/bundle-baseline.json. Sizes are measured
 * on the build output, so run `pnpm build` first.
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
import { gzipSync } from "zlib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE = join(ROOT, "scripts/bundle-baseline.json");

/** Where each kind of app puts the assets the browser downloads. */
const OUTPUT_DIRS = ["dist/assets", "public/assets", "build/client/assets"];

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function measure(appDir) {
  const dir = OUTPUT_DIRS.map((d) => join(appDir, d)).find(existsSync);
  if (!dir) return null;

  const files = walk(dir)
    .filter((file) => [".js", ".css"].includes(extname(file)))
    .map((file) => {
      const content = readFileSync(file);
      return {
        file: relative(dir, file),
        type: extname(file).slice(1),
        raw: content.length,
        gzip: gzipSync(content).length,
      };
    })
    .sort((a, b) => b.gzip - a.gzip);

  const total = (type, key) =>
    files.filter((f) => f.type === type).reduce((sum, f) => sum + f[key], 0);

  return {
    js: total("js", "raw"),
    jsGzip: total("js", "gzip"),
    css: total("css", "raw"),
    cssGzip: total("css", "gzip"),
    files,
  };
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

const appsDir = join(ROOT, "apps");
const report = {};
for (const app of readdirSync(appsDir).sort()) {
  const result = measure(join(appsDir, app));
  if (result) report[app] = result;
}

if (Object.keys(report).length === 0) {
  console.error("No build output found. Run `pnpm build` first.");
  process.exit(1);
}

const baseline = existsSync(BASELINE)
  ? JSON.parse(readFileSync(BASELINE, "utf-8"))
  : {};
const top = Number(option("top", 0));
const maxGrowth = Number(option("max-growth", 10));
const failures = [];

console.log(
  `\n${"app".padEnd(14)}${"JS".padStart(11)}${"JS gzip".padStart(11)}${"CSS gzip".padStart(11)}${"total gzip".padStart(12)}   vs baseline`,
);
for (const [app, r] of Object.entries(report)) {
  const total = r.jsGzip + r.cssGzip;
  const before = baseline[app]?.totalGzip;
  let diff = "";
  if (before) {
    const pct = ((total - before) / before) * 100;
    diff = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
    if (pct > maxGrowth)
      failures.push(`${app} grew ${diff} (${kb(before)} -> ${kb(total)})`);
  }
  console.log(
    `${app.padEnd(14)}${kb(r.js).padStart(11)}${kb(r.jsGzip).padStart(11)}${kb(r.cssGzip).padStart(11)}${kb(total).padStart(12)}   ${diff}`,
  );
  for (const f of r.files.slice(0, top)) {
    console.log(`  ${kb(f.gzip).padStart(10)}  ${f.file}`);
  }
}
console.log("");

if (flag("save")) {
  const next = Object.fromEntries(
    Object.entries(report).map(([app, r]) => [
      app,
      { jsGzip: r.jsGzip, cssGzip: r.cssGzip, totalGzip: r.jsGzip + r.cssGzip },
    ]),
  );
  writeFileSync(BASELINE, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`Baseline saved to ${relative(ROOT, BASELINE)}\n`);
}

if (flag("check") && failures.length > 0) {
  console.error(`Bundle budget exceeded (max growth ${maxGrowth}%):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error("\nIf the growth is intended, run `pnpm size --save`.\n");
  process.exit(1);
}
