import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";
import path from "path";import { promises as fs } from "fs";import { nonReactShared, PORTS, APP_IDS } from "../../packages/config/src";

// Main MFE Entry
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ mode }) => {
  const port = PORTS[APP_IDS.VUE];
  const url = `http://localhost:${port}`;

  return {
    plugins: [
      vue(),
      federation({
        name: "app_vue",
        filename: "remoteEntry.js",
        exposes: {
          "./Mfe": "./src/entry-mfe.ts",
        },
        shared: ["vue", ...nonReactShared],
      }),
      {
        name: "serve-mfe-entry-in-dev",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === "/assets/entry-mfe.js") {
              try {
                const filePath = path.resolve(__dirname, "dist/assets/entry-mfe.js");
                const content = await fs.readFile(filePath, "utf-8");
                res.setHeader("Content-Type", "application/javascript");
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.end(content);
                return;
              } catch (error) {
                console.error("Failed to serve entry-mfe.js:", error);
              }
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
      cssCodeSplit: false,
      rollupOptions: {
        input: {
          "entry-mfe": "./src/entry-mfe.ts",
          main: "./src/main.ts",
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
    base: url,
  };
});
