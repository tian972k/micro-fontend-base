# @repo/ui

A **multi-framework UI component library** with shared variants and consistent styling across React, Vue, SolidJS, and Svelte.

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Available Components](#-available-components)
5. [Shared Variants](#-shared-variants)
6. [Storybook](#storybook)
7. [Generate Components](#-generate-components)
8. [Project Structure](#-project-structure)
9. [API Reference](#api-reference)

---

## Overview

`@repo/ui` is a design system that provides:

- **Multi-Framework Support**: React, Vue 3, SolidJS, and Svelte components
- **Consistent Design**: Shared variants using CVA (Class Variance Authority)
- **Dark Mode Ready**: All components support light/dark themes
- **Accessible**: Built on Radix UI primitives (React)
- **Tree Shakeable**: Import only what you need
- **Storybook**: Visual documentation for each framework

### Supported Frameworks

| Framework | Status | Import Path       |
| --------- | :----: | ----------------- |
| React     |   ✅   | `@repo/ui/react`  |
| Vue 3     |   ✅   | `@repo/ui/vue`    |
| SolidJS   |   ✅   | `@repo/ui/solid`  |
| Svelte    |   ✅   | `@repo/ui/svelte` |

---

## Installation

The package is automatically available in the monorepo. No additional installation needed.

```json
// In your app's package.json
{
  "dependencies": {
    "@repo/ui": "workspace:*"
  }
}
```

---

## Usage

### 1. Import Global Styles

First, import the global CSS in your app's entry file:

```typescript
// main.tsx / entry-mfe.tsx
import "@repo/ui/globals.css";
```

### 2. Use Components

#### React / Next.js

```tsx
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@repo/ui/react";

export function MyComponent() {
  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Welcome!</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a card component.</p>
        <Button variant="default" size="lg">
          Click Me
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### Vue 3

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
      <p>This is a card component.</p>
      <Button variant="default" size="lg"> Click Me </Button>
    </CardContent>
  </Card>
</template>
```

#### SolidJS

```tsx
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@repo/ui/solid";

export function MyComponent() {
  return (
    <Card class="w-96">
      <CardHeader>
        <CardTitle>Welcome!</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a card component.</p>
        <Button variant="default" size="lg">
          Click Me
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### Svelte

```svelte
<script>
  import { Button, Card, CardHeader, CardTitle, CardContent } from '@repo/ui/svelte';
</script>

<Card class="w-96">
  <CardHeader>
    <CardTitle>Welcome!</CardTitle>
  </CardHeader>
  <CardContent>
    <p>This is a card component.</p>
    <Button variant="default" size="lg">
      Click Me
    </Button>
  </CardContent>
</Card>
```

---

## 🧩 Available Components

### Core Components

| Component     | Description                          | React | Vue | Solid | Svelte |
| ------------- | ------------------------------------ | :---: | :-: | :---: | :----: |
| **Button**    | Versatile button with variants       |  ✅   | ✅  |  ✅   |   ✅   |
| **Card**      | Container with header/content/footer |  ✅   | ✅  |  ✅   |   ✅   |
| **Input**     | Form input field                     |  ✅   | ✅  |  ✅   |   ✅   |
| **Avatar**    | User avatar with fallback            |  ✅   | ✅  |  ✅   |   ✅   |
| **Tooltip**   | Hover tooltip                        |  ✅   | ✅  |  ✅   |   ✅   |
| **Separator** | Visual separator                     |  ✅   | ✅  |  ✅   |   ✅   |
| **Skeleton**  | Loading placeholder                  |  ✅   | ✅  |  ✅   |   ✅   |

### Advanced Components (React Only)

| Component       | Description                            |
| --------------- | -------------------------------------- |
| **Sheet**       | Slide-out panel (drawer)               |
| **Dropdown**    | Dropdown menu with keyboard navigation |
| **Sidebar**     | Collapsible sidebar navigation         |
| **Collapsible** | Expandable/collapsible content         |

---

## Shared Variants

Shared variants are framework-agnostic styling definitions using CVA:

### Using Shared Variants

```typescript
import { buttonVariants, cardVariants, inputVariants } from '@repo/ui/shared';
import { cn } from '@repo/utils';

// Generate class strings
const primaryButton = cn(buttonVariants({ variant: 'default', size: 'lg' }));
const outlineCard = cn(cardVariants());
const errorInput = cn(inputVariants(), 'border-red-500');

// Use in native elements
<button className={primaryButton}>Click Me</button>
<div className={outlineCard}>Card Content</div>
<input className={errorInput} />
```

### Available Variants

#### Button Variants

```typescript
buttonVariants({
  variant:
    "default" | "destructive" | "outline" | "secondary" | "ghost" | "link",
  size: "default" | "sm" | "lg" | "icon",
});
```

| Variant       | Description             |
| ------------- | ----------------------- |
| `default`     | Primary button style    |
| `destructive` | Red/danger button       |
| `outline`     | Border only             |
| `secondary`   | Muted background        |
| `ghost`       | Transparent until hover |
| `link`        | Text link style         |

| Size      | Description           |
| --------- | --------------------- |
| `default` | Standard size (h-10)  |
| `sm`      | Small (h-9)           |
| `lg`      | Large (h-11)          |
| `icon`    | Icon only (h-10 w-10) |

#### Card Variants

```typescript
cardVariants(); // Returns base card classes
```

#### Input Variants

```typescript
inputVariants(); // Returns base input classes
```

### Creating Custom Components

Use shared variants to create custom components:

```tsx
import { buttonVariants } from "@repo/ui/shared";
import { cn } from "@repo/utils";

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "sm" | "lg";
  loading?: boolean;
}

export function CustomButton({
  variant = "default",
  size,
  loading,
  className,
  children,
  ...props
}: CustomButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

---

## Storybook

Each framework has its own Storybook instance for visual documentation.

### Running Storybook

```bash
# Run all Storybooks in parallel
pnpm storybook:all

# Run individual framework Storybook
pnpm storybook:react   # http://localhost:6006
pnpm storybook:vue     # http://localhost:6007
pnpm storybook:solid   # http://localhost:6008
pnpm storybook:svelte  # http://localhost:6009
```

### Storybook Features

- **Auto-generated docs** from TypeScript types
- **Interactive controls** to test props
- **Dark mode toggle** for theme testing
- **Responsive viewport** testing
- **Accessibility** testing addon

### Building Storybook

```bash
# Build static Storybook
pnpm storybook:build
```

---

## Generate Components

Use the CLI to generate new components:

### Interactive Mode

```bash
cd packages/ui && pnpm generate
```

### What Gets Generated

For each framework selected:

```text
src/components/
├── react/
│   └── my-component/
│       ├── my-component.tsx         # Component
│       ├── my-component.stories.tsx # Storybook story
│       └── index.ts                 # Exports
├── vue/
│   └── my-component/
│       ├── MyComponent.vue
│       ├── MyComponent.stories.ts
│       └── index.ts
├── solid/
│   └── my-component/
│       ├── my-component.tsx
│       ├── my-component.stories.tsx
│       └── index.ts
└── svelte/
    └── my-component/
        ├── MyComponent.svelte
        ├── MyComponent.stories.ts
        └── index.ts
```

Plus shared variants:

```text
src/shared/variants/
└── my-component.ts
```

---

## 📁 Project Structure

```text
packages/ui/
├── src/
│   ├── components/
│   │   ├── react/           # React components
│   │   │   ├── button/
│   │   │   │   ├── button.tsx
│   │   │   │   ├── button.stories.tsx
│   │   │   │   └── index.ts
│   │   │   ├── card/
│   │   │   └── ...
│   │   ├── vue/             # Vue components
│   │   ├── solid/           # SolidJS components
│   │   └── svelte/          # Svelte components
│   │
│   ├── shared/
│   │   ├── index.ts         # Shared exports
│   │   └── variants/        # CVA variants
│   │       ├── button.ts
│   │       ├── card.ts
│   │       ├── input.ts
│   │       └── index.ts
│   │
│   └── styles/
│       └── globals.css      # Global CSS & CSS variables
│
├── .storybook/              # Shared Storybook config
├── .storybook-react/        # React Storybook
├── .storybook-vue/          # Vue Storybook
├── .storybook-solid/        # SolidJS Storybook
├── .storybook-svelte/       # Svelte Storybook
│
├── cli/
│   └── generate-component.js # Component generator
│
└── package.json
```

---

## API Reference

### Exports

| Export                 | Description                |
| ---------------------- | -------------------------- |
| `@repo/ui`             | Default (React components) |
| `@repo/ui/react`       | React components           |
| `@repo/ui/vue`         | Vue components             |
| `@repo/ui/solid`       | SolidJS components         |
| `@repo/ui/svelte`      | Svelte components          |
| `@repo/ui/shared`      | Shared variants            |
| `@repo/ui/globals.css` | Global CSS                 |

### Button API

```typescript
interface ButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}
```

### Card API

```typescript
// Card container
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

// Sub-components
CardHeader; // Card header section
CardTitle; // Card title text
CardDescription; // Card description text
CardContent; // Card main content
CardFooter; // Card footer section
```

### Input API

```typescript
interface InputProps {
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
```

### Avatar API

```typescript
interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}
```

### Tooltip API

```typescript
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}
```

---

## Theming

### CSS Variables

All components use CSS variables for theming:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Customizing Theme

Override CSS variables in your app:

```css
/* Your app's CSS */
:root {
  --primary: 259 100% 55%; /* Purple */
  --primary-foreground: 0 0% 100%;
}
```

---

## Tailwind Configuration

Export a shared Tailwind config preset:

```javascript
// tailwind.config.ts in your app
import sharedConfig from "@repo/ui/tailwind.config";

export default {
  presets: [sharedConfig],
  content: [
    "./src/**/*.{ts,tsx,vue,svelte}",
    "../../packages/ui/src/**/*.{ts,tsx,vue,svelte}",
  ],
};
```

---

## Related Documentation

- [Tutorial](../../docs/TUTORIAL.md) - Step-by-step component usage guide
- [Standards](../../docs/STANDARDS.md) - Coding conventions
- [@repo/core](../core/README.md) - Core utilities and state management
