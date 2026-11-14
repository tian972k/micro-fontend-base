import react from "@vitejs/plugin-react";
import { createMfeConfig, reactShared, APP_IDS } from "@repo/config/vite";

export default createMfeConfig({
  appId: APP_IDS.REACT,
  frameworkPlugin: react(),
  federationShared: reactShared,
  entryFile: "./src/entry-mfe.tsx",
  mainFile: "./src/main.tsx",
  customBaseUrl: (isDev, _isMfeMode, url) => {
    if (isDev) return url;
    // Relative base: MF resolves assets next to remoteEntry.js, so the
    // same build works from its own domain or behind the shell proxy.
    return process.env.PUBLIC_BASE_PATH || "./";
  },
});
