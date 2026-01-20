#!/usr/bin/env node

/**
 * Build all MFE apps in the workspace
 * Uses central config from mfe.config.mjs
 */

import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { getMfeApps } from './mfe.config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appsDir = path.join(__dirname, '..', 'apps');

// Get all enabled MFE apps from config
const mfeApps = getMfeApps();

if (mfeApps.length === 0) {
  console.log('⚠️  No MFE apps configured');
  process.exit(0);
}

console.log(`📦 Building ${mfeApps.length} MFE apps:`, mfeApps.map(a => a.name).join(', '));

// Build each MFE
let errors = 0;
for (const app of mfeApps) {
  const appPath = path.join(appsDir, app.name);
  
  try {
    console.log(`\n🔨 Building ${app.name} (${app.framework})...`);
    execSync('pnpm build:mfe', {
      cwd: appPath,
      stdio: 'inherit',
      env: {
        ...process.env,
        MFE_MODE: 'true',
        NODE_ENV: process.env.NODE_ENV || 'production',
      },
    });
    console.log(`✅ ${app.name} built successfully`);
  } catch (err) {
    console.error(`❌ Failed to build ${app.name}`);
    errors++;
  }
}

if (errors > 0) {
  console.log(`\n⚠️  ${errors} app(s) failed to build`);
  process.exit(1);
} else {
  console.log(`\n✅ All MFE apps built successfully!`);
}
