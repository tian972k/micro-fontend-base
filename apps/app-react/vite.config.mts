import react from "@vitejs/plugin-react";
import { createMfeConfig, reactShared, APP_IDS } from "@repo/config/vite";

export default createMfeConfig({
  appId: APP_IDS.REACT,
  frameworkPlugin: react(),
  federationShared: reactShared,
  entryFile: "./src/entry-mfe.tsx",
  mainFile: "./src/main.tsx",
});
