# Troubleshooting

Quick fixes for the most common issues.

```mermaid
flowchart TD
  Start{Issue?} --> Install[Install]
  Start --> DevServer[Dev Server]
  Start --> Build[Build]
  Start --> Runtime[Runtime]

  Install --> I1[pnpm install]
  DevServer --> D1[kill ports 8000-8005]
  Build --> B1[pnpm build:packages]
  Runtime --> R1[open DevTools console]
```

---

## Install Issues

```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

---

## Dev Server Issues

```bash
pnpm kill-ports
pnpm dev:all
```

---

## Build Issues

```bash
pnpm build:packages
pnpm build:apps
```

---

## Runtime Issues

- Open DevTools → Console
- Look for Module Federation load errors
- Refresh shell after restarting MFEs
