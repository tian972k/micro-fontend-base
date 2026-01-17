# @repo/config

Shared configuration presets for tooling and platform behavior.

## Features

### 1. Shared Dependencies (`baseShared`)

A definitive list of dependencies that should be shared via Module Federation to ensure singleton instances across the application.

**Usage in `vite.config.ts`:**

```typescript
import { baseShared } from "@repo/config";

export default defineConfig({
  plugins: [
    federation({
      shared: [...baseShared, "additional-lib"],
    }),
  ],
});
```

**Includes**: `react`, `react-dom`, `lodash`, `dayjs`, `@repo/core`, `@repo/ui`, `@repo/utils`.

### 2. Environment Constants

Shared constants for port numbers to avoid collisions during local development.

```typescript
import { Ports } from "@repo/config";

// Ports.SHELL -> 8000
// Ports.APP_A -> 8001
// ...
```

### 3. ESLint Presets

Standardized linting rules for React, Next.js, and Library packages.

### 4. TypeScript Configurations

Base `tsconfig` files (`base.json`, `react-library.json`, `nextjs.json`) to ensure consistent compilation settings.
