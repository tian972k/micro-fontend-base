#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const FRAMEWORKS = {
  react: { port: 8006, template: 'react-ts' },
  vue: { port: 8007, template: 'vue-ts' },
  svelte: { port: 8008, template: 'svelte-ts' },
  solidjs: { port: 8009, template: 'solid-ts' },
};

async function main() {
  const args = process.argv.slice(2);
  const appName = args[0];
  const framework = args[1];

  if (!appName || !framework) {
    console.error('❌ Usage: pnpm mfe:add <app-name> <framework>');
    console.log('   Example: pnpm mfe:add app-analytics react');
    console.log('   Frameworks: react, vue, svelte, solidjs');
    process.exit(1);
  }

  if (!FRAMEWORKS[framework]) {
    console.error(`❌ Invalid framework: ${framework}`);
    console.log('   Available: react, vue, svelte, solidjs');
    process.exit(1);
  }

  const appDir = join(process.cwd(), 'apps', appName);

  if (existsSync(appDir)) {
    console.error(`❌ App already exists: ${appName}`);
    process.exit(1);
  }

  console.log(`\n🚀 Creating new MFE: ${appName} (${framework})\n`);

  // Step 1: Create app directory
  console.log('📁 Creating directory...');
  mkdirSync(appDir, { recursive: true });

  // Step 2: Add to MFE_APPS registry
  console.log('📝 Updating app registry...');
  const appsPath = join(process.cwd(), 'packages/config/src/constants/apps.ts');
  let appsContent = require('fs').readFileSync(appsPath, 'utf-8');
  
  const port = FRAMEWORKS[framework].port;
  const newAppEntry = `  { id: '${appName}', name: '${capitalizeWords(appName.replace('app-', ''))}', framework: '${framework}', port: ${port} },`;
  
  appsContent = appsContent.replace(
    /(export const MFE_APPS = \[[\s\S]*?)(] as const;)/,
    `$1${newAppEntry}\n$2`
  );
  
  writeFileSync(appsPath, appsContent);
  console.log(`   ✅ Added to MFE_APPS registry with port ${port}`);

  // Step 3: Ports auto-generated from MFE_APPS - no manual update needed
  console.log('🔌 Port configuration auto-generated from registry');

  // Step 4: Create package.json
  console.log('📦 Creating package.json...');
  const packageJson = {
    name: appName,
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: `tsc && vite build && node ../../scripts/generate-manifest.mjs $PWD`,
      'build:mfe': `vite build && node ../../scripts/generate-manifest.mjs $PWD`,
      lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
      preview: 'vite preview',
      start: 'vite preview',
      clean: 'rm -rf node_modules dist .cache .turbo',
    },
    dependencies: {
      '@repo/config': 'workspace:*',
      '@repo/core': 'workspace:*',
      '@repo/ui': 'workspace:*',
      '@repo/utils': 'workspace:*',
    },
    devDependencies: {
      '@originjs/vite-plugin-federation': '^1.4.1',
      '@repo/config': 'workspace:*',
      '@types/node': '^20.0.0',
      typescript: '^5.0.0',
      vite: '^5.0.0',
    },
  };

  writeFileSync(
    join(appDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  console.log('\n✅ MFE created successfully!');
  console.log('\n📋 Next steps:');
  console.log(`   1. cd apps/${appName}`);
  console.log('   2. Create src/ directory with entry-mfe file');
  console.log('   3. Create vite.config.mts using createMfeConfig');
  console.log('   4. Run: pnpm install');
  console.log('   5. Run: pnpm dev:all');
  console.log('\n📚 See docs/MFE_DEVELOPMENT_GUIDE.md for details\n');
}

function capitalizeWords(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

main().catch(console.error);
