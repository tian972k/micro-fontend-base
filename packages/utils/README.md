# @repo/utils

Small framework-agnostic helpers.

## `cn(...inputs)`

Combines class names with [clsx](https://github.com/lukeed/clsx) and
resolves Tailwind conflicts with
[tailwind-merge](https://github.com/dcastil/tailwind-merge).

```ts
import { cn } from "@repo/utils";

cn("px-2 py-1", isActive && "bg-primary", className); // later classes win
cn("p-4", "p-2"); // "p-2"
```

Works in any framework (`class`, `className`, `:class`).

## Adding a helper

Keep it framework-agnostic and side-effect free, export it from
`src/index.ts`, and add it to this README.
