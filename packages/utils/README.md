# @repo/utils

Shared utility functions and helpers for the Orbit Micro-Frontend Platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Available Utilities](#available-utilities)
4. [Usage Examples](#usage-examples)
5. [API Reference](#api-reference)

---

## Overview

`@repo/utils` provides framework-agnostic utility functions used across all micro-frontends and packages in the monorepo.

### Key Features

- **Tailwind Utilities**: Class name merging with `cn()`
- **Date Utilities**: Date formatting and manipulation via `dayjs`
- **Type-Safe**: Full TypeScript support
- **Tree-Shakeable**: Import only what you need
- **Zero Runtime Dependencies** (except clsx and tailwind-merge)

---

## Installation

The package is automatically available in the monorepo. No additional installation needed.

```json
// In your app's package.json
{
  "dependencies": {
    "@repo/utils": "workspace:*"
  }
}
```

---

## Available Utilities

### Class Name Utilities

#### `cn(...inputs: ClassValue[]): string`

Merges Tailwind CSS class names intelligently, handling conflicts and conditional classes.

**Features:**

- Merges multiple class names
- Resolves Tailwind conflicts (e.g., `px-2 px-4` → `px-4`)
- Supports conditional classes
- Removes falsy values

**Example:**

```typescript
import { cn } from "@repo/utils";

// Basic usage
cn("px-2 py-1", "bg-blue-500");
// → "px-2 py-1 bg-blue-500"

// Conflict resolution
cn("px-2", "px-4");
// → "px-4"

// Conditional classes
cn("text-base", isActive && "font-bold", error && "text-red-500");
// → "text-base font-bold" (if isActive=true, error=false)

// Array syntax
cn(["flex", "items-center"], { "justify-between": true, "gap-2": false });
// → "flex items-center justify-between"
```

### Date Utilities

The package includes `dayjs` for date manipulation. Import it directly:

```typescript
import dayjs from "dayjs";

const now = dayjs();
const formatted = dayjs("2024-01-20").format("YYYY-MM-DD");
const isPast = dayjs("2024-01-20").isBefore(dayjs());
```

**Common dayjs Operations:**

```typescript
// Formatting
dayjs().format("YYYY-MM-DD HH:mm:ss");
dayjs().format("MMM DD, YYYY");

// Manipulation
dayjs().add(7, "day");
dayjs().subtract(1, "month");
dayjs().startOf("month");

// Comparison
dayjs("2024-01-20").isBefore(dayjs());
dayjs("2024-01-20").isAfter("2023-12-01");
dayjs("2024-01-20").isSame("2024-01-20", "day");

// Relative time (requires plugin)
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
dayjs().fromNow(); // "a few seconds ago"
```

---

## Usage Examples

### In React Components

```tsx
import { cn } from "@repo/utils";
import dayjs from "dayjs";

function UserCard({ user, isActive, className }) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        isActive ? "border-green-500 bg-green-50" : "border-gray-300",
        className,
      )}
    >
      <h3 className={cn("text-lg font-semibold", isActive && "text-green-700")}>
        {user.name}
      </h3>
      <p className="text-sm text-gray-600">
        Joined {dayjs(user.createdAt).format("MMM DD, YYYY")}
      </p>
    </div>
  );
}
```

### In Vue Components

```vue
<script setup lang="ts">
import { cn } from "@repo/utils";
import dayjs from "dayjs";

const props = defineProps<{
  user: User;
  isActive: boolean;
}>();

const cardClass = computed(() =>
  cn(
    "rounded-lg border p-4",
    props.isActive ? "border-green-500 bg-green-50" : "border-gray-300",
  ),
);
</script>

<template>
  <div :class="cardClass">
    <h3>{{ user.name }}</h3>
    <p>Joined {{ dayjs(user.createdAt).format("MMM DD, YYYY") }}</p>
  </div>
</template>
```

### In Svelte Components

```svelte
<script lang="ts">
  import { cn } from "@repo/utils";
  import dayjs from "dayjs";

  export let user: User;
  export let isActive = false;

  $: cardClass = cn(
    "rounded-lg border p-4",
    isActive ? "border-green-500 bg-green-50" : "border-gray-300"
  );
</script>

<div class={cardClass}>
  <h3>{user.name}</h3>
  <p>Joined {dayjs(user.createdAt).format("MMM DD, YYYY")}</p>
</div>
```

### In SolidJS Components

```tsx
import { cn } from "@repo/utils";
import dayjs from "dayjs";
import { createMemo } from "solid-js";

function UserCard(props: { user: User; isActive: boolean }) {
  const cardClass = createMemo(() =>
    cn(
      "rounded-lg border p-4",
      props.isActive ? "border-green-500 bg-green-50" : "border-gray-300",
    ),
  );

  return (
    <div class={cardClass()}>
      <h3>{props.user.name}</h3>
      <p>Joined {dayjs(props.user.createdAt).format("MMM DD, YYYY")}</p>
    </div>
  );
}
```

---

## API Reference

### Functions

#### `cn(...inputs: ClassValue[]): string`

Merges class names using `clsx` and resolves Tailwind conflicts with `tailwind-merge`.

**Parameters:**

- `...inputs: ClassValue[]` - Any number of class values (strings, objects, arrays, etc.)

**Returns:**

- `string` - Merged class names with conflicts resolved

**Type Definition:**

```typescript
type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | null
  | boolean
  | undefined;

type ClassDictionary = Record<string, any>;
type ClassArray = ClassValue[];

function cn(...inputs: ClassValue[]): string;
```

---

## Adding New Utilities

To add new utility functions:

1. **Add function to `src/index.ts`**:

```typescript
// packages/utils/src/index.ts
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}
```

1. **Update this README** with documentation

2. **Export from package**:

```json
// package.json - exports are already configured
{
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./dist/index.js"
    }
  }
}
```

1. **Use in apps**:

```typescript
import { formatCurrency } from "@repo/utils";

console.log(formatCurrency(1234.56)); // "$1,234.56"
```

---

## Best Practices

1. **Keep utilities pure**: Functions should be deterministic with no side effects
2. **Type everything**: Use TypeScript for all utilities
3. **Document thoroughly**: Add JSDoc comments for complex functions
4. **Test your utilities**: Add unit tests for critical functions
5. **Avoid framework dependencies**: Keep utilities framework-agnostic

---

## Dependencies

| Package            | Version | Purpose                            |
| ------------------ | ------- | ---------------------------------- |
| **clsx**           | ^2.0.0  | Conditional class names            |
| **tailwind-merge** | ^2.0.0  | Tailwind class conflict resolution |
| **dayjs**          | ^1.11.x | Date manipulation                  |

---

## Related Packages

- [@repo/core](../core/README.md) - State management and event bus
- [@repo/ui](../ui/README.md) - Multi-framework UI components
- [@repo/config](../config/README.md) - Shared configurations

---

## Contributing

When adding utilities:

1. Ensure they are framework-agnostic
2. Add TypeScript types
3. Update this README
4. Consider bundle size impact
5. Test across different frameworks

---

## License

MIT - Part of the Orbit Micro-Frontend Platform
