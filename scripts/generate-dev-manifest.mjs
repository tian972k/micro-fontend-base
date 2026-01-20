/**
 * Generate development manifest.json for MFE apps
 * This creates a manifest that points to the dev server entry file
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { getMfeApps } from './mfe.config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mfeApps = getMfeApps();

mfeApps.forEach(appConfig => {
  const { name: appName, entryFile, outputDir } = appConfig;
  const publicDir = path.join(__dirname, '..', 'apps', appName, 'public');
  const distDir = path.join(__dirname, '..', 'apps', appName, outputDir);
  
  // Create public directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Determine entry file path based on app config
  let entryFilePath;
  let cssFiles = [];
  let targetDir = outputDir === 'public' ? publicDir : distDir;
  
  if (appConfig.framework === 'nextjs') {
    // Next.js: Check if MFE build exists in public/assets
    const assetsDir = path.join(publicDir, 'assets');
    if (!fs.existsSync(assetsDir)) {
      console.log(`⚠️  ${appName}: MFE build not found. Run 'cd apps/${appName} && pnpm build:mfe' first`);
      entryFilePath = `assets/${entryFile.replace('.tsx', '.js').replace('.ts', '.js')}`;
    } else {
      const files = fs.readdirSync(assetsDir);
      const jsFile = files.find(f => f.startsWith('entry-mfe') && f.endsWith('.js'));
      const cssFile = files.find(f => f.startsWith('entry-mfe') && f.endsWith('.css'));
      
      entryFilePath = jsFile ? `assets/${jsFile}` : `assets/entry-mfe.js`;
      if (cssFile) cssFiles.push(`assets/${cssFile}`);
    }
  } else {
    // Vite apps: Check if dist/assets build exists, otherwise use src
    const assetsDir = path.join(distDir, 'assets');
    const useBuiltVersion = fs.existsSync(assetsDir);
    
    if (useBuiltVersion) {
      // Use built version from dist/assets
      const files = fs.readdirSync(assetsDir);
      const jsFile = files.find(f => f.startsWith('entry-mfe') && f.endsWith('.js'));
      const cssFile = files.find(f => f.startsWith('entry-mfe') && f.endsWith('.css'));
      
      entryFilePath = jsFile ? `assets/${jsFile}` : 'assets/entry-mfe.js';
      if (cssFile) cssFiles.push(`assets/${cssFile}`);
      targetDir = distDir;
    } else {
      // Use src version for dev (Vite serves src files directly)
      entryFilePath = `src/${entryFile}`;
      console.log(`ℹ️  ${appName}: Using src version. For production-like dev, run 'cd apps/${appName} && pnpm build:mfe'`);
    }
  }
  
  // Create dev manifest
  const manifest = {
    "index.html": {
      "file": entryFilePath,
      "css": cssFiles,
      "isDev": true
    }
  };
  
  const manifestPath = path.join(targetDir, 'manifest.json');
  
  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`✅ Created dev manifest for ${appName} -> ${entryFilePath}`);
});

console.log('\n✅ All dev manifests created successfully!');
