import { toFederationName } from "@repo/config";

/**
 * Loads micro-frontends at runtime with Module Federation 2.0.
 *
 * - The same path is used in dev and production: each remote (dev server
 *   or build) serves mf-manifest.json + remoteEntry.js.
 * - The shell provides React/ReactDOM as shared singletons, so React MFEs
 *   reuse the shell's React instead of shipping and running their own.
 * - The expose's CSS listed in mf-manifest.json is injected alongside the
 *   module, so MFE styles load with the MFE (and only when needed).
 *
 * Browser-only: everything is imported lazily so SSR never touches it.
 */

type FederationInstance = Awaited<ReturnType<typeof createFederation>>;

interface MfManifest {
  exposes?: { path: string; assets?: { css?: { sync?: string[] } } }[];
}

let federation: Promise<FederationInstance> | null = null;

async function createFederation() {
  const [
    { createInstance },
    React,
    ReactDOM,
    ReactDOMClient,
    JsxRuntime,
    JsxDevRuntime,
  ] = await Promise.all([
    import("@module-federation/runtime"),
    import("react"),
    import("react-dom"),
    import("react-dom/client"),
    import("react/jsx-runtime"),
    // Dev builds of React remotes compile JSX against jsx-dev-runtime.
    import("react/jsx-dev-runtime"),
  ]);

  const provide = (version: string, lib: unknown) => ({
    version,
    lib: () => lib,
    shareConfig: { singleton: true, requiredVersion: false as const },
  });

  return createInstance({
    name: "shell",
    remotes: [],
    shared: {
      react: provide(React.version, React),
      "react-dom": provide(React.version, ReactDOM),
      "react-dom/client": provide(React.version, ReactDOMClient),
      "react/jsx-runtime": provide(React.version, JsxRuntime),
      "react/jsx-dev-runtime": provide(React.version, JsxDevRuntime),
    },
  });
}

function getFederation() {
  federation ??= createFederation();
  return federation;
}

function injectStylesheet(href: string) {
  const exists = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
  ).some((link) => link.href === href);
  if (exists) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

/** Fetches the remote's manifest and injects the expose's stylesheets. */
async function loadExposeStyles(manifestUrl: string, expose: string) {
  try {
    const res = await fetch(manifestUrl);
    if (!res.ok) return;
    const manifest = (await res.json()) as MfManifest;
    const entry = manifest.exposes?.find(
      (e) => e.path === expose || e.path === `./${expose}`,
    );
    const base = new URL(".", new URL(manifestUrl, window.location.href));
    for (const css of entry?.assets?.css?.sync ?? []) {
      injectStylesheet(new URL(css, base).href);
    }
  } catch {
    // Styles are best-effort; a missing stylesheet must not block mounting.
  }
}

/**
 * Loads `<appId>`'s "./Mfe" expose from `host`. Importing the module runs
 * its entry, which registers the app with AppRegistry (MfeHost then mounts
 * it). Resolves with the module's exports.
 */
export async function loadMfeRemote(appId: string, host: string) {
  const name = toFederationName(appId);
  const base = host.replace(/\/+$/, "");
  const manifestUrl = `${base}/mf-manifest.json`;

  const instance = await getFederation();
  instance.registerRemotes([{ name, entry: manifestUrl }]);

  const [mod] = await Promise.all([
    instance.loadRemote(`${name}/Mfe`),
    loadExposeStyles(manifestUrl, "Mfe"),
  ]);
  if (!mod) {
    throw new Error(`Remote "${name}/Mfe" resolved to nothing`);
  }
  return mod;
}
