import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import federation from "@originjs/vite-plugin-federation";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import { routeExtensions } from "remix-custom-routes";

export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, path.resolve(__dirname, "../.."), "");
  const port = parseInt(env.SHELL_PORT || "8000", 10);

  return {
    plugins: [
      remix({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_lazyRouteDiscovery: true,
          v3_singleFetch: true,
        },
        ignoredRouteFiles: ["routes/**/*"],
        async routes() {
          const appDirectory = path.join(process.cwd(), "app");
          return routeExtensions(appDirectory);
        },
      }),
      !isSsrBuild &&
        federation({
          name: "shell",
          remotes: {
            app_a: "http://localhost:8001/assets/remoteEntry.js",
            app_b: "http://localhost:8002/assets/remoteEntry.js",
            app_c: "http://localhost:8003/assets/remoteEntry.js",
            app_d: "http://localhost:8004/assets/remoteEntry.js",
          },
          shared: ["react", "react-dom", "@repo/core", "@repo/ui"],
        }),
      tsconfigPaths(),
    ],
    server: {
      port: port,
    },
    build: {
      target: isSsrBuild ? "modules" : "esnext",
    },
  };
});
