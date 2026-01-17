#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const APPS_DIR = path.join(__dirname, "../apps");

// Framework Templates based on existing apps
const TEMPLATES = {
  react: { source: "app-a", color: "\x1b[36m" }, // Cyan
  vue: { source: "app-c", color: "\x1b[32m" }, // Green
  svelte: { source: "app-d", color: "\x1b[33m" }, // Yellow
};

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log("🚀 Micro-Frontend Generator");
  console.log("===========================");

  // 1. Get App Name
  const appName = await question(
    "📦 App Name (kebab-case, e.g. 'trade-desk'): ",
  );

  if (!appName || !/^[a-z0-9-]+$/.test(appName)) {
    console.error("❌ Invalid app name. Use lowercase letters, numbers, and dashes.");
    process.exit(1);
  }

  const appPath = path.join(APPS_DIR, appName);

  if (fs.existsSync(appPath)) {
    console.error(`❌ App "${appName}" already exists!`);
    process.exit(1);
  }

  // 2. Choose Framework
  console.log("\n🎨 Choose Framework:");
  console.log("  1. React (Vite + Remix)");
  console.log("  2. Vue 3 (Vite + Composition API)");
  console.log("  3. Svelte (Vite + SvelteKit)");

  const frameworkChoice = await question("\nYour choice (1-3): ");

  const frameworkMap = {
    "1": "react",
    "2": "vue",
    "3": "svelte",
  };

  const framework = frameworkMap[frameworkChoice];

  if (!framework) {
    console.error("❌ Invalid framework choice.");
    process.exit(1);
  }

  const template = TEMPLATES[framework];
  const sourcePath = path.join(APPS_DIR, template.source);

  console.log(
    `\n${template.color}✨ Creating ${framework.toUpperCase()} app: ${appName}\x1b[0m`,
  );

  // 3. Copy Template
  console.log("📂 Copying template files...");
  fs.cpSync(sourcePath, appPath, { recursive: true });

  // 4. Update package.json
  const pkgPath = path.join(appPath, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  pkg.name = appName;
  pkg.version = "0.1.0";

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  // 5. Update public/manifest.json if exists
  const manifestPath = path.join(appPath, "public/manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    manifest.name = appName;
    manifest.entry = `./${appName}/entry-mfe`;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }

  // 6. Update README if exists
  const readmePath = path.join(appPath, "README.md");
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, "utf8");
    readme = readme.replace(new RegExp(template.source, "g"), appName);
    fs.writeFileSync(readmePath, readme);
  }

  // 7. Clean up node_modules and lock files
  const cleanupPaths = [
    path.join(appPath, "node_modules"),
    path.join(appPath, "pnpm-lock.yaml"),
    path.join(appPath, ".turbo"),
    path.join(appPath, "dist"),
    path.join(appPath, "build"),
  ];

  cleanupPaths.forEach((p) => {
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
    }
  });

  // 8. Update root package.json to add dev script
  console.log("📝 Updating root package.json...");
  const rootPkgPath = path.join(__dirname, "..", "package.json");
  const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, "utf8"));
  
  const devScriptKey = `dev:${appName}`;
  if (!rootPkg.scripts[devScriptKey]) {
    rootPkg.scripts[devScriptKey] = `turbo run dev --filter=${appName}`;
    fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + "\n");
    console.log(`✅ Added script: pnpm dev:${appName}`);
  }

  console.log("\n✅ App created successfully!");
  console.log(`\n📁 Location: apps/${appName}`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. cd apps/${appName}`);
  console.log(`   2. Update src/ with your app logic`);
  console.log(`   3. Update vite.config.ts if needed`);
  console.log(`   4. pnpm install (from root)`);
  console.log(`   5. pnpm dev:${appName} (to run this app only)`);
  console.log(`   6. pnpm dev (to run all apps)\n`);

  rl.close();
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
