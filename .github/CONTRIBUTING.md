# Contributing

Keep this lightweight. For most changes:

```mermaid
flowchart LR
    A[Create Branch] --> B[Make Changes]
    B --> C[Run Lint & Type Check]
    C --> D[Open PR]
```

## Quick Steps

```bash
pnpm install
pnpm dev:all
pnpm lint
pnpm type-check
```

## PR Notes

- Keep diffs small and focused
- Update docs when behavior changes
