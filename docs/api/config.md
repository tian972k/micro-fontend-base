# API Reference: `@repo/config`

Two entry points:

- `@repo/config`: **runtime-safe** (registry, ports, keys, shared lists).
  Safe to import in browser code.
- `@repo/config/vite`: **build-time only** (Vite factory and plugins).
  Import it only from `vite.config.*`.

Also: `@repo/config/tailwind.config`, `tsconfig.base.json` and
`eslint-preset.cjs`.

## Registry

```ts
MFE_APPS: readonly MfeApp[]       // single source of truth, see architecture.md
HOST_APP                          // { id: "shell", port: 8000, ... }
APP_IDS                           // { SHELL, REACT, NEXTJS, VUE, SVELTE, SOLIDJS }
type MfeApp, MfeAppId, AppId, Framework
getMfeApp(id) / isMfeApp(id) / getAllMfeIds()
toFederationName("app-react")     // "app_react"
PORTS                             // { shell: 8000, "app-react": 8001, ... } (env-overridable)
getAppUrl(id)                     // http://localhost:<port> (dev helper)
```

Port override env vars: `SHELL_PORT`, `REACT_PORT`, `NEXTJS_PORT`, … (or
the `VITE_`-prefixed form).

## `createMfeConfig(options)` (Vite)

| Option                                     | Default                        | Description                                               |
| ------------------------------------------ | ------------------------------ | --------------------------------------------------------- |
| `appId`                                    | required                       | Registry id                                               |
| `frameworkPlugin`                          | required                       | e.g. `react()`, `vue()`                                   |
| `federationShared`                         | required                       | `reactShared`, `vueShared`, `svelteShared`, `solidShared` |
| `entryFile`                                | required                       | Exposed as `./Mfe`                                        |
| `mainFile`                                 | required                       | Standalone entry                                          |
| `htmlFile`                                 | `./index.html`                 | Standalone HTML                                           |
| `customBaseUrl`                            | dev URL / `"./"`               | `(isDev, isMfeMode, url) => base`                         |
| `outDir` / `emptyOutDir` / `publicDir`     | `dist` / `true` / Vite default | Output (Next.js uses `public`)                            |
| `skipHtmlInput`                            | `false`                        | No HTML input (Next.js)                                   |
| `additionalInputs` / `additionalExternals` |                                | Extra Rollup config                                       |
| `define`                                   |                                | Vite `define`                                             |
| `viteConfigOverride`                       | `{}`                           | Deep-merged last                                          |

What it sets up:

- **Module Federation 2.0**: name `toFederationName(appId)`,
  `remoteEntry.js`, `mf-manifest.json`, `exposes: { "./Mfe": entryFile }`,
  shared singletons with `requiredVersion: false`.
- Dev server on the registry port with `strictPort` and CORS.
- `health.json` (dev middleware and build output).
- Production base `"./"`, so `publicPath` is `auto`.
- `cssCodeSplit: true`, so the expose's CSS appears in the manifest.

## Shared lists

```ts
reactShared = ["react", "react-dom"];
vueShared = ["vue"];
svelteShared = ["svelte"];
solidShared = ["solid-js"];
```

Share **only** framework runtimes. Platform state is shared through
`window` by `@repo/core`.

## Tailwind

```ts
sharedConfig; // tokens, dark mode, animations
createMfeTailwindConfig(appId, content); // sharedConfig + important: [data-mfe="<appId>"]
mfeScopeSelector(appId); // '[data-mfe="<appId>"]'
```

## Vite plugins (advanced)

`createHealthPlugin(appId)`, `createVirtualManifestPlugin(entry)` and
`createDevEntryRedirectPlugin(entry)`. These are used for manifest-mode
hosts. `createMfeConfig` already includes the ones it needs.
