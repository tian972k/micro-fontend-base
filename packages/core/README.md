# @repo/core

The nervous system of the Micro-Front-End platform. This package contains shared business logic, state management, and communication utilities used by the Shell and all Micro-Apps.

## Features

### 1. Application Registry (`AppRegistry`)

Centralized registry for managing Micro-Front-End lifecycle and metadata.

```typescript
import { AppRegistry } from "@repo/core";

// Register a new app
AppRegistry.register("app-a", {
  mount: (container, props) => { ... },
  unmount: (container) => { ... }
});

// Get all registered apps
const apps = AppRegistry.getAll();
```

### 2. Event Bus (`EventBus`)

A singleton event emitter for cross-MFE communication.

```typescript
import { EventBus } from "@repo/core";

// Publish an event
EventBus.emit("mfe:mounted", { appId: "app-a" });

// Subscribe to an event
EventBus.on("mfe:mounted", (data) => {
  console.log("MFE Mounted:", data.appId);
});
```

### 3. I18n (`i18n`)

Shared i18n instance ensuring consistent translation loading and language switching.

```typescript
import { i18n, initI18n, changeLanguage } from "@repo/core";

// Initialize in MFE
await initI18n(resources);

// Change language globally
await changeLanguage("vi");
```

### 4. State Management

Pre-configured Zustand stores for global state.

- `useUserStore`: Authentication and user profile state.
- `useThemeStore`: UI theme preference (light/dark).
- `useLocaleStore`: Language preferences.

### 5. Logger (`Logger`)

Standardized logging utility for consistent observability.

```typescript
import { Logger } from "@repo/core";

Logger.info("Application started");
Logger.error("Failed to load data", error);
```
