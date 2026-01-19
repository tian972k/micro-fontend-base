#!/usr/bin/env node

/**
 * validate-app-ids.mjs
 *
 * Build-time validation script to ensure APP_IDS in @repo/config
 * are consistent with package.json names in apps/.
 *
 * Usage: node scripts/validate-app-ids.mjs
 * Exit codes: 0 = valid, 1 = mismatch found
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APPS_DIR = path.join(__dirname, "../apps");
const CONFIG_PATH = path.join(
  __dirname,
  "../packages/config/src/constants/apps.ts"
);

// ANSI colors
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

function getPackageNames() {
  const apps = fs.readdirSync(APPS_DIR, { withFileTypes: true });
  const packageNames = new Map();

  for (const app of apps) {
    if (!app.isDirectory()) continue;

    const pkgPath = path.join(APPS_DIR, app.name, "package.json");
    if (!fs.existsSync(pkgPath)) continue;

    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    packageNames.set(app.name, pkg.name);
  }

  return packageNames;
}

function getAppIdsFromConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`${RED}❌ Config file not found: ${CONFIG_PATH}${RESET}`);
    process.exit(1);
  }

  const content = fs.readFileSync(CONFIG_PATH, "utf8");

  // Extract APP_IDS object values using regex
  const appIdsMatch = content.match(/APP_IDS\s*=\s*\{([^}]+)\}/s);
  if (!appIdsMatch) {
    console.error(`${RED}❌ Could not parse APP_IDS from config${RESET}`);
    process.exit(1);
  }

  const appIds = new Map();
  const entries = appIdsMatch[1].matchAll(/(\w+):\s*"([^"]+)"/g);

  for (const [, key, value] of entries) {
    appIds.set(key, value);
  }

  return appIds;
}

function validate() {
  console.log("🔍 Validating APP_IDS against package.json names...\n");

  const packageNames = getPackageNames();
  const appIds = getAppIdsFromConfig();

  let hasErrors = false;
  const warnings = [];

  // Check each package.json name exists in APP_IDS
  for (const [folder, pkgName] of packageNames) {
    if (folder === "shell") continue; // Skip shell

    const matchingEntry = [...appIds.entries()].find(
      ([, value]) => value === pkgName
    );

    if (!matchingEntry) {
      console.log(
        `${RED}❌ Missing in APP_IDS: "${pkgName}" (apps/${folder})${RESET}`
      );
      hasErrors = true;
    } else {
      console.log(`${GREEN}✓ ${pkgName}${RESET}`);
    }
  }

  // Check for orphaned APP_IDS (defined but no matching app)
  for (const [key, value] of appIds) {
    if (key === "SHELL") continue;

    const matchingPkg = [...packageNames.values()].find((name) => name === value);

    if (!matchingPkg) {
      warnings.push(`⚠️  Orphaned APP_ID: ${key} = "${value}" (no matching app)`);
    }
  }

  if (warnings.length > 0) {
    console.log(`\n${YELLOW}Warnings:${RESET}`);
    warnings.forEach((w) => console.log(`  ${YELLOW}${w}${RESET}`));
  }

  if (hasErrors) {
    console.log(
      `\n${RED}❌ Validation failed. Please update @repo/config/src/constants/apps.ts${RESET}`
    );
    process.exit(1);
  }

  console.log(`\n${GREEN}✅ All APP_IDS are valid!${RESET}`);
  process.exit(0);
}

validate();
