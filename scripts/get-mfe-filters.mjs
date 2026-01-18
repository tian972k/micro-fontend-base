#!/usr/bin/env node

/**
 * Get turbo filter arguments for all MFE apps
 * Usage: node scripts/get-mfe-filters.mjs
 * Output: --filter=app-react --filter=app-vue ...
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appsDir = path.join(__dirname, '..', 'apps');

// Function to check if an app is an MFE
function isMfeApp(appPath) {
  const packageJsonPath = path.join(appPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return false;
  
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    // MFE apps have build:mfe script or mfe config, and are NOT the shell
    return (pkg.scripts?.['build:mfe'] || pkg.mfe) && pkg.name !== 'shell';
  } catch {
    return false;
  }
}

// Get all MFE app names from their package.json
function getMfeAppNames() {
  if (!fs.existsSync(appsDir)) {
    return [];
  }
  
  const apps = fs.readdirSync(appsDir)
    .filter(name => {
      const appPath = path.join(appsDir, name);
      return fs.statSync(appPath).isDirectory() && isMfeApp(appPath);
    })
    .map(name => {
      // Get package name from package.json
      const pkgPath = path.join(appsDir, name, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      return pkg.name;
    });
  
  return apps;
}

const mfeApps = getMfeAppNames();

// Output filter arguments
if (mfeApps.length > 0) {
  const filters = mfeApps.map(app => `--filter=${app}`).join(' ');
  console.log(filters);
} else {
  console.error('No MFE apps found', { logLevel: 'error' });
  process.exit(1);
}
