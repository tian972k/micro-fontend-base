#!/usr/bin/env node

/**
 * Auto-detect and build all MFE apps in the workspace
 * Scans apps/ folder for apps with MFE capability
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appsDir = path.join(__dirname, '..', 'apps');

// Function to check if an app is an MFE
function isMfeApp(appPath, appName) {
  // Exclude shell (it's the MFE host, not an MFE)
  if (appName === 'shell') return false;
  
  const packageJsonPath = path.join(appPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return false;
  
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    // Check if has build:mfe script or mfe config
    return pkg.scripts?.['build:mfe'] || pkg.mfe;
  } catch {
    return false;
  }
}

// Get all MFE apps
function getMfeApps() {
  if (!fs.existsSync(appsDir)) {
    console.error('❌ apps/ directory not found');
    return [];
  }
  
  const apps = fs.readdirSync(appsDir)
    .filter(name => {
      const appPath = path.join(appsDir, name);
      return fs.statSync(appPath).isDirectory() && isMfeApp(appPath, name);
    });
  
  return apps;
}

// Main execution
const mfeApps = getMfeApps();

if (mfeApps.length === 0) {
  console.log('⚠️  No MFE apps found');
  process.exit(0);
}

console.log(`📦 Found ${mfeApps.length} MFE apps:`, mfeApps.join(', '));

// Build each MFE
let errors = 0;
for (const app of mfeApps) {
  const appPath = path.join(appsDir, app);
  
  try {
    console.log(`\n🔨 Building ${app}...`);
    execSync('pnpm build:mfe', {
      cwd: appPath,
      stdio: 'inherit'
    });
    console.log(`✅ ${app} built successfully`);
  } catch (err) {
    console.error(`❌ Failed to build ${app}`);
    errors++;
  }
}

if (errors > 0) {
  console.log(`\n⚠️  ${errors} app(s) failed to build`);
  process.exit(1);
} else {
  console.log(`\n✅ All MFE apps built successfully!`);
}
