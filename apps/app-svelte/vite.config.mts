import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { createMfeConfig, nonReactShared, APP_IDS } from "@repo/config/vite";

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
  federationShared: ["svelte", ...nonReactShared],
  entryFile: "./src/entry-mfe.ts",
  mainFile: "./src/main.ts",
  additionalInputs: { index: "./index.html" },
  customBaseUrl: (isDev, _isMfeMode, url) => {
    if (isDev) return url;
    return process.env.VERCEL === "1" ? "/" : "/svelte/";
  },
  viteConfigOverride: {
    resolve: {
      conditions: ['import', 'module', 'browser', 'default'],
    },
  },
});
