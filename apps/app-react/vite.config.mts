import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import path from "path";

import { federationShared, PORTS, APP_IDS } from "../../packages/config/src";

// Main MFE Entry
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ mode }) => {
  const port = PORTS[APP_IDS.REACT];
  const url = `http://localhost:${port}`;

  return {
    plugins: [
      react(),
      federation({
        name: "app_react",
        filename: "remoteEntry.js",
        exposes: {
          "./Mfe": "./src/entry-mfe.tsx",
        },
        shared: federationShared,
      }),
      {
        name: "serve-mfe-entry-in-dev",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === "/assets/entry-mfe.js") {
              req.url = "/src/entry-mfe.tsx";
            }
            next();
          });
        },
      },
    ],
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
      manifest: true,
      minify: false,
      cssCodeSplit: false, // Injects CSS into JS for simple MFE loading
      rollupOptions: {
        input: {
          "entry-mfe": "./src/entry-mfe.tsx", // The micro-app entry
          main: "./src/main.tsx", // Local dev entry
        },
        output: {
          entryFileNames: "assets/[name].js",
          chunkFileNames: "assets/[name].js",
          assetFileNames: "assets/[name].[ext]",
        },
        onwarn(warning, warn) {
          // Suppress "use client" directive warnings from Radix UI
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        },
      },
    },
    server: {
      port: port,
      cors: true,
      origin: url,
    },
    preview: {
      port: port,
      cors: true,
    },
    base: url, // Ensures assets are loaded from MFE server, not Shell
  };
});
