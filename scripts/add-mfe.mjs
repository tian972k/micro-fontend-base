#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const FRAMEWORKS = {
  react: { port: 8006, template: 'react-ts', type: 'react', entry: 'entry-mfe.tsx' },
  vue: { port: 8007, template: 'vue-ts', type: 'vue', entry: 'entry-mfe.ts' },
  svelte: { port: 8008, template: 'svelte-ts', type: 'svelte', entry: 'entry-mfe.ts' },
  solidjs: { port: 8009, template: 'solid-ts', type: 'solid', entry: 'entry-mfe.tsx' },
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
  let appsContent = readFileSync(appsPath, 'utf-8');
  
  const port = FRAMEWORKS[framework].port;
  const slug = appName.replace('app-', '');
  const displayName = capitalizeWords(slug);
  const newAppEntry = [
    '  {',
    `    id: "${appName}",`,
    `    name: "${displayName}",`,
    `    framework: "${framework}",`,
    `    port: ${port},`,
    `    slug: "${slug}",`,
    `    type: "${FRAMEWORKS[framework].type}",`,
    `    title: "${displayName}",`,
    `    description: "${displayName} micro-frontend.",`,
    '    accent: "primary",',
    '  },',
  ].join('\n');

  appsContent = appsContent.replace(
    /(export const MFE_APPS = \[[\s\S]*?)(] as const;)/,
    `$1${newAppEntry}\n$2`
  );

  writeFileSync(appsPath, appsContent);

  // Keep the JS copy used by build scripts in sync (a unit test checks it).
  const scriptsConfigPath = join(process.cwd(), 'scripts/mfe.config.mjs');
  const scriptsConfig = readFileSync(scriptsConfigPath, 'utf-8');
  const outputDir = 'dist';
  writeFileSync(
    scriptsConfigPath,
    scriptsConfig.replace(
      /(export const MFE_APPS = \[[\s\S]*?)(\n\];)/,
      `$1\n  {\n    name: '${appName}',\n    framework: '${framework}',\n    port: ${port},\n    entryFile: '${FRAMEWORKS[framework].entry}',\n    outputDir: '${outputDir}',\n  },$2`,
    ),
  );
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
      '@module-federation/vite': 'catalog:',
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
  console.log('\n📚 See docs/creating-a-micro-frontend.md for the next steps\n');
}

function capitalizeWords(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

main().catch(console.error);
