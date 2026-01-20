# 📖 Orbit Platform Tutorial

> **Complete hands-on guide** to building micro-frontends with the Orbit platform.

---

## Table of Contents

1. [Introduction](#-introduction)
2. [Your First Micro-Frontend](#-your-first-micro-frontend)
3. [Working with UI Components](#-working-with-ui-components)
4. [Cross-MFE Communication](#-cross-mfe-communication)
5. [State Management](#-state-management)
6. [Adding New Components](#-adding-new-components)
7. [Storybook Development](#-storybook-development)
8. [Testing Your MFE](#-testing-your-mfe)
9. [Production Build](#-production-build)
10. [Common Recipes](#-common-recipes)

---

## 🌟 Introduction

Welcome to the Orbit Platform Tutorial! This guide will walk you through everything you need to know to build, develop, and deploy micro-frontends.

### What You'll Learn

- ✅ Creating a new micro-frontend app
- ✅ Using the multi-framework UI component library
- ✅ Implementing cross-app communication
- ✅ Managing shared state
- ✅ Building reusable components
- ✅ Testing with Storybook
- ✅ Deploying to production

### Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed
- **pnpm 8+** installed (`npm install -g pnpm`)
- Basic knowledge of React, Vue, or Svelte
- Familiarity with TypeScript

---

## 🚀 Your First Micro-Frontend

Let's create a new micro-frontend from scratch!

### Step 1: Use the Interactive CLI

The easiest way to create a new MFE is using our CLI:

```bash
pnpm cli
```

Select option `1. create-app` and follow the prompts:

```
🚀 Micro-Frontend Generator
===========================
📦 App Name (kebab-case, e.g. 'trade-desk'): my-dashboard

🎨 Choose Framework:
  1. React (Vite + Remix)
  2. Vue 3 (Vite + Composition API)
  3. Svelte (Vite + SvelteKit)
  4. SolidJS (Vite + Solid)

Your choice (1-4): 1
```

### Step 2: Register in MFE Config

After creation, add your app to the central config:

```javascript
// scripts/mfe.config.mjs
export const MFE_APPS = [
  // ... existing apps
  {
    name: "my-dashboard",
    framework: "react",
    port: 8006, // Choose next available port
    entryFile: "entry-mfe.tsx",
    outputDir: "dist",
  },
];
```

### Step 3: Start Development

```bash
# Install dependencies
pnpm install

# Start your app
pnpm dev --filter=my-dashboard

# Or start everything
pnpm dev
```

Your app will be available at:

- **Standalone**: `http://localhost:8006`
- **In Shell**: `http://localhost:8000/dashboard/my-dashboard`

### Step 4: Understanding the Structure

```text
apps/my-dashboard/
├── public/
│   ├── health.json      # Health check endpoint
│   └── manifest.json    # MFE manifest for discovery
├── src/
│   ├── entry-mfe.tsx    # MFE entry point (mount/unmount)
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Standalone entry
│   └── features/        # Feature modules
├── package.json
└── vite.config.mts
```

### Step 5: The Entry Point

Every MFE needs an entry point that exports `mount` and `unmount` functions:

```tsx
// src/entry-mfe.tsx
import { createRoot } from "react-dom/client";
import { createMfeEntry } from "@repo/core";
import App from "./App";

// Create the MFE entry with lifecycle hooks
export const { mount, unmount } = createMfeEntry({
  appId: "my-dashboard",

  mount: (container, props) => {
    const root = createRoot(container);
    root.render(<App {...props} />);
    container._reactRoot = root;
    return root;
  },

  unmount: (container) => {
    container._reactRoot?.unmount();
  },
});
```

---

## 🎨 Working with UI Components

The `@repo/ui` package provides a multi-framework component library.

### Importing Components

Each framework has its own export path:

```tsx
// React / Next.js
import { Button, Card, Input } from "@repo/ui/react";

// Vue 3
import { Button, Card, Input } from "@repo/ui/vue";

// SolidJS
import { Button, Card, Input } from "@repo/ui/solid";

// Svelte
import { Button, Card, Input } from "@repo/ui/svelte";
```

### Don't Forget Global Styles

Import the global CSS in your app's entry:

```tsx
// In your main.tsx or entry-mfe.tsx
import "@repo/ui/globals.css";
```

### Available Components

| Component       | React | Vue | Solid | Svelte |
| --------------- | :---: | :-: | :---: | :----: |
| **Button**      |  ✅   | ✅  |  ✅   |   ✅   |
| **Card**        |  ✅   | ✅  |  ✅   |   ✅   |
| **Input**       |  ✅   | ✅  |  ✅   |   ✅   |
| **Avatar**      |  ✅   | ✅  |  ✅   |   ✅   |
| **Tooltip**     |  ✅   | ✅  |  ✅   |   ✅   |
| **Sheet**       |  ✅   | 🔜  |  🔜   |   🔜   |
| **Dropdown**    |  ✅   | 🔜  |  🔜   |   🔜   |
| **Sidebar**     |  ✅   | 🔜  |  🔜   |   🔜   |
| **Collapsible** |  ✅   | 🔜  |  🔜   |   🔜   |
| **Separator**   |  ✅   | ✅  |  ✅   |   ✅   |
| **Skeleton**    |  ✅   | ✅  |  ✅   |   ✅   |

### Using Components

#### React Example

```tsx
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@repo/ui/react";

export function Dashboard() {
  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Welcome!</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is my dashboard.</p>
        <Button variant="default" size="lg">
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### Vue Example

```vue
<script setup lang="ts">
import { Button, Card, CardHeader, CardTitle, CardContent } from "@repo/ui/vue";
</script>

<template>
  <Card class="w-96">
    <CardHeader>
      <CardTitle>Welcome!</CardTitle>
    </CardHeader>
    <CardContent>
      <p>This is my dashboard.</p>
      <Button variant="default" size="lg"> Get Started </Button>
    </CardContent>
  </Card>
</template>
```

#### Svelte Example

```svelte
<script>
  import { Button, Card, CardHeader, CardTitle, CardContent } from '@repo/ui/svelte';
</script>

<Card class="w-96">
  <CardHeader>
    <CardTitle>Welcome!</CardTitle>
  </CardHeader>
  <CardContent>
    <p>This is my dashboard.</p>
    <Button variant="default" size="lg">
      Get Started
    </Button>
  </CardContent>
</Card>
```

### Using Shared Variants (Framework-Agnostic)

For maximum flexibility, use shared variants directly:

```typescript
import { buttonVariants, cardVariants } from '@repo/ui/shared';
import { cn } from '@repo/utils';

// Generate class strings
const primaryButton = cn(buttonVariants({ variant: 'default', size: 'lg' }));
const outlineCard = cn(cardVariants({ variant: 'outline' }));

// Use in any framework's native elements
<button class={primaryButton}>Click Me</button>
<div class={outlineCard}>Card Content</div>
```

---

## 🔄 Cross-MFE Communication

MFEs communicate via the **EventBus** - a pub/sub system provided by `@repo/core`.

### Publishing Events

```typescript
import { EventBus } from "@repo/core";

// Emit an event
EventBus.emit("user:login", { userId: "123", name: "John" });

// Emit navigation request
EventBus.emit("nav:navigate", { path: "/dashboard" });

// Emit notification
EventBus.emit("notification:show", {
  type: "success",
  message: "Data saved!",
});
```

### Subscribing to Events

```typescript
import { EventBus } from "@repo/core";

// Subscribe to events
const unsubscribe = EventBus.on("user:login", (data) => {
  console.log("User logged in:", data.name);
});

// Remember to cleanup on unmount
onUnmount(() => {
  unsubscribe();
});
```

### React Hook Usage

```tsx
import { useEffect } from "react";
import { EventBus } from "@repo/core";

function MyComponent() {
  useEffect(() => {
    const unsubscribe = EventBus.on("data:updated", (data) => {
      // Handle event
    });

    return () => unsubscribe();
  }, []);

  const handleClick = () => {
    EventBus.emit("action:triggered", { source: "my-component" });
  };

  return <button onClick={handleClick}>Trigger Action</button>;
}
```

### Event Naming Conventions

Use a `namespace:action` pattern:

| Pattern                | Description         |
| ---------------------- | ------------------- |
| `user:login`           | User authentication |
| `user:logout`          | User logout         |
| `nav:navigate`         | Navigation request  |
| `nav:back`             | Go back             |
| `notification:show`    | Show notification   |
| `mfe:mounted`          | MFE mounted         |
| `mfe:unmounted`        | MFE unmounted       |
| `theme:change`         | Theme changed       |
| `data:{entity}:update` | Data entity updated |

---

## 📦 State Management

### Local State

Each MFE manages its own state using framework-native tools:

- **React**: `useState`, `useReducer`, Context, or Zustand
- **Vue**: `ref`, `reactive`, Pinia
- **Svelte**: Stores, `writable`
- **SolidJS**: Signals, Stores

### Global State (`@repo/core`)

For truly global state (user session, theme, locale), use the shared stores:

```typescript
import { useUserStore, useThemeStore, useLocaleStore } from "@repo/core";

// Get current user
const user = useUserStore.getState().user;

// Subscribe to changes
useUserStore.subscribe((state) => {
  console.log("User changed:", state.user);
});

// Update state
useUserStore.getState().setUser({ id: "123", name: "John" });
```

### React Integration

```tsx
import { useUserStore } from "@repo/core";

function Profile() {
  // This component re-renders when user changes
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Vue Integration

```vue
<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useUserStore } from "@repo/core";

const userStore = useUserStore;
const user = computed(() => userStore.getState().user);

// Watch for changes
watchEffect(() => {
  userStore.subscribe((state) => {
    console.log("User updated:", state.user);
  });
});
</script>
```

---

## ➕ Adding New Components

### Method 1: CLI Generator (Recommended)

```bash
pnpm cli
# Select: 2. generate-ui
```

Or directly:

```bash
cd packages/ui && pnpm generate
```

The generator will:

1. Ask for component name
2. Let you choose frameworks (React, Vue, Solid, Svelte)
3. Create component files with proper structure
4. Create Storybook stories
5. Add shared variants

### Method 2: Manual Creation

#### Step 1: Create Shared Variants

```typescript
// packages/ui/src/shared/variants/my-component.ts
import { cva } from "class-variance-authority";

export const myComponentVariants = cva("base-classes here", {
  variants: {
    variant: {
      default: "default-classes",
      outline: "outline-classes",
    },
    size: {
      sm: "size-sm-classes",
      md: "size-md-classes",
      lg: "size-lg-classes",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export type MyComponentVariant = "default" | "outline";
export type MyComponentSize = "sm" | "md" | "lg";
```

#### Step 2: Export from Shared Index

```typescript
// packages/ui/src/shared/variants/index.ts
export * from "./button";
export * from "./card";
export * from "./my-component"; // Add this
```

#### Step 3: Create React Component

```tsx
// packages/ui/src/components/react/my-component/my-component.tsx
import * as React from "react";
import { cn } from "@repo/utils";
import { myComponentVariants } from "../../../shared/variants";
import type { VariantProps } from "class-variance-authority";

export interface MyComponentProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof myComponentVariants> {}

const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(myComponentVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
MyComponent.displayName = "MyComponent";

export { MyComponent };
```

#### Step 4: Create Story

```tsx
// packages/ui/src/components/react/my-component/my-component.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { MyComponent } from "./my-component";

const meta: Meta<typeof MyComponent> = {
  title: "React/MyComponent",
  component: MyComponent,
  tags: ["autodocs", "react"],
  argTypes: {
    variant: { control: "select", options: ["default", "outline"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    children: "My Component Content",
    variant: "default",
    size: "md",
  },
};
```

#### Step 5: Export from Index

```typescript
// packages/ui/src/components/react/index.ts
export * from "./button";
export * from "./card";
export * from "./my-component"; // Add this
```

---

## 📚 Storybook Development

### Running Storybook

```bash
# Run all Storybooks (parallel)
pnpm storybook:all

# Individual frameworks
pnpm storybook:react   # http://localhost:6006
pnpm storybook:vue     # http://localhost:6007
pnpm storybook:solid   # http://localhost:6008
pnpm storybook:svelte  # http://localhost:6009
```

### Writing Stories

Each component should have stories covering:

1. **Default state** - Basic usage
2. **All variants** - Each variant option
3. **All sizes** - Each size option
4. **Interactive** - With actions/events
5. **Edge cases** - Long text, disabled, etc.

```tsx
// Complete story example
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "React/Button",
  component: Button,
  tags: ["autodocs", "react"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile button component with multiple variants and sizes.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
      description: "The visual style of the button",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "The size of the button",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
    size: "default",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">🔥</Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};
```

### Storybook Configuration

All Storybooks use a shared configuration factory:

```typescript
// packages/ui/.storybook/shared.mts
import { StorybookConfigFactory } from "./shared";

const factory = createStorybookConfigFactory();

export default factory.createMainConfig({
  framework: "@storybook/react-vite",
  stories: ["../src/components/react/**/*.stories.@(ts|tsx)"],
});
```

---

## 🧪 Testing Your MFE

### Unit Testing

```bash
# Run all tests
pnpm test

# Run tests for specific app
pnpm test --filter=my-dashboard
```

### E2E Testing

```bash
# Run Playwright tests
pnpm test:e2e
```

### Manual Testing Checklist

- [ ] App loads in standalone mode
- [ ] App loads in Shell via Module Federation
- [ ] Components render correctly
- [ ] Events are emitted/received correctly
- [ ] State persists across navigation
- [ ] Unmount cleanup works (no memory leaks)
- [ ] Works in both light and dark mode

---

## 🚀 Production Build

### Building Your App

```bash
# Build single app
pnpm build --filter=my-dashboard

# Build all MFEs
pnpm build:mfes

# Production build with optimizations
pnpm build:mfes:prod
```

### Docker Build

```bash
# Dry run (see what would be built)
pnpm docker:build:smart

# Execute build for changed apps
EXECUTE=true pnpm docker:build:smart

# Force build all apps
FORCE_ALL=true EXECUTE=true node scripts/smart-docker-build.js
```

### Verifying the Build

```bash
# Serve the built files locally
cd apps/my-dashboard
npx serve dist

# Check health endpoint
curl http://localhost:3000/health.json

# Check manifest
curl http://localhost:3000/manifest.json
```

---

## 📋 Common Recipes

### Recipe 1: Fetch Data on Mount

```tsx
// React
import { useEffect, useState } from "react";

function DataList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/items")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-20 w-full" />;

  return (
    <ul>
      {data.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

### Recipe 2: Handle Shell Props

```tsx
// The Shell passes session info via props
function App({ session, theme, locale }) {
  return (
    <div data-theme={theme}>
      <p>Welcome, {session?.user?.name}</p>
      <p>Current locale: {locale}</p>
    </div>
  );
}
```

### Recipe 3: Navigate via Shell

```typescript
import { EventBus } from '@repo/core';

function navigateToRoute(path: string) {
  // Request Shell to navigate
  EventBus.emit('nav:navigate', { path });
}

// Usage
<Button onClick={() => navigateToRoute('/dashboard/settings')}>
  Go to Settings
</Button>
```

### Recipe 4: Show Notification

```typescript
import { EventBus } from "@repo/core";

function showNotification(
  message: string,
  type: "success" | "error" = "success",
) {
  EventBus.emit("notification:show", { message, type });
}

// Usage
try {
  await saveData();
  showNotification("Data saved successfully!", "success");
} catch (error) {
  showNotification("Failed to save data", "error");
}
```

### Recipe 5: Theme-Aware Component

```tsx
import { useThemeStore } from "@repo/core";
import { cn } from "@repo/utils";

function ThemeAwareCard({ children }) {
  const theme = useThemeStore((state) => state.theme);

  return (
    <div
      className={cn(
        "rounded-lg p-4",
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
      )}
    >
      {children}
    </div>
  );
}
```

### Recipe 6: Cleanup on Unmount

```tsx
import { useEffect } from "react";
import { EventBus } from "@repo/core";

function CleanupExample() {
  useEffect(() => {
    // Setup
    const interval = setInterval(() => console.log("tick"), 1000);
    const unsubscribe = EventBus.on("some:event", () => {});

    // Cleanup - CRITICAL for MFEs!
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  return <div>Component with cleanup</div>;
}
```

---

## 📚 Next Steps

- **[Architecture Guide](./ARCHITECTURE.md)** - Deep dive into system design
- **[Standards](./STANDARDS.md)** - Coding conventions and best practices
- **[Deployment](./DEPLOYMENT.md)** - CI/CD and production setup
- **[@repo/ui README](../packages/ui/README.md)** - UI component library
- **[@repo/core README](../packages/core/README.md)** - Core utilities

---

## ❓ Need Help?

- 📖 Check the [Getting Started](./GETTING_STARTED.md) guide
- 🐛 Report issues on GitHub
- 💬 Contact: [phamtuandev0907@gmail.com](mailto:phamtuandev0907@gmail.com)
