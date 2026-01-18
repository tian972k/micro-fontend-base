#!/usr/bin/env node

/**
 * Post-build script to generate manifest.json for MFE loading
 * This converts Vite's .vite/manifest.json to the format expected by MfeHost
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the app directory from command line args
const appDir = process.argv[2];
const outputDirName = process.argv[3] || 'dist'; // Default to 'dist', can be 'public' for Next.js

if (!appDir) {
  console.error('Usage: node generate-manifest.mjs <app-directory> [output-dir]');
  process.exit(1);
}

const distDir = path.join(appDir, outputDirName);
const viteManifestPath = path.join(distDir, '.vite', 'manifest.json');
const outputManifestPath = path.join(distDir, 'manifest.json');

try {
  // Read Vite's manifest
  if (!fs.existsSync(viteManifestPath)) {
    console.warn(`Vite manifest not found at ${viteManifestPath}, creating basic manifest`);
    
    // Look for entry-mfe.js in assets folder
    const assetsDir = path.join(distDir, 'assets');
    let entryFile = 'assets/entry-mfe.js';
    let cssFiles = [];
    
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      const jsFile = files.find(f => f.startsWith('entry-mfe') && f.endsWith('.js'));
      const cssFile = files.find(f => f.startsWith('entry-mfe') && f.endsWith('.css'));
      
      if (jsFile) {
        entryFile = `assets/${jsFile}`;
      }
      if (cssFile) {
        cssFiles.push(`assets/${cssFile}`);
      }
    }
    
    const manifest = {
      "index.html": {
        file: entryFile,
        css: cssFiles
      }
    };
    
    fs.writeFileSync(outputManifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ Generated manifest.json at ${outputManifestPath}`);
    process.exit(0);
  }
  
  const viteManifest = JSON.parse(fs.readFileSync(viteManifestPath, 'utf-8'));
  
  // Find the entry-mfe entry
  let entryKey = Object.keys(viteManifest).find(key => 
    key.includes('entry-mfe') && !key.includes('?')
  );
  
  if (!entryKey) {
    // Fallback: look for the first .tsx or .ts entry
    entryKey = Object.keys(viteManifest).find(key => 
      (key.endsWith('.tsx') || key.endsWith('.ts')) && !key.includes('?')
    );
  }
  
  if (!entryKey) {
    throw new Error('Could not find entry-mfe in Vite manifest');
  }
  
  const entry = viteManifest[entryKey];
  
  // Create the MFE manifest format
  const mfeManifest = {
    "index.html": {
      file: entry.file,
      css: entry.css || [],
      assets: entry.assets || []
    }
  };
  
  // Write the manifest
  fs.writeFileSync(outputManifestPath, JSON.stringify(mfeManifest, null, 2));
  
  console.log(`✅ Generated manifest.json for MFE loading`);
  console.log(`   Entry: ${entry.file}`);
  console.log(`   CSS: ${entry.css?.length || 0} file(s)`);
  
} catch (error) {
  console.error('❌ Error generating manifest:', error.message);
  process.exit(1);
}
