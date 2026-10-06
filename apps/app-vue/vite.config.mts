import vue from "@vitejs/plugin-vue";
import { createMfeConfig, vueShared, APP_IDS } from "@repo/config/vite";

export default createMfeConfig({
  appId: APP_IDS.VUE,
  frameworkPlugin: vue(),
  federationShared: vueShared,
  entryFile: "./src/entry-mfe.ts",
  mainFile: "./src/main.ts",
  additionalInputs: { index: "./index.html" },
  viteConfigOverride: {
    resolve: {
      conditions: ['import', 'module', 'browser', 'default'],
    },
  },
});
