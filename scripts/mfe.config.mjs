#!/usr/bin/env node

/**
 * 🎯 CENTRAL MFE CONFIGURATION
 * ============================
 * Single source of truth for all MFE apps in the monorepo.
 * 
 * When creating a new MFE app:
 * 1. Add entry to MFE_APPS below
 * 2. That's it! All scripts will pick it up automatically.
 * 
 * @example
 * import { getMfeApps, getMfeAppByName } from './mfe.config.mjs';
 * const apps = getMfeApps();
 * const reactApp = getMfeAppByName('app-react');
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// MFE APP DEFINITIONS
// ============================================================================

/**
 * @typedef {Object} MfeAppConfig
 * @property {string} name - Folder name in apps/ directory
 * @property {string} framework - Framework type: 'react' | 'vue' | 'svelte' | 'solid' | 'nextjs'
 * @property {number} port - Dev server port
 * @property {string} entryFile - Entry file extension (.tsx, .ts, etc.)
 * @property {string} outputDir - Build output directory (dist, public, etc.)
 * @property {string} [dockerfile] - Custom Dockerfile path (optional)
 * @property {boolean} [disabled] - Set true to exclude from builds
 */

/** @type {MfeAppConfig[]} */
export const MFE_APPS = [
  {
    name: 'app-react',
    framework: 'react',
    port: 8001,
    entryFile: 'entry-mfe.tsx',
    outputDir: 'dist',
  },
  {
    name: 'app-nextjs',
    framework: 'nextjs',
    port: 8002,
    entryFile: 'entry-mfe.tsx',
    outputDir: 'public', // Next.js uses public for static assets
  },
  {
    name: 'app-vue',
    framework: 'vue',
    port: 8003,
    entryFile: 'entry-mfe.ts',
    outputDir: 'dist',
  },
  {
    name: 'app-svelte',
    framework: 'svelte',
    port: 8004,
    entryFile: 'entry-mfe.ts',
    outputDir: 'dist',
  },
  {
    name: 'app-solidjs',
    framework: 'solid',
    port: 8005,
    entryFile: 'entry-mfe.tsx',
    outputDir: 'dist',
  },
];

// ============================================================================
// SHELL CONFIGURATION  
// ============================================================================

export const SHELL_CONFIG = {
  name: 'shell',
  port: 8000,
  dockerfile: 'apps/shell/Dockerfile',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all enabled MFE apps
 * @returns {MfeAppConfig[]}
 */
export function getMfeApps() {
  return MFE_APPS.filter(app => !app.disabled);
}

/**
 * Get MFE app by name
 * @param {string} name - App folder name
 * @returns {MfeAppConfig | undefined}
 */
export function getMfeAppByName(name) {
  return MFE_APPS.find(app => app.name === name);
}

/**
 * Get all MFE app names
 * @returns {string[]}
 */
export function getMfeAppNames() {
  return getMfeApps().map(app => app.name);
}

/**
 * Get turbo filter arguments for all MFE apps
 * @returns {string} e.g. "--filter=app-react --filter=app-vue"
 */
export function getTurboFilters() {
  return getMfeApps()
    .map(app => `--filter=${app.name}`)
    .join(' ');
}

/**
 * Auto-detect MFE apps from apps/ directory
 * Useful for validation or discovering new apps
 * @returns {string[]} Array of app folder names that have build:mfe script
 */
export function autoDetectMfeApps() {
  const appsDir = path.join(__dirname, '..', 'apps');
  
  if (!fs.existsSync(appsDir)) {
    return [];
  }
  
  return fs.readdirSync(appsDir).filter(name => {
    if (name === 'shell') return false;
    
    const appPath = path.join(appsDir, name);
    if (!fs.statSync(appPath).isDirectory()) return false;
    
    const pkgPath = path.join(appPath, 'package.json');
    if (!fs.existsSync(pkgPath)) return false;
    
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      return pkg.scripts?.['build:mfe'] || pkg.mfe;
    } catch {
      return false;
    }
  });
}

/**
 * Validate that all configured apps exist
 * @returns {{ valid: boolean, missing: string[], extra: string[] }}
 */
export function validateMfeApps() {
  const configured = getMfeAppNames();
  const detected = autoDetectMfeApps();
  
  const missing = configured.filter(name => !detected.includes(name));
  const extra = detected.filter(name => !configured.includes(name));
  
  return {
    valid: missing.length === 0 && extra.length === 0,
    missing, // Configured but doesn't exist
    extra,   // Exists but not configured
  };
}

// ============================================================================
// CLI MODE - Run directly to see config
// ============================================================================

if (process.argv[1] === __filename) {
  console.log('\n🎯 MFE Configuration\n');
  console.log('Configured Apps:');
  getMfeApps().forEach(app => {
    console.log(`  - ${app.name} (${app.framework}) :${app.port}`);
  });
  
  console.log('\nValidation:');
  const validation = validateMfeApps();
  if (validation.valid) {
    console.log('  ✅ All configured apps exist');
  } else {
    if (validation.missing.length > 0) {
      console.log(`  ❌ Missing: ${validation.missing.join(', ')}`);
    }
    if (validation.extra.length > 0) {
      console.log(`  ⚠️  Not configured: ${validation.extra.join(', ')}`);
    }
  }
  
  console.log('\nTurbo Filters:');
  console.log(`  ${getTurboFilters()}`);
  console.log('');
}
