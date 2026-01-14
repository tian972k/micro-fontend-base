# Micro-Frontend Architecture Guide

This platform is designed for real-world scalability, using a monorepo structure with central orchestration.

## Architecture Overview

- **`apps/shell`**: The host application (Remix). It provides the layout, global navigation, and authentication context.
- **`apps/app-*`**: Independent micro-apps (React + Vite/Next.js). They register themselves in the global registry.
- **`packages/core`**: The backbone. Contains the `MfeHost` component, Event Bus, and App Registry.
- **`packages/ui`**: Shared design system with modern Tailwind configuration and premium components.

## How to add a new Micro-App

1. Use the scaffolding script: `pnpm create-app my-new-app`
2. Ensure the app has a `health.json` and `manifest.json` in its `public` directory.
3. In `src/entry-mfe.tsx`, use `AppRegistry.register("my-new-app", microApp)`.
4. In the shell, add a new route and use `<MfeHost name="my-new-app" host={url} />`.

## Communication

Apps communicate via the `globalEventBus` provided by `@repo/core`.

```typescript
import { globalEventBus } from "@repo/core";

// Emit
globalEventBus.emit("EVENT_NAME", data);

// Listen
globalEventBus.on("EVENT_NAME", (data) => { ... });
```

## Best Practices

- **Isolation**: Keep MFEs decoupled. Don't share state directly; use the Event Bus.
- **Shared UI**: Use components from `@repo/ui` to maintain visual consistency.
- **Versioning**: Each MFE can be deployed independently as long as the contract in `window.MFE` is respected.
