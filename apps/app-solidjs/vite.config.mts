import solid from "vite-plugin-solid";
import { createMfeConfig, solidShared, APP_IDS } from "@repo/config/vite";
import { resolve } from "path";

const appRoot = resolve(__dirname, "src");
// Solid components from the design system are compiled with this app's
// Solid JSX transform (the rest of packages/ is React or framework-free).
const uiSolidRoot = resolve(__dirname, "../../packages/ui/src/components/solid");

export default createMfeConfig({
  appId: APP_IDS.SOLIDJS,
  // Only transform this app's JSX and the design system's Solid components
  frameworkPlugin: solid({
    include: [
      `${appRoot}/**/*.tsx`,
      `${appRoot}/**/*.jsx`,
      `${uiSolidRoot}/**/*.tsx`,
    ],
    exclude: ["**/node_modules/**"],
  }),
  federationShared: solidShared,
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
});
