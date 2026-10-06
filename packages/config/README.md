# @repo/config

Shared configuration for the Orbit platform: the **MFE registry**, build
factories and tooling presets.

**Full API reference → [docs/api/config.md](../../docs/api/config.md)**

| Export                            | What                                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| `@repo/config`                    | `MFE_APPS` (single source of truth), `APP_IDS`, `PORTS`, `toFederationName`, shared lists    |
| `@repo/config/vite`               | `createMfeConfig()` (Module Federation 2.0 remote config), Vite plugins. **Build-time only** |
| `@repo/config/tailwind.config`    | `sharedConfig`, `createMfeTailwindConfig(appId, content)` (scoped utilities)                 |
| `@repo/config/tsconfig.base.json` | TypeScript base                                                                              |
| `@repo/config/eslint-preset.cjs`  | ESLint preset                                                                                |

```ts
// apps/<app>/vite.config.mts
export default createMfeConfig({
  appId: APP_IDS.REACT,
  frameworkPlugin: react(),
  federationShared: reactShared,
  entryFile: "./src/entry-mfe.tsx",
  mainFile: "./src/main.tsx",
});
```

`pnpm --filter @repo/config test` checks the registry, including drift
against `scripts/mfe.config.mjs`.
