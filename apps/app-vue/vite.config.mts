import vue from "@vitejs/plugin-vue";
import { createMfeConfig, nonReactShared, APP_IDS } from "@repo/config/vite";

export default createMfeConfig({
  appId: APP_IDS.VUE,
  frameworkPlugin: vue(),
  federationShared: ["vue", ...nonReactShared],
  entryFile: "./src/entry-mfe.ts",
  mainFile: "./src/main.ts",
  additionalInputs: { index: "./index.html" },
  customBaseUrl: (isDev, isMfeMode, url) => (isDev || !isMfeMode) ? '/' : url,
  viteConfigOverride: {
    resolve: {
      conditions: ['import', 'module', 'browser', 'default'],
    },
  },
});
