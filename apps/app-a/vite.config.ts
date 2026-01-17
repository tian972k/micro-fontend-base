import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import path from "path";

import { federationShared } from "../../packages/config/src";

// Main MFE Entry
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, "../../.."), "");
  const port = parseInt(env.APP_A_PORT || "8001", 10);
  const url = `http://localhost:${port}`;

  return {
    plugins: [
      react(),
      federation({
        name: "app_a",
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
      },
    },
    server: {
      port: port,
      cors: true,
      origin: url,
    },
    base: url, // Ensures assets are loaded from MFE server, not Shell
  };
});
