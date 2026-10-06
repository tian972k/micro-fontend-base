import { defineConfig, type UserConfig, mergeConfig } from "vite";
import type { Plugin } from "vite";
import { federation } from "@module-federation/vite";
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
import { toFederationName } from "./constants/apps";

export interface MfeConfigOptions {
  /** App ID from APP_IDS */
  appId: string;
  /** Vite plugin for framework (react, vue, solid, svelte) */
  frameworkPlugin: Plugin | Plugin[];
  /**
   * Framework singletons shared with the host and other remotes (e.g.
   * ["react", "react-dom"]). Only list packages that must be a single
   * instance per page; everything else is bundled per MFE.
   */
  federationShared: readonly string[];
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
      // Dev: absolute dev-server URL (HMR, served cross-origin to the shell).
      // Build: relative, so Module Federation resolves assets next to
      // remoteEntry.js ("auto" publicPath) whether the MFE is served from
      // its own domain, a CDN path or behind the shell's /api/proxy/<slug>/.
      baseUrl = isDev ? url : "./";
    }

    const plugins: Plugin[] = [
      ...(Array.isArray(frameworkPlugin) ? frameworkPlugin : [frameworkPlugin]),
      // Module Federation 2.0: emits remoteEntry.js plus mf-manifest.json
      // (exposes, shared deps and their JS/CSS assets) for the runtime.
      // The plugin returns several Vite plugins.
      ...(federation({
        name: toFederationName(appId),
        filename: "remoteEntry.js",
        manifest: true,
        dts: false,
        exposes: {
          "./Mfe": entryFile,
        },
        shared: Object.fromEntries(
          federationShared.map((lib) => [
            lib,
            { singleton: true, requiredVersion: false as const },
          ]),
        ),
      }) as Plugin[]),
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
