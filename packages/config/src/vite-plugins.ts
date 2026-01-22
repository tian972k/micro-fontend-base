import type { Plugin } from "vite";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";

/**
 * Health check plugin for MFE apps
 * Generates health.json with version (based on build timestamp + file hashes)
 */
export function createHealthPlugin(appId: string): Plugin {
  let buildVersion: string;

  return {
    name: "mfe-health-plugin",
    configureServer(server) {
      // Serve health.json in dev mode
      server.middlewares.use(async (req, res, next) => {
        if (
          req.url === "/health.json" ||
          req.url?.startsWith("/health.json?")
        ) {
          const health = {
            status: "available",
            version: `dev-${Date.now()}`,
            app: appId,
            environment: "development",
          };
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.end(JSON.stringify(health));
          return;
        }
        next();
      });
    },
    buildStart() {
      // Generate version hash based on timestamp
      buildVersion = createHash("md5")
        .update(Date.now().toString())
        .digest("hex")
        .substring(0, 8);
    },
    writeBundle(options) {
      // Write health.json to output directory
      const outDir = options.dir || "dist";
      const healthPath = path.resolve(process.cwd(), outDir, "health.json");
      const health = {
        status: "available",
        version: buildVersion,
        app: appId,
        environment: "production",
        buildTime: new Date().toISOString(),
      };
      fs.writeFileSync(healthPath, JSON.stringify(health, null, 2));
    },
  };
}

/**
 * Virtual manifest plugin for dev mode
 * Serves a JSON manifest pointing to src/entry-mfe file
 */
export function createVirtualManifestPlugin(entryFile: string): Plugin {
  return {
    name: "serve-dev-manifest",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Serve virtual manifest.json in dev mode
        if (
          req.url === "/manifest.json" ||
          req.url?.startsWith("/manifest.json?")
        ) {
          const manifest = {
            "index.html": {
              file: entryFile,
              css: [],
              isDev: true,
            },
          };
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.end(JSON.stringify(manifest));
          return;
        }
        next();
      });
    },
  };
}

/**
 * Dev entry redirect plugin
 * Redirects /assets/entry-mfe.js to source file in dev mode
 */
export function createDevEntryRedirectPlugin(sourceEntry: string): Plugin {
  return {
    name: "serve-mfe-entry-in-dev",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === "/assets/entry-mfe.js") {
          req.url = sourceEntry;
        }
        next();
      });
    },
  };
}

/**
 * Common Vite build options for MFE apps
 */
export const commonMfeBuildOptions = {
  modulePreload: false,
  target: "esnext" as const,
  manifest: true,
  minify: false,
  cssCodeSplit: false,
};

/**
 * Common rollup output config for MFE apps
 */
export const commonMfeRollupOutput = {
  entryFileNames: "assets/[name].js",
  chunkFileNames: "assets/[name].js",
  assetFileNames: "assets/[name].[ext]",
};

/**
 * Common onwarn handler for suppressing framework-specific warnings
 */
export function createCommonOnWarn() {
  return (warning: any, warn: any) => {
    // Suppress "use client" directive warnings from Radix UI
    if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
    warn(warning);
  };
}
