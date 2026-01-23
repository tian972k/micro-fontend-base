import react from "@vitejs/plugin-react";
import { createMfeConfig, reactShared, APP_IDS } from "@repo/config/vite";

import viteCompression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";

export default createMfeConfig({
  appId: APP_IDS.REACT,
  frameworkPlugin: react(),
  federationShared: reactShared,
  entryFile: "./src/entry-mfe.tsx",
  mainFile: "./src/main.tsx",
  customBaseUrl: (isDev, _isMfeMode, url) => {
    if (isDev) return url;
    // VERCEL=1 means standalone deploy, use root path
    // Otherwise use /react/ for MFE mode in shell
    return process.env.VERCEL === "1" ? "/" : process.env.PUBLIC_BASE_PATH || "/react/";
  },
  viteConfigOverride: {
    plugins: [
        viteCompression({
            algorithm: "gzip",
            ext: ".gz",
        }),
        viteCompression({
            algorithm: "brotliCompress",
            ext: ".br",
        }),
        visualizer({
            open: false,
            gzipSize: true,
            brotliSize: true,
            filename: "stats.html",
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    "react-vendor": ["react", "react-dom", "react-i18next"],
                    utils: ["lodash", "dayjs"],
                    ui: ["@repo/ui"],
                },
            },
        },
    },
  },
});
