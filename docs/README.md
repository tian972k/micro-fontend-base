# Orbit Documentation

## Guides

0. [Starting a new project](./starting-a-new-project.md): template + `pnpm orbit:init`
1. [Getting started](./getting-started.md): install, run, demo login, commands
2. [Architecture](./architecture.md): shell, remotes, registry, MF 2.0 loading, state, isolation
3. [Creating a micro-frontend](./creating-a-micro-frontend.md): scaffold, registry fields, entries per framework, styling
4. [Configuration](./configuration.md): every environment variable, catalog, Turborepo
5. [Edge cases & failure handling](./edge-cases.md): what happens when anything goes wrong (start here when debugging)
6. [Security](./security.md): auth, sessions, CSP, proxy, hardening checklist
7. [Observability](./observability.md): telemetry pipeline, Web Vitals, Sentry, dashboards
8. [Testing & quality gates](./testing-and-quality.md): unit, e2e, Lighthouse, CI
9. [Deployment](./deployment.md): Vercel, Docker, any host, rollback & canary
10. [Troubleshooting](./troubleshooting.md): symptoms → fixes

## API reference

- [`@repo/core`](./api/core.md): `MfeHost`, registry, factories, events, stores, telemetry, logger, i18n
- [`@repo/config`](./api/config.md): registry, `createMfeConfig`, shared lists, Tailwind
- [Shell server](./api/shell.md): URLs, auth, CSP, federation loader, routes
- [`@repo/ui`](../packages/ui/README.md): components and Storybook
- [`@repo/utils`](../packages/utils/README.md)

## Examples & appendix

- [Cross-MFE communication](./examples/cross-mfe-communication.ts)
- [Enterprise patterns & interview guide](./appendix/enterprise-patterns-interview-guide.md)
