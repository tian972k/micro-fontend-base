# Generators & Bundle Size

## Generators: `pnpm g`

One command scaffolds everything. Names can be `kebab-case` or
`PascalCase`; `<app>` is an app id (`app-react`), its short name (`react`)
or `shell`. Add `--dry-run` to print what would be written, and `--force`
to overwrite existing files.

| Command                                               | Creates                                                                                                                |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `pnpm g ui <name> [--fw react,vue,svelte,solid\|all]` | Design-system component in `packages/ui` + Storybook story, export registered in the framework entry (`@repo/ui/<fw>`) |
| `pnpm g component <app> <name>`                       | `src/components/<name>/` in the app's framework (detected from its dependencies) + `index.ts`                          |
| `pnpm g feature <app> <name>`                         | `src/features/<name>/` with a `<Name>Feature` already built on `Card` from the design system                           |
| `pnpm g page <route> [--public]`                      | Shell route `app/routes/<route>/page.tsx`. Routes outside `dashboard/` get a `requireUser` loader unless `--public`    |
| `pnpm g mfe <name> <react\|vue\|svelte\|solidjs>`     | A new micro-frontend (same as `pnpm mfe:add`)                                                                          |
| `pnpm g project --name <name> [--keep react,vue]`     | Turns this checkout into a new project (same as `pnpm orbit:init`)                                                     |

Examples:

```bash
pnpm g ui status-dot --fw all          # Badge-like component for every framework
pnpm g component vue order-table       # apps/app-vue/src/components/order-table/
pnpm g feature react billing-summary   # apps/app-react/src/features/billing-summary/
pnpm g page dashboard/reports          # /dashboard/reports, protected by the layout
pnpm g page pricing --public           # /pricing, no login required
```

Without arguments, `pnpm --filter @repo/ui generate` still asks for the
framework and name interactively.

After `pnpm g page`, add the page to
`apps/shell/app/components/layout/sidebar/nav-config.ts` to list it in the
sidebar (and in the header search).

## Keeping bundles small

What is already in place:

- `@repo/core` and `@repo/config` are marked `"sideEffects": false`, so an
  MFE only bundles the parts of the runtime it imports.
- Framework runtimes are shared through Module Federation (`reactShared`,
  `vueShared`, ...); everything else is bundled per MFE.
- Each MFE runs Tailwind scoped to its own `[data-mfe]` root, so only the
  classes it uses are generated.

Rules of thumb:

- Import the framework entry (`@repo/core/vue`, `@repo/ui/svelte`, ...),
  not the root entry that re-exports every framework.
- Prefer named imports from packages that tree-shake (`lucide-react`,
  `@phosphor-icons/react`); avoid `import _ from "lodash"`.
- Only declare dependencies an app actually imports (see below).

### `pnpm size`

Reports JS and CSS per app (raw and gzip) from the build output and
compares it with `scripts/bundle-baseline.json`.

```bash
pnpm build
pnpm size                 # table, with the change vs the baseline
pnpm size --top 5         # also the 5 largest files per app
pnpm size --check         # exit 1 when an app grew more than 10%
pnpm size --check --max-growth 5
pnpm size --save          # accept the current sizes as the new baseline
```

CI runs `pnpm size --check` on every pull request. When an increase is
intended, run `pnpm build && pnpm size --save` and commit the baseline
with the change, so the reviewer sees it.

### `pnpm analyze`

Rebuilds every app with a treemap of what ended up in each bundle
(`apps/<app>/stats.html`, with gzip and brotli sizes). For one MFE:

```bash
ANALYZE=true pnpm --filter app-vue build      # stats.html
ANALYZE=json pnpm --filter app-vue build      # stats.json (raw data)
```

### `pnpm deps:unused`

Lists dependencies a workspace declares but never imports or uses in a
script or config. CI fails when it finds one.

```bash
pnpm deps:unused          # report runtime dependencies
pnpm deps:unused --dev    # also list devDependencies (report only)
pnpm deps:unused --fix    # remove unused runtime dependencies, then pnpm install
```
