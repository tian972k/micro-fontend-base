#!/usr/bin/env node

/**
 * Production build script for all MFE apps
 * Uses central config from mfe.config.mjs
 */

import { execSync } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { getMfeApps } from './mfe.config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mfeApps = getMfeApps();

console.log('🚀 Building all MFE apps for production...\n');

let successCount = 0;
let failCount = 0;

for (const app of mfeApps) {
  const appDir = path.join(__dirname, '..', 'apps', app.name);
  
  console.log(`📦 Building ${app.name} (${app.framework})...`);
  
  try {
    execSync('pnpm build:mfe', {
      cwd: appDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        MFE_MODE: 'true',
        NODE_ENV: 'production',
      },
    });
    
    console.log(`✅ ${app.name} built successfully\n`);
    successCount++;
  } catch (error) {
    console.error(`❌ Failed to build ${app.name}\n`);
    failCount++;
  }
}

console.log('\n📊 Build Summary:');
console.log(`  ✅ Success: ${successCount}/${mfeApps.length}`);
console.log(`  ❌ Failed: ${failCount}/${mfeApps.length}`);

if (failCount > 0) {
  process.exit(1);
}

console.log('\n🎉 All MFE apps built successfully!');
