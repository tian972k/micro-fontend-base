import { defineConfig, loadEnv } from "vite";
import solid from "vite-plugin-solid";
import federation from "@originjs/vite-plugin-federation";
import path from "path";

import { nonReactShared, PORTS, APP_IDS } from "../../packages/config/src";

// Main MFE Entry
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ mode }) => {
  const port = PORTS[APP_IDS.SOLIDJS];
  const url = `http://localhost:${port}`;

  return {
    plugins: [
      solid(),
      federation({
        name: "app_solidjs",
        filename: "remoteEntry.js",
        exposes: {
          "./Mfe": "./src/entry-mfe.tsx",
        },
        shared: nonReactShared,
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
      cssCodeSplit: false,
      rollupOptions: {
        input: {
          "entry-mfe": "./src/entry-mfe.tsx",
          main: "./src/main.tsx",
        },
        output: {
          entryFileNames: "assets/[name].js",
          chunkFileNames: "assets/[name].js",
          assetFileNames: "assets/[name].[ext]",
        },
        external: [
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
    base: url,
  };
});
