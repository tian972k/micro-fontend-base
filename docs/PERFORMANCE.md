# Orbit Performance Guide

## Quick Checklist

- [x] **Minification**: Enabled by default in production builds.
- [ ] **MFE Caching**: Configured in `MfeHost` (caches for 1h).
- [ ] **Shared Deps**: Verified in `vite.config.mts`.
- [ ] **Web Vitals**: Monitored in Shell app.
- [ ] **Bundle Budget**: < 300KB initial load for Shell.

## Commands

### Analyze Bundle Size

Generate a visual report of your application bundle.

```bash
# Analyze Shell App
pnpm --filter shell analyze
# Output: apps/shell/stats.html
```

### Production Build

Always benchmark against production builds.

```bash
pnpm build
pnpm start
```

## Configuration Reference

### Lazy Loading

Use `lazy()` for heavy routes or components.

```tsx
const Dashboard = lazy(() => import("./routes/Dashboard"));
```

### Shared Dependencies

Managed in `packages/config/src/shared-deps.ts`.

- **baseShared**: `dayjs`, `@repo/utils`
- **reactShared**: `react`, `react-dom`, `@repo/core`, `@repo/ui`

### Caching Strategy

- **HTML**: No-cache (`Cache-Control: no-cache`)
- **Assets**: Immutable (`Cache-Control: public, max-age=31536000, immutable`)
- **MFE Version**: Stored in localStorage (`mfe_version_cache`), checks `health.json` every hour.

## Monitoring

Web Vitals are logged to the console in development/production. Search for:

- [CLS] Cumulative Layout Shift
- [FID] First Input Delay
- [LCP] Largest Contentful Paint
