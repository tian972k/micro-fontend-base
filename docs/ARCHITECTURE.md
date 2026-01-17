# Project Architecture & Standards

This document defines the architectural standards for the Micro-Frontend Monorepo. All contributors must adhere to these guidelines to maintain a scalable, "Senior"-level codebase.

## 1. Core Principles

- **Feature-Based Architecture**: Code is organized by **Feature** (domain) rather than just by technical type (components vs hooks).
- **Encapsulation**: Features should be self-contained. Avoid deep imports between features. Use shared `core` or `lib` for cross-feature communication.
- **Thin Routes**: Route files (pages) should only handle data loading and routing logic. The UI implementation should live in `features/` or `components/`.
- **Strict Typing**: All code must be strongly typed (TypeScript).

## 2. Shell Application (Remix)

Path: `apps/shell`

The Shell application orchestrates the micro-frontends. It follows a modified feature-based structure compatible with Remix's file-system routing.

```text
apps/shell/app/
├── components/          # Shared, generic UI components
│   ├── layout/          # Layout-specific components (Sidebar, Navbar, Footer)
│   └── ui/              # Primitive UI components (Buttons, Inputs)
├── features/            # Feature-Specific Dependencies
│   ├── auth/            # Authentication logic, forms, and contexts
│   └── dashboard/       # Dashboard widgets and specific logic
├── hooks/               # Global, shared hooks (e.g., useTheme)
├── lib/                 # Pure utility functions, constants, formatting
├── routes/              # Remix Routes (Keep these files minimal!)
├── services/            # API/Backend integration services
├── store/               # Global state managers (Zustand, etc.)
└── types/               # Shared type definitions for the app
```

### Rules for Shell

- **Do not** write complex UI logic inside `routes/*.tsx`. Import a view component from `features/` or `components/`.
- **Do not** put feature-specific components in `components/`. Put them in `features/<feature-name>/components/`.

## 3. Micro-Frontends (MFE) Structure

All micro-frontends (`apps/app-*`) must follow a consistent internal structure, regardless of the framework (React, Vue, Svelte).

### React / Generic Structure (`apps/app-a`, `apps/app-b`)

```text
src/
├── components/          # Shared components used across multiple pages/features
├── features/            # Domain-specific modules
│   └── [feature-name]/
│       ├── components/  # Components specific to this feature
│       ├── hooks/       # Hooks specific to this feature
│       └── [Feature].tsx
├── layouts/             # Page layouts (if MFE has its own routing/layout)
├── lib/                 # Utilities and helper functions
├── services/            # API calls
├── types/               # Shared types
└── App.tsx              # Entry point
```

### Vue Structure (`apps/app-c`)

```text
src/
├── components/          # Global Vue components
├── composables/         # Shared composables (hooks)
├── features/            # Domain features
├── layouts/             # Layout components
├── views/             # Page views
└── App.vue              # Entry point
```

### Svelte Structure (`apps/app-d`)

```text
src/
├── lib/                 # Svelte standard for shared code
│   ├── components/
│   ├── stores/
│   └── utils/
├── routes/              # If using SvelteKit-like routing or just Views
└── App.svelte
```

## 4. Coding Standards

- **File Naming**:
  - React Components: `PascalCase.tsx` (e.g., `AppSidebar.tsx`)
  - Functions/Hooks/Utils: `kebab-case.ts` (e.g., `use-auth.ts`, `format-date.ts`)
  - Remix Routes: `kebab-case.route.tsx`
- **Exports**: Use Named Exports (`export const ...`) over Default Exports, except for Remix Route pages and Lazy loaded components which require default exports.
- **Imports**: Use absolute imports `@/` where configured.

## 5. Adding a New MFE

When running `pnpm create-app`, the generated app _must_ be refactored to match this directory structure immediately.
