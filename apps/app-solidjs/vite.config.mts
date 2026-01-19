import solid from "vite-plugin-solid";
import { createMfeConfig, nonReactShared, APP_IDS } from "@repo/config/vite";

export default createMfeConfig({
  appId: APP_IDS.SOLIDJS,
  frameworkPlugin: solid(),
  federationShared: nonReactShared,
  entryFile: "./src/entry-mfe.tsx",
  mainFile: "./src/main.tsx",
  additionalExternals: [
    /^@radix-ui\/.*/,
    "react",
    "react-dom",
    /^react\/.*/,
    "solid-js",
    /^solid-js\/.*/,
    "vue",
    /^vue\/.*/,
    "svelte",
    /^svelte\/.*/,
  ],
});
