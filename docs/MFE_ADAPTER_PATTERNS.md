# MFE Adapter Pattern & Framework Integration Guide

This guide documents the **adapter pattern** used across Orbit, inspired by how Google Chrome, Figma, and TikTok manage cross-framework integrations at scale.

---

## Overview: Adapter Pattern for MFEs

Each framework (React, Vue, Svelte, Solid) has a **thin adapter** that exposes the `mount`/`unmount` interface expected by the Shell. This decouples:

- **Framework specifics** (hooks, components, reactivity models)
- **Shared runtime** (EventBus, stores, configuration)

```typescript
// Adapter = thin wrapper around framework initialization
export const mount = async (container: HTMLElement, props?: MfeProps) => {
  // 1. Initialize framework
  // 2. Register event listeners
  // 3. Render app
  // 4. Return cleanup function
};

export const unmount = async (container: HTMLElement) => {
  // 1. Destroy framework instance
  // 2. Unregister listeners
  // 3. Clear DOM
};
```

---

## React Adapter Pattern

### Basic Implementation

```typescript
// app-react/src/mfe.tsx
import React from "react";
import { createRoot, Root } from "react-dom/client";
import App from "./App";
import { MfeProps, MfeErrorBoundary } from "@repo/core/react";
import { APP_IDS } from "@repo/config";

let root: Root;

export const mount = async (container: HTMLElement, props?: MfeProps) => {
  root = createRoot(container);
  root.render(
    <MfeErrorBoundary mfeId={APP_IDS.APP_REACT} fallback={<ErrorUI />}>
      <App {...props} />
    </MfeErrorBoundary>,
  );
};

export const unmount = async (container: HTMLElement) => {
  root?.unmount();
  container.innerHTML = "";
};
```

### With Event Listener Registration

```typescript
// app-react/src/mfe.tsx
import { EventBus } from "@repo/core/shared";

let eventListeners: (() => void)[] = [];

export const mount = async (container: HTMLElement, props?: MfeProps) => {
  // Register listeners
  eventListeners.push(
    EventBus.subscribe("nav:navigate", (payload) => {
      console.log("Navigating to:", payload.to);
      // Update local state, redirect, etc.
    }),
  );

  eventListeners.push(
    EventBus.subscribe("user:login", (payload) => {
      // Update user context
      setUser({ id: payload.userId, token: payload.token });
    }),
  );

  root = createRoot(container);
  root.render(<App {...props} />);
};

export const unmount = async (container: HTMLElement) => {
  // Cleanup listeners
  eventListeners.forEach((unsubscribe) => unsubscribe());
  eventListeners = [];

  root?.unmount();
  container.innerHTML = "";
};
```

---

## Vue Adapter Pattern

### Basic Implementation

```typescript
// app-vue/src/mfe.ts
import { createApp } from "vue";
import App from "./App.vue";
import { MfeProps } from "@repo/core/shared";

let vueApp: ReturnType<typeof createApp>;

export const mount = async (container: HTMLElement, props?: MfeProps) => {
  vueApp = createApp(App, props);

  // Install global plugins (if needed)
  // vueApp.use(router);
  // vueApp.use(store);

  vueApp.mount(container);
};

export const unmount = async (container: HTMLElement) => {
  if (vueApp) {
    vueApp.unmount();
    container.innerHTML = "";
  }
};
```

### With Composition API & EventBus

```typescript
// app-vue/src/mfe.ts
import { EventBus, userStore } from "@repo/core/shared";

let unsubscribers: (() => void)[] = [];

export const mount = async (container: HTMLElement, props?: MfeProps) => {
  // Register event listeners at MFE level (not component level)
  unsubscribers.push(
    EventBus.subscribe("user:login", (payload) => {
      // Update Zustand store, which Vue components can read via `useStore`
      userStore.setState({
        user: { id: payload.userId, authenticated: true },
      });
    }),
  );

  vueApp = createApp(App, props);
  vueApp.mount(container);
};

export const unmount = async (container: HTMLElement) => {
  unsubscribers.forEach((fn) => fn());
  unsubscribers = [];

  vueApp?.unmount();
  container.innerHTML = "";
};
```

### Vue Component Using Shared Store

```vue
<!-- app-vue/src/App.vue -->
<script setup lang="ts">
import { computed, watch } from "vue";
import { userStore } from "@repo/core/shared";

const state = computed(() => userStore.getState());
const user = computed(() => state.value.user);

watch(user, (newUser) => {
  console.log("User updated:", newUser);
});
</script>

<template>
  <div>
    <p v-if="user">Welcome, {{ user.name }}!</p>
    <p v-else>Not logged in</p>
  </div>
</template>
```

---

## Svelte Adapter Pattern

### Basic Implementation with Stores

```typescript
// app-svelte/src/mfe.ts
import App from "./App.svelte";
import { EventBus, userStore } from "@repo/core/shared";

let app: App;
let unsubscribers: (() => void)[] = [];

export const mount = async (container: HTMLElement, props?: MfeProps) => {
  unsubscribers.push(
    EventBus.subscribe("user:login", (payload) => {
      userStore.setState({
        user: { id: payload.userId, authenticated: true },
      });
    }),
  );

  app = new App({
    target: container,
    props: props || {},
  });
};

export const unmount = async (container: HTMLElement) => {
  unsubscribers.forEach((fn) => fn());
  unsubscribers = [];

  app?.$destroy();
  container.innerHTML = "";
};
```

### Svelte Component with Reactive Store

```svelte
<!-- app-svelte/src/App.svelte -->
<script>
  import { userStore } from "@repo/core/shared";

  $: user = $userStore.user;
</script>

<div>
  {#if user}
    <p>Welcome, {user.name}!</p>
  {:else}
    <p>Not logged in</p>
  {/if}
</div>
```

---

## SolidJS Adapter Pattern

### Basic Implementation

```typescript
// app-solidjs/src/mfe.tsx
import { render } from "solid-js/web";
import { createEffect, onCleanup } from "solid-js";
import App from "./App";
import { EventBus } from "@repo/core/shared";

let dispose: (() => void) | null = null;
let eventUnsubscribers: (() => void)[] = [];

export const mount = async (container: HTMLElement, props?: MfeProps) => {
  eventUnsubscribers.push(
    EventBus.subscribe("user:login", (payload) => {
      console.log("Logged in:", payload.userId);
      // Update SolidJS signals as needed
    }),
  );

  dispose = render(() => <App {...props} />, container);
};

export const unmount = async (container: HTMLElement) => {
  eventUnsubscribers.forEach((fn) => fn());
  eventUnsubscribers = [];

  dispose?.();
  container.innerHTML = "";
};
```

---

## Next.js Adapter Pattern

### Special Case: SSR Support

Next.js is special because it can render on the Shell's Remix server OR as a client-side MFE.

#### Option 1: Client-Side Only (Standard MFE)

```typescript
// app-nextjs/src/mfe.tsx
import { hydrate } from "react-dom";
import App from "./pages/App";

export const mount = async (container: HTMLElement, props?: MfeProps) => {
  hydrate(<App {...props} />, container);
};

export const unmount = async (container: HTMLElement) => {
  // React cleanup
  container.innerHTML = "";
};
```

#### Option 2: Server-Side Rendering (Advanced)

```typescript
// app-nextjs/src/mfe.server.ts
export const renderMfe = async (props?: MfeProps) => {
  // Render on Node.js server, return HTML string
  const html = await renderToString(<App {...props} />);
  return html;
};
```

---

## Common Patterns Across All Adapters

### 1. Error Boundary

Every adapter should wrap its app with an error boundary:

```typescript
export const mount = async (container: HTMLElement, props?: MfeProps) => {
  try {
    // ... initialization
  } catch (error) {
    console.error(`[MFE] Mount failed:`, error);
    container.innerHTML = `<div style="padding: 20px; color: red;">
      Failed to load. Check console for details.
    </div>`;
    throw error; // Let Shell know
  }
};
```

### 2. Cleanup Pattern

Always cleanup in unmount:

```typescript
const listeners: (() => void)[] = [];
const timers: NodeJS.Timeout[] = [];

export const mount = async (container: HTMLElement, props?: MfeProps) => {
  listeners.push(EventBus.subscribe("event:name", handler));
  timers.push(setInterval(pollSomething, 5000));
};

export const unmount = async (container: HTMLElement) => {
  listeners.forEach((fn) => fn());
  timers.forEach((t) => clearInterval(t));
  listeners.length = 0;
  timers.length = 0;
};
```

### 3. Props Injection

All adapters accept and pass MfeProps:

```typescript
export interface MfeProps {
  userId?: string;
  theme?: "light" | "dark";
  locale?: string;
  [key: string]: unknown;
}
```

### 4. Idempotency

Calling `mount` twice without `unmount` should handle gracefully:

```typescript
export const mount = async (container: HTMLElement, props?: MfeProps) => {
  // If already mounted, unmount first
  if (root) {
    await unmount(container);
  }

  root = createRoot(container);
  root.render(<App {...props} />);
};
```

---

## Testing the Adapter

Each MFE should include an integration test for mount/unmount:

```typescript
// app-react/__tests__/mfe.test.ts
import { mount, unmount } from "../src/mfe";

describe("React MFE Adapter", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(async () => {
    await unmount(container);
    container.remove();
  });

  it("mounts and renders", async () => {
    await mount(container);
    expect(container.innerHTML).toContain("App");
  });

  it("unmounts cleanly", async () => {
    await mount(container);
    await unmount(container);
    expect(container.innerHTML).toBe("");
  });

  it("handles mount/unmount cycles", async () => {
    await mount(container);
    await unmount(container);
    await mount(container);
    await unmount(container);
    expect(container.innerHTML).toBe("");
  });
});
```

---

## Shell Integration

The Shell orchestrates MFE lifecycle:

```typescript
// shell/src/mfe-host.tsx
import type { MfeEntryPoint, MfeProps } from "@repo/core/shared";
import { mfeLogger } from "@repo/core/shared";

export const MfeHost = ({ mfeId, props }: { mfeId: string; props?: MfeProps }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mfeRef = useRef<MfeEntryPoint | null>(null);

  useEffect(() => {
    const mount = async () => {
      const module = await import(/* webpackChunk: `${mfeId}` */ `${mfeId}`);
      mfeRef.current = module;

      mfeLogger.info(`[Shell] Mounting ${mfeId}`);
      await module.mount(containerRef.current!, props);
    };

    mount().catch((error) => {
      mfeLogger.error(`[Shell] Failed to mount ${mfeId}:`, error);
    });

    return async () => {
      if (mfeRef.current && containerRef.current) {
        mfeLogger.info(`[Shell] Unmounting ${mfeId}`);
        await mfeRef.current.unmount(containerRef.current);
      }
    };
  }, [mfeId, props]);

  return <div ref={containerRef} />;
};
```

---

## Performance Considerations

### Lazy Load MFEs

```typescript
// Load only when needed
const MfeAsync = React.lazy(() =>
  import("app-react").then((m) => ({ default: () => m.mount(...) })),
);

<Suspense fallback={<Loading />}>
  <MfeAsync />
</Suspense>
```

### Prefetch Manifests

```typescript
// shell/src/boot.ts
import { prefetchManifest } from "@repo/core/shared";

// Prefetch all MFE manifests on Shell startup
Object.values(APP_IDS).forEach((id) => prefetchManifest(id));
```

### Measure Mount Times

```typescript
export const mount = async (container: HTMLElement, props?: MfeProps) => {
  const startTime = performance.now();

  // ... mount logic

  const duration = performance.now() - startTime;
  perfMonitor.recordMfeMount(APP_ID, duration);
};
```

---

## Deployment Checklist

Before shipping an MFE adapter:

- [ ] `mount` is idempotent
- [ ] `unmount` fully cleans up (no memory leaks)
- [ ] Error boundary catches and logs errors
- [ ] EventBus listeners are unsubscribed
- [ ] Timers/intervals are cleared
- [ ] DOM is completely cleared on unmount
- [ ] Props are passed through correctly
- [ ] Integration tests pass
- [ ] Performance metrics are collected
- [ ] MfeEntryPoint interface is properly exported
