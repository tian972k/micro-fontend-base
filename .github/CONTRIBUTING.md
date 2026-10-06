# Contributing

```bash
pnpm install
pnpm dev
```

## Before opening a PR

```bash
pnpm type-check && pnpm lint && pnpm test
pnpm test:e2e            # if you touched the shell, core or app-react
```

Hooks run automatically: **pre-commit** (lint-staged: ESLint + Prettier),
**commit-msg** ([Conventional Commits](https://www.conventionalcommits.org/):
`feat(scope): …`, `fix: …`, `docs: …`) and **pre-push** (type-check +
package build).

## Guidelines

- Keep PRs focused, with one concern per PR.
- Behaviour changes need a test. Failure-handling changes also need an
  entry in [docs/edge-cases.md](../docs/edge-cases.md).
- Public API changes in `@repo/core` / `@repo/config` must update
  [docs/api](../docs/api) and the [CHANGELOG](../CHANGELOG.md).
- Events: additive payload changes only. Breaking changes go to a new
  namespace (see [api/core.md](../docs/api/core.md#typed-versioned-events-recommended)).
- New MFE: `pnpm mfe:add`; the registry test keeps `MFE_APPS` and
  `scripts/mfe.config.mjs` in sync.
- No `any` and no raw `console.*` in `packages/core` (lint errors).
