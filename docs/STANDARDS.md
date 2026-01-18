# 📏 Standards & Conventions

This document outlines the coding standards, structural conventions, and best practices for the **Orbit** platform.

## 1. Code Style

- **TypeScript**: Strict mode enabled. No explicit `any` unless absolutely necessary for boundary types.
- **Linting**: We use a shared ESLint config (`@repo/config`). Run `pnpm lint` before committing.
- **Formatting**: Prettier is enforced via Git hooks.

## 2. Naming Conventions

| Item            | Convention       | Example                             |
| :-------------- | :--------------- | :---------------------------------- |
| **Files**       | kebab-case       | `user-profile.tsx`, `login-form.ts` |
| **Directories** | kebab-case       | `components/ui/`, `features/auth/`  |
| **Components**  | PascalCase       | `UserProfile`, `LoginForm`          |
| **Functions**   | camelCase        | `handleSubmit`, `fetchData`         |
| **Constants**   | UPPER_SNAKE_CASE | `API_URL`, `MAX_RETRIES`            |

## 3. Application Structure

We follow a **Feature-Based** architecture. Group files by business logic rather than technical type.

```text
src/
  features/
    auth/
      components/    # UI specific to Auth
      hooks/         # Logic specific to Auth
      types.ts
      index.ts       # Public API
```

## 4. Micro-Frontend Rules

1. **Isolation**: An MFE must **NEVER** import code directly from `apps/shell` or another MFE. Communication happens via the EventBus or APIs.
2. **Props vs. Events**:
   - **Props**: Use for passing read-only context (Session, Theme) from Shell to MFE.
   - **Events**: Use for triggering side effects (Navigation, Notifications).
3. **Health Checks**: Every MFE must generate a `public/health.json` and `manifest.json` for production discovery.

## 5. UI & Styling

- **Library**: Use `@repo/ui` for all core components (Buttons, Inputs, Cards).
- **Styling**: Tailwind CSS is the standard. Avoid arbitrary values (e.g., `w-[123px]`) in favor of design tokens.
- **Theme**: Use CSS variables and `cn()` utility for conditional styling. Never hardcode hex colors to ensure Dark Mode compatibility.

## 6. Shared Utilities

- **Logging**: Use the centralized logger from `@repo/core`.

  ```ts
  import { logger } from "@repo/core";
  logger.info("Action performed", { meta: "data" });
  ```

- **State**: Use `@repo/core` for global state (User, Preferences).

## 7. Git Workflow

- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/).
  - `feat`: New feature
  - `fix`: Bug fix
  - `docs`: Documentation changes
  - `refactor`: Code change that neither fixes a bug nor adds a feature
- **Branches**: Format as `type/description` (e.g., `feat/new-sidebar`, `fix/login-error`).
