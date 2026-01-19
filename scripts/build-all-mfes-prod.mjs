#!/usr/bin/env node

/**
 * Optimized build script for MFE apps
 * Builds all MFE apps in production mode
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apps = ['app-react', 'app-nextjs', 'app-vue', 'app-svelte', 'app-solidjs'];

console.log('🚀 Building all MFE apps for production...\n');

let successCount = 0;
let failCount = 0;

for (const app of apps) {
  const appDir = path.join(__dirname, '..', 'apps', app);
  
  console.log(`📦 Building ${app}...`);
  
  try {
    // Use MFE build mode
    execSync('pnpm build:mfe', {
      cwd: appDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        MFE_MODE: 'true',
        NODE_ENV: 'production',
      },
    });
    
    console.log(`✅ ${app} built successfully\n`);
    successCount++;
  } catch (error) {
    console.error(`❌ Failed to build ${app}\n`);
    failCount++;
  }
}

console.log('\n📊 Build Summary:');
console.log(`  ✅ Success: ${successCount}/${apps.length}`);
console.log(`  ❌ Failed: ${failCount}/${apps.length}`);

if (failCount > 0) {
  process.exit(1);
}

console.log('\n🎉 All MFE apps built successfully!');
