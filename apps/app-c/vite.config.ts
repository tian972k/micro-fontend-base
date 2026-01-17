import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";
import path from "path";
import { federationShared } from "../../packages/config/src";

// Main MFE Entry
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, "../../.."), "");
  const port = parseInt(env.APP_C_PORT || "8003", 10);
  const url = `http://localhost:${port}`;

  return {
    plugins: [
      vue(),
      federation({
        name: "app_c",
        filename: "remoteEntry.js",
        exposes: {
          "./Mfe": "./src/entry-mfe.ts",
        },
        shared: ["vue", ...federationShared],
      }),
      {
        name: "serve-mfe-entry-in-dev",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === "/assets/entry-mfe.js") {
              req.url = "/src/entry-mfe.ts";
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
          "entry-mfe": "./src/entry-mfe.ts",
          main: "./src/main.ts",
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
    base: url,
  };
});
