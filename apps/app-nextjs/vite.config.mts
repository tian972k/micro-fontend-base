import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import path from "path";
import { federationShared, PORTS, APP_IDS } from "../../packages/config/src";

// This Vite config is SPECIFICALLY for building the MFE bundle
// It ignores Next.js routing and bundles a specific entry point
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ mode }) => {
  const port = PORTS[APP_IDS.NEXTJS];
  const url = `http://localhost:${port}`;

  return {
    plugins: [
      react(),
      federation({
        name: "app_nextjs",
        filename: "remoteEntry.js",
        exposes: {
          "./Mfe": "./src/entry-mfe.tsx",
        },
        shared: federationShared,
      }),
    ],
    define: {
      "process.env": {}, // Polyfill process.env for Next.js compat
    },
    publicDir: false, // Disable publicDir to avoid conflict with outDir
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@repo/core": path.resolve(__dirname, "../../packages/core/src"),
        "@repo/config": path.resolve(__dirname, "../../packages/config/src"),
      },
    },
    build: {
      modulePreload: false,
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
      outDir: "public", // Output to public for Next.js to serve
      emptyOutDir: false, // Don't delete other public assets
      rollupOptions: {
        input: {
          "entry-mfe": "./src/entry-mfe.tsx",
        },
        output: {
          entryFileNames: "assets/[name].js",
          chunkFileNames: "assets/[name].js",
          assetFileNames: "assets/[name].[ext]",
        },
      },
    },
    base: url,
  };
});
