/**
 * Generate development manifest.json for MFE apps
 * This creates a manifest that points to the dev server entry file
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apps = ['app-react', 'app-vue', 'app-svelte', 'app-solidjs', 'app-nextjs'];

apps.forEach(appName => {
  const publicDir = path.join(__dirname, '..', 'apps', appName, 'public');
  const distDir = path.join(__dirname, '..', 'apps', appName, 'dist');
  
  // Create public directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Determine entry file path based on app
  let entryFile;
  let cssFiles = [];
  let outputDir = publicDir; // Where to write manifest
  
  if (appName === 'app-nextjs') {
    // Next.js: Check if MFE build exists in public/assets
    const assetsDir = path.join(publicDir, 'assets');
    if (!fs.existsSync(assetsDir)) {
      console.log(`⚠️  ${appName}: MFE build not found. Run 'cd apps/app-nextjs && pnpm build:mfe' first`);
      entryFile = 'assets/entry-mfe.js'; // Fallback path
    } else {
      const files = fs.readdirSync(assetsDir);
      const jsFile = files.find(f => f.startsWith('entry-mfe') && f.endsWith('.js'));
      const cssFile = files.find(f => f.startsWith('entry-mfe') && f.endsWith('.css'));
      
      entryFile = jsFile ? `assets/${jsFile}` : 'assets/entry-mfe.js';
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
      
      entryFile = jsFile ? `assets/${jsFile}` : 'assets/entry-mfe.js';
      if (cssFile) cssFiles.push(`assets/${cssFile}`);
      
      // For built version, copy manifest to dist folder too
      outputDir = distDir;
    } else {
      // Use src version for dev (Vite serves src files directly)
      const ext = appName === 'app-vue' || appName === 'app-svelte' ? '.ts' : '.tsx';
      entryFile = `src/entry-mfe${ext}`;
      console.log(`ℹ️  ${appName}: Using src version. For production-like dev, run 'cd apps/${appName} && pnpm build:mfe'`);
    }
  }
  
  // Create dev manifest
  const manifest = {
    "index.html": {
      "file": entryFile,
      "css": cssFiles,
      "isDev": true
    }
  };
  
  const manifestPath = path.join(outputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`✅ Created dev manifest for ${appName} -> ${entryFile}`);
});

console.log('\n✅ All dev manifests created successfully!');
