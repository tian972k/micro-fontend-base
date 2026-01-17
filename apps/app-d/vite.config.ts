import { defineConfig, loadEnv } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import federation from "@originjs/vite-plugin-federation";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, "../../.."), "");
  const port = parseInt(env.APP_D_PORT || "8004", 10);
  const url = `http://localhost:${port}`;

  return {
    plugins: [
      svelte(),
      federation({
        name: "app_d",
        filename: "remoteEntry.js",
        exposes: {
          "./Mfe": "./src/entry-mfe.ts",
        },
        shared: ["svelte", "@repo/core", "@repo/ui"],
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
