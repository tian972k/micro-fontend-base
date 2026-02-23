import { defineConfig, type UserConfig, mergeConfig } from "vite";
import type { Plugin } from "vite";
import federation from "@originjs/vite-plugin-federation";
import path from "path";
import {
  createVirtualManifestPlugin,
  createDevEntryRedirectPlugin,
  createHealthPlugin,
  commonMfeBuildOptions,
  commonMfeRollupOutput,
  createCommonOnWarn,
} from "./vite-plugins";
import { PORTS } from "./env/ports";

export interface MfeConfigOptions {
  /** App ID from APP_IDS */
  appId: string;
  /** Vite plugin for framework (react, vue, solid, svelte) */
  frameworkPlugin: Plugin | Plugin[];
  /** Federation shared dependencies */
  federationShared: string[];
  /** Entry file path (e.g., "./src/entry-mfe.tsx") */
  entryFile: string;
  /** Main file path for standalone mode (e.g., "./src/main.tsx") */
  mainFile: string;
  /** HTML file path for standalone mode (e.g., "./index.html") */
  htmlFile?: string;
  /** Additional rollup input entries */
  additionalInputs?: Record<string, string>;
  /** Additional rollup externals (for SolidJS, etc.) */
  additionalExternals?: (string | RegExp)[];
  /** Custom base URL logic */
  customBaseUrl?: (isDev: boolean, isMfeMode: boolean, url: string) => string;
  /** Skip dev entry redirect plugin */
  skipDevEntryRedirect?: boolean;
  /** Custom build output directory (default: dist) */
  outDir?: string;
  /** Custom publicDir setting */
  publicDir?: false | string;
  /** Empty outDir before build */
  emptyOutDir?: boolean;
  /** Custom define values */
  define?: Record<string, any>;
  /** Override or extend Vite config */
  viteConfigOverride?: UserConfig;
  /** Skip HTML file in rollup input (for Next.js) */
  skipHtmlInput?: boolean;
}

/**
 * Factory function to create standardized Vite config for MFE apps
 * Eliminates code duplication across all app vite configs
 */
export function createMfeConfig(options: MfeConfigOptions) {
  const {
    appId,
    frameworkPlugin,
    federationShared,
    entryFile,
    mainFile: _mainFile,
    htmlFile = "./index.html",
    additionalInputs = {},
    additionalExternals = [],
    customBaseUrl,
    skipDevEntryRedirect = false,
    outDir = "dist",
    publicDir,
    emptyOutDir = true,
    define,
    viteConfigOverride = {},
    skipHtmlInput = false,
  } = options;

  return defineConfig(({ mode }) => {
    const port = (PORTS as any)[appId];
    const url = `http://localhost:${port}`;
    const isDev = mode === "development";
    const isMfeMode = process.env.MFE_MODE === "true";

    // Determine base URL
    let baseUrl: string;
    if (customBaseUrl) {
      baseUrl = customBaseUrl(isDev, isMfeMode, url);
    } else {
      baseUrl = url;
    }

    const plugins: Plugin[] = [
      ...(Array.isArray(frameworkPlugin) ? frameworkPlugin : [frameworkPlugin]),
      federation({
        name: appId.replace(/-/g, "_"),
        filename: "remoteEntry.js",
        exposes: {
          "./Mfe": entryFile,
        },
        // Share libs with proper singletons to avoid conflicts
        shared: federationShared.reduce(
          (acc, lib) => {
            acc[lib] = {
              singleton: true,
              requiredVersion: false,
              strictVersion: false,
              eager: lib === "@repo/utils" || lib === "dayjs", // Load these eagerly
            };
            return acc;
          },
          {} as Record<string, any>,
        ),
      }),
      createVirtualManifestPlugin(entryFile),
      createHealthPlugin(appId),
    ];

    // Add dev entry redirect plugin if not skipped
    if (!skipDevEntryRedirect) {
      plugins.push(createDevEntryRedirectPlugin(entryFile));
    }

    const config: UserConfig = {
      plugins,
      resolve: {
        alias: {
          "@": path.resolve(process.cwd(), "./src"),
          "@repo/core": path.resolve(process.cwd(), "../../packages/core/src"),
          "@repo/config": path.resolve(
            process.cwd(),
            "../../packages/config/src",
          ),
        },
      },
      build: {
        ...commonMfeBuildOptions,
        outDir,
        emptyOutDir,
        rollupOptions: {
          input: skipHtmlInput
            ? { ...additionalInputs }
            : {
                index: htmlFile, // HTML for standalone mode
                ...additionalInputs,
              },
          output: commonMfeRollupOutput,
          external: [
            ...(additionalExternals || []),
            // Exclude native binaries that shouldn't be bundled
            /\.node$/,
            "fsevents",
          ],
          onwarn: createCommonOnWarn(),
        },
      },
      optimizeDeps: {
        exclude: ["fsevents"],
      },
      server: {
        port,
        strictPort: true, // Don't auto-switch port if already in use
        cors: true,
        origin: url,
      },
      preview: {
        port,
        strictPort: true, // Don't auto-switch port if already in use
        cors: true,
      },
      base: baseUrl,
    };

    // Add optional properties conditionally
    if (define) {
      config.define = define;
    }
    if (publicDir !== undefined) {
      config.publicDir = publicDir;
    }

    // Merge with viteConfigOverride
    // Merge with viteConfigOverride
    return mergeConfig(config, viteConfigOverride);
  });
}
