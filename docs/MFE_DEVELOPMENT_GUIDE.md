# MFE Development Guide

Public‑facing guide for building, running, and maintaining MFEs in Orbit.

---

## 1) Add a New MFE

### Option A: Auto‑Generate (Recommended)

```bash
pnpm mfe:add <app-name> <framework>
```

Example:

```bash
pnpm mfe:add app-analytics react
```

Supported frameworks: `react`, `vue`, `svelte`, `solidjs`

This will:

- Create app directory
- Update `MFE_APPS` registry
- Auto-configure ports
- Generate package.json

### Option B: Manual Setup

1. Update registry in [packages/config/src/constants/apps.ts](../packages/config/src/constants/apps.ts):

```typescript
export const MFE_APPS = [
  // ... existing apps
  {
    id: "app-analytics",
    name: "Analytics Dashboard",
    framework: "react",
    port: 8006,
  },
] as const;
```

Auto-generated:

- `APP_IDS.ANALYTICS`
- `PORTS['app-analytics']`
- TypeScript types

1. Create app structure:

```bash
mkdir apps/app-analytics
cd apps/app-analytics
```

1. Add package.json:

```json
{
  "name": "app-analytics",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build && node ../../scripts/generate-manifest.mjs $PWD"
  },
  "dependencies": {
    "@repo/config": "workspace:*",
    "@repo/core": "workspace:*",
    "@repo/ui": "workspace:*",
    "@repo/utils": "workspace:*"
  }
}
```

---

## 2) Development Build

```bash
pnpm dev:all
```

Shell only:

```bash
pnpm dev:shell
```

---

## 3) Production Build

```bash
pnpm build
pnpm build:mfes:prod
```

---

## 4) Issue Handling (Common)

| Issue              | Symptom          | Fix                        |
| ------------------ | ---------------- | -------------------------- |
| Port conflict      | Dev server fails | Run `pnpm kill-ports`      |
| Missing manifest   | 404 on assets    | Run `pnpm build:mfes:prod` |
| Remote not loading | Loading spinner  | Restart MFE dev server     |

---

## 5) Related Docs

- [docs/ARCHITECTURE.md](ARCHITECTURE.md)
- [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md)
