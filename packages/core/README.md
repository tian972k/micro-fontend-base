# @repo/core

The **nervous system** of the Micro-Frontend platform. This package contains shared business logic, state management, communication utilities, and MFE lifecycle management.

---

## 📑 Table of Contents

1. [Overview](#-overview)
2. [Installation](#-installation)
3. [Application Registry](#1-application-registry)
4. [Event Bus](#2-event-bus)
5. [State Management](#3-state-management)
6. [MFE Utilities](#4-mfe-utilities)
7. [Logger](#5-logger)
8. [I18n](#6-i18n)
9. [API Reference](#-api-reference)

---

## 🌟 Overview

`@repo/core` provides:

- **🔌 Application Registry**: Manage MFE lifecycle and metadata
- **📡 Event Bus**: Cross-MFE communication
- **🗃️ State Management**: Zustand stores for global state
- **🏗️ MFE Utilities**: Factories for creating MFE entry points
- **📝 Logger**: Standardized logging
- **🌍 I18n**: Internationalization support

### Framework Agnostic

All utilities work with any framework:

```typescript
// Works in React, Vue, Svelte, SolidJS
import { EventBus, useUserStore, Logger } from "@repo/core";
```

---

## 📦 Installation

The package is automatically available in the monorepo:

```json
// In your app's package.json
{
  "dependencies": {
    "@repo/core": "workspace:*"
  }
}
```

---

## 1. Application Registry

Centralized registry for managing MFE lifecycle and metadata.

### Registering an App

```typescript
import { AppRegistry } from '@repo/core';

// Register your MFE
AppRegistry.register('app-react', {
  mount: (container, props) => {
    const root = createRoot(container);
    root.render(<App {...props} />);
    container._reactRoot = root;
  },
  unmount: (container) => {
    container._reactRoot?.unmount();
  },
});
```

### Getting Registered Apps

```typescript
// Get all registered apps
const apps = AppRegistry.getAll();
// { 'app-react': { mount, unmount }, 'app-vue': { mount, unmount } }

// Get specific app
const reactApp = AppRegistry.get("app-react");

// Check if app is registered
const isRegistered = AppRegistry.has("app-react");
```

### Mounting/Unmounting

```typescript
// Mount an app
const container = document.getElementById("mfe-container");
AppRegistry.mount("app-react", container, { session, theme });

// Unmount an app
AppRegistry.unmount("app-react", container);
```

### App Lifecycle Events

```typescript
import { EventBus } from "@repo/core";

// Listen for app lifecycle events
EventBus.on("mfe:registered", ({ appId }) => {
  console.log(`App registered: ${appId}`);
});

EventBus.on("mfe:mounted", ({ appId, container }) => {
  console.log(`App mounted: ${appId}`);
});

EventBus.on("mfe:unmounted", ({ appId }) => {
  console.log(`App unmounted: ${appId}`);
});
```

---

## 2. Event Bus

A singleton pub/sub system for cross-MFE communication.

### Publishing Events

```typescript
import { EventBus } from "@repo/core";

// Simple event
EventBus.emit("user:login", { userId: "123", name: "John" });

// With detailed payload
EventBus.emit("notification:show", {
  type: "success",
  message: "Data saved successfully!",
  duration: 3000,
});

// Navigation request
EventBus.emit("nav:navigate", { path: "/dashboard/settings" });
```

### Subscribing to Events

```typescript
import { EventBus } from "@repo/core";

// Subscribe and get unsubscribe function
const unsubscribe = EventBus.on("user:login", (data) => {
  console.log("User logged in:", data.name);
});

// Always cleanup when component unmounts
onUnmount(() => {
  unsubscribe();
});
```

### React Hook Pattern

```tsx
import { useEffect } from "react";
import { EventBus } from "@repo/core";

function MyComponent() {
  useEffect(() => {
    const unsubscribe = EventBus.on("data:updated", (data) => {
      // Handle event
      console.log("Data updated:", data);
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  const handleClick = () => {
    EventBus.emit("action:triggered", { source: "my-component" });
  };

  return <button onClick={handleClick}>Trigger Action</button>;
}
```

### Vue Composition Pattern

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { EventBus } from "@repo/core";

let unsubscribe: (() => void) | null = null;

onMounted(() => {
  unsubscribe = EventBus.on("data:updated", (data) => {
    console.log("Data updated:", data);
  });
});

onUnmounted(() => {
  unsubscribe?.();
});
</script>
```

### Event Naming Conventions

Use `namespace:action` pattern:

| Event                  | Description          |
| ---------------------- | -------------------- |
| `user:login`           | User logged in       |
| `user:logout`          | User logged out      |
| `user:updated`         | User profile updated |
| `nav:navigate`         | Navigation request   |
| `nav:back`             | Go back request      |
| `notification:show`    | Show notification    |
| `notification:clear`   | Clear notifications  |
| `mfe:mounted`          | MFE mounted          |
| `mfe:unmounted`        | MFE unmounted        |
| `mfe:error`            | MFE error occurred   |
| `theme:change`         | Theme changed        |
| `locale:change`        | Locale changed       |
| `data:{entity}:create` | Entity created       |
| `data:{entity}:update` | Entity updated       |
| `data:{entity}:delete` | Entity deleted       |

---

## 3. State Management

Pre-configured Zustand stores for global state.

### User Store

```typescript
import { useUserStore } from "@repo/core";

// Get current state
const user = useUserStore.getState().user;
const isAuthenticated = useUserStore.getState().isAuthenticated;

// Update state
useUserStore
  .getState()
  .setUser({ id: "123", name: "John", email: "john@example.com" });
useUserStore.getState().logout();

// Subscribe to changes (non-React)
const unsubscribe = useUserStore.subscribe((state) => {
  console.log("User state changed:", state.user);
});
```

### React Integration

```tsx
import { useUserStore } from "@repo/core";

function Profile() {
  // Component re-renders when user changes
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);

  if (!user) return <p>Not logged in</p>;

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Theme Store

```typescript
import { useThemeStore } from '@repo/core';

// Get current theme
const theme = useThemeStore.getState().theme; // 'light' | 'dark' | 'system'

// Set theme
useThemeStore.getState().setTheme('dark');

// Toggle theme
useThemeStore.getState().toggleTheme();

// React usage
function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Locale Store

```typescript
import { useLocaleStore } from '@repo/core';

// Get current locale
const locale = useLocaleStore.getState().locale; // 'en' | 'vi' | etc.

// Set locale
useLocaleStore.getState().setLocale('vi');

// React usage
function LanguageSelector() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  return (
    <select value={locale} onChange={(e) => setLocale(e.target.value)}>
      <option value="en">English</option>
      <option value="vi">Tiếng Việt</option>
    </select>
  );
}
```

### Creating Custom Stores

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "cart-storage" },
  ),
);
```

---

## 4. MFE Utilities

Factories for creating MFE entry points.

### createMfeEntry

Creates a standardized MFE entry point with lifecycle hooks:

```typescript
import { createMfeEntry } from '@repo/core';
import { createRoot } from 'react-dom/client';
import App from './App';

export const { mount, unmount } = createMfeEntry({
  appId: 'app-react',

  mount: (container, props) => {
    const root = createRoot(container);
    root.render(<App {...props} />);
    container._reactRoot = root;
    return root;
  },

  unmount: (container) => {
    container._reactRoot?.unmount();
  },

  // Optional lifecycle hooks
  onBeforeMount: (container, props) => {
    console.log('About to mount...');
  },

  onAfterMount: (container, props) => {
    console.log('Mounted successfully');
  },

  onBeforeUnmount: (container) => {
    console.log('About to unmount...');
  },

  onAfterUnmount: (container) => {
    console.log('Unmounted successfully');
  },
});
```

### Framework-Specific Entry Examples

#### React

```typescript
// entry-mfe.tsx
import { createMfeEntry } from '@repo/core';
import { createRoot } from 'react-dom/client';
import App from './App';

export const { mount, unmount } = createMfeEntry({
  appId: 'app-react',
  mount: (container, props) => {
    const root = createRoot(container);
    root.render(<App {...props} />);
    container._reactRoot = root;
  },
  unmount: (container) => {
    container._reactRoot?.unmount();
  },
});
```

#### Vue

```typescript
// entry-mfe.ts
import { createMfeEntry } from "@repo/core";
import { createApp } from "vue";
import App from "./App.vue";

export const { mount, unmount } = createMfeEntry({
  appId: "app-vue",
  mount: (container, props) => {
    const app = createApp(App, props);
    app.mount(container);
    container._vueApp = app;
  },
  unmount: (container) => {
    container._vueApp?.unmount();
  },
});
```

#### Svelte

```typescript
// entry-mfe.ts
import { createMfeEntry } from "@repo/core";
import App from "./App.svelte";

export const { mount, unmount } = createMfeEntry({
  appId: "app-svelte",
  mount: (container, props) => {
    const app = new App({ target: container, props });
    container._svelteApp = app;
  },
  unmount: (container) => {
    container._svelteApp?.$destroy();
  },
});
```

#### SolidJS

```typescript
// entry-mfe.tsx
import { createMfeEntry } from '@repo/core';
import { render } from 'solid-js/web';
import App from './App';

export const { mount, unmount } = createMfeEntry({
  appId: 'app-solidjs',
  mount: (container, props) => {
    const dispose = render(() => <App {...props} />, container);
    container._solidDispose = dispose;
  },
  unmount: (container) => {
    container._solidDispose?.();
  },
});
```

---

## 5. Logger

Standardized logging utility for consistent observability.

### Basic Usage

```typescript
import { Logger } from "@repo/core";

// Log levels
Logger.debug("Detailed debug info");
Logger.info("General information");
Logger.warn("Warning message");
Logger.error("Error occurred", error);
```

### Structured Logging

```typescript
import { Logger } from "@repo/core";

Logger.info("Request processed", {
  path: "/api/users",
  method: "GET",
  duration: 45,
  statusCode: 200,
});

Logger.error("Failed to fetch data", {
  error: error.message,
  stack: error.stack,
  context: { userId: "123" },
});
```

### Log Levels

| Level   | Use Case                   |
| ------- | -------------------------- |
| `debug` | Development debugging      |
| `info`  | General information        |
| `warn`  | Potential issues           |
| `error` | Errors that need attention |

### Production Considerations

```typescript
// Logger respects NODE_ENV
// In production, debug logs are suppressed by default

if (process.env.NODE_ENV === "development") {
  Logger.debug("This only shows in development");
}
```

---

## 6. I18n

Shared internationalization instance for consistent translations.

### Initialization

```typescript
import { initI18n } from "@repo/core";

// Initialize with resources
await initI18n({
  en: {
    translation: {
      welcome: "Welcome",
      goodbye: "Goodbye",
    },
  },
  vi: {
    translation: {
      welcome: "Xin chào",
      goodbye: "Tạm biệt",
    },
  },
});
```

### Using Translations

```typescript
import { i18n } from "@repo/core";

// Get translation
const welcomeText = i18n.t("welcome");

// With interpolation
const greeting = i18n.t("hello", { name: "John" });
```

### Changing Language

```typescript
import { changeLanguage } from "@repo/core";

// Change language globally
await changeLanguage("vi");

// All MFEs will update automatically
```

### React Integration

```tsx
import { useTranslation } from "react-i18next";

function Welcome() {
  const { t } = useTranslation();

  return <h1>{t("welcome")}</h1>;
}
```

---

## 📖 API Reference

### AppRegistry

```typescript
interface AppRegistry {
  register(appId: string, handlers: MfeHandlers): void;
  get(appId: string): MfeHandlers | undefined;
  getAll(): Record<string, MfeHandlers>;
  has(appId: string): boolean;
  mount(appId: string, container: HTMLElement, props?: MfeProps): void;
  unmount(appId: string, container: HTMLElement): void;
}

interface MfeHandlers {
  mount: (container: HTMLElement, props?: MfeProps) => void;
  unmount: (container: HTMLElement) => void;
}

interface MfeProps {
  session?: UserSession;
  theme?: "light" | "dark";
  locale?: string;
  [key: string]: unknown;
}
```

### EventBus

```typescript
interface EventBus {
  emit<T>(event: string, data?: T): void;
  on<T>(event: string, callback: (data: T) => void): () => void;
  off(event: string, callback: Function): void;
  once<T>(event: string, callback: (data: T) => void): void;
}
```

### Stores

```typescript
// User Store
interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

// Theme Store
interface ThemeStore {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleTheme: () => void;
}

// Locale Store
interface LocaleStore {
  locale: string;
  setLocale: (locale: string) => void;
}
```

### createMfeEntry

```typescript
interface MfeEntryOptions {
  appId: string;
  mount: (container: HTMLElement, props?: MfeProps) => void;
  unmount: (container: HTMLElement) => void;
  onBeforeMount?: (container: HTMLElement, props?: MfeProps) => void;
  onAfterMount?: (container: HTMLElement, props?: MfeProps) => void;
  onBeforeUnmount?: (container: HTMLElement) => void;
  onAfterUnmount?: (container: HTMLElement) => void;
}

function createMfeEntry(options: MfeEntryOptions): {
  mount: (container: HTMLElement, props?: MfeProps) => void;
  unmount: (container: HTMLElement) => void;
};
```

### Logger

```typescript
interface Logger {
  debug(message: string, meta?: object): void;
  info(message: string, meta?: object): void;
  warn(message: string, meta?: object): void;
  error(message: string, meta?: object): void;
}
```

---

## 📚 Related Documentation

- [Architecture](../../docs/ARCHITECTURE.md) - System design and patterns
- [Tutorial](../../docs/TUTORIAL.md) - Step-by-step development guide
- [@repo/ui](../ui/README.md) - UI component library
