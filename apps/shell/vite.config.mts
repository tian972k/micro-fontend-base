import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import federation from "@originjs/vite-plugin-federation";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import * as fs from "fs";
import { getRouteManifest } from "remix-custom-routes";

import { federationShared } from "../../packages/config/src";

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
          const routesDirectory = path.join(appDirectory, "routes");

          // Custom Next.js Style Router Discovery
          // Scans apps/shell/app/routes for page.tsx, layout.tsx, route.ts
          const files: [string, string][] = [];

          const walk = (dir: string, base: string) => {
            if (!fs.existsSync(dir)) return;
            const list = fs.readdirSync(dir);
            list.forEach((file) => {
              const fullPath = path.join(dir, file);
              const stat = fs.statSync(fullPath);
              if (stat.isDirectory()) {
                walk(fullPath, base);
              } else {
                const rel = path.relative(base, fullPath);
                const ext = path.extname(rel);
                const name = path.basename(rel, ext); // page, layout, route
                const dirs = path
                  .dirname(rel)
                  .split(path.sep)
                  .filter((d) => d !== ".");

                let id = dirs.join(".");
                const isRoot = dirs.length === 0;

                if (
                  (name === "page" || name === "index") &&
                  (ext === ".tsx" || ext === ".jsx")
                ) {
                  id = isRoot ? "_index" : `${id}._index`;
                } else if (
                  name === "layout" &&
                  (ext === ".tsx" || ext === ".jsx")
                ) {
                  // id is just the segments. e.g. "dashboard"
                  if (isRoot) id = "root"; // Optional: root layout? Remix handles root.tsx separately usually.
                  // If root components/layout.tsx exists, we might map it. But usually root.tsx is in app/.
                  // We assume this walker is for routes folder.
                  if (isRoot) return;
                } else if (
                  name === "route" &&
                  (ext === ".ts" || ext === ".tsx")
                ) {
                  // Resource route: "logout/route.ts" -> "logout"
                } else {
                  return; // Ignore other files
                }

                if (id === "") return;
                // Prevent duplicate ID if page.tsx and layout.tsx exist (handled by getRouteManifest logic but we need unique list for input if possible,
                // actually getRouteManifest takes [id, file], so duplicate IDs are allowed input but handled as conflicts?
                // NO, core.js getRouteManifest iterates sortedRouteIds.
                // If ID exists twice, it overwrites?
                // Wait, routeManifest[id] = ...
                // Yes, overwrite.
                // BUT we need BOTH layout and page to exist in manifest!
                // Remix Layout Route ID: "dashboard"
                // Remix Index Route ID: "dashboard._index"
                // My logic above gives different IDs: "dashboard" vs "dashboard._index". So no conflict!

                // Use path relative to app directory, not absolute path
                files.push([id, path.join("routes", rel)]);
              }
            });
          };

          walk(routesDirectory, routesDirectory);

          // Sort by ID length descending for proper nesting
          files.sort(([a], [b]) => b.length - a.length);

          // @ts-ignore - Definition is string[] but implementation and usage requires [string, string][]
          return getRouteManifest(files);
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
          shared: federationShared,
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
