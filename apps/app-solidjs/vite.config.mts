import solid from "vite-plugin-solid";
import { createMfeConfig, nonReactShared, APP_IDS } from "@repo/config/vite";
import { resolve } from "path";

const appRoot = resolve(__dirname, "src");

export default createMfeConfig({
  appId: APP_IDS.SOLIDJS,
  // Only transform .tsx files in this app's src folder
  frameworkPlugin: solid({
    include: [`${appRoot}/**/*.tsx`, `${appRoot}/**/*.jsx`],
    exclude: ["**/node_modules/**", "**/packages/**"],
  }),
  federationShared: nonReactShared,
  entryFile: "./src/entry-mfe.tsx",
  mainFile: "./src/main.tsx",
  // Only externalize frameworks NOT used by this app
  // solid-js MUST be bundled since it's not provided by Shell
  additionalExternals: [
    /^@radix-ui\/.*/,
    "react",
    "react-dom",
    /^react\/.*/,
    "vue",
    /^vue\/.*/,
    "svelte",
    /^svelte\/.*/,
  ],
  customBaseUrl: (isDev, _isMfeMode, url) => {
    if (isDev) return url;
    return process.env.VERCEL === "1" ? "/" : "/solidjs/";
  },
});
