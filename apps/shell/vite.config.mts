import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import * as fs from "fs";
import { getRouteManifest } from "remix-custom-routes";
import { vercelPreset } from '@vercel/remix/vite';
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, path.resolve(__dirname, "../.."), "");
  const port = parseInt(env.SHELL_PORT || "8000", 10);
  const isAnalyze = process.env.ANALYZE === "true";

  return {
    plugins: [
      remix({
        ...(process.env.VERCEL ? { presets: [vercelPreset()] } : {}),
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
                const name = path.basename(rel, ext);
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
                  if (isRoot) id = "root";
                  if (isRoot) return;
                } else if (
                  name === "route" &&
                  (ext === ".ts" || ext === ".tsx")
                ) {
                } else {
                  return;
                }

                if (id === "") return;
                files.push([id, path.join("routes", rel)]);
              }
            });
          };

          walk(routesDirectory, routesDirectory);
          files.sort(([a], [b]) => b.length - a.length);
          // @ts-ignore
          return getRouteManifest(files);
        },
      }),
      // MFEs are loaded at runtime with @module-federation/runtime (see
      // app/lib/federation.ts), so the shell needs no federation build plugin.
      tsconfigPaths(),
      isAnalyze && visualizer({ open: true, filename: "stats.html" }),
    ],
    server: {
      port: port,
      strictPort: true, // Don't auto-switch port if already in use
    },
    build: {
      target: isSsrBuild ? "modules" : "esnext",
      sourcemap: mode === "development",
    },
    ssr: {
      noExternal: ["isbot"],
    },
  };
});
