import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { createMfeConfig, svelteShared, APP_IDS } from "@repo/config/vite";

const sveltePlugin = svelte({
  preprocess: vitePreprocess(),
  onwarn: (warning, handler) => {
    // Suppress unused export warnings for MFE props
    if (warning.code === 'unused-export-let') return;
    handler?.(warning);
  },
});

export default createMfeConfig({
  appId: APP_IDS.SVELTE,
  frameworkPlugin: sveltePlugin,
  federationShared: svelteShared,
  entryFile: "./src/entry-mfe.ts",
  mainFile: "./src/main.ts",
  additionalInputs: { index: "./index.html" },
  viteConfigOverride: {
    resolve: {
      conditions: ['import', 'module', 'browser', 'default'],
    },
  },
});
