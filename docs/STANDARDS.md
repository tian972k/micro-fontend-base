# Coding Standards & Guidelines

This document outlines the standards required to maintain a high-quality, consistent codebase across all micro-front-ends.

## 1. Naming Conventions

| Item            | Convention       | Example                             |
| :-------------- | :--------------- | :---------------------------------- |
| **Files**       | kebab-case       | `user-profile.tsx`, `login-form.ts` |
| **Directories** | kebab-case       | `components/ui/`, `features/auth/`  |
| **Components**  | PascalCase       | `UserProfile`, `LoginForm`          |
| **Functions**   | camelCase        | `handleSubmit`, `fetchData`         |
| **Constants**   | UPPER_SNAKE_CASE | `API_URL`, `MAX_RETRIES`            |

## 2. Project Structure

We follow a **Feature-Based** architecture. Don't group by file type (e.g., all components in one folder). Group by feature.

```text
src/
  features/
    auth/
      components/
        login-form.tsx
      hooks/
        use-login.ts
      types.ts
      index.ts
```

## 3. UI & Styling

### Design System

- Always use components from `@repo/ui` first.
- Do not install generic UI libraries (like Bootstrap, MUI) in individual apps.
- Use **Tailwind CSS** for layout and custom spacing.

### Theme

- Use CSS variables for colors (e.g., `bg-primary`, `text-foreground`).
- **Never hardcode hex colors** (except in the theme definition). This ensures Dark Mode compatibility.

## 4. Logging

Use the **Centralized Logger** from `@repo/core` instead of `console.log`.

```typescript
import { logger } from "@repo/core";

// Good
logger.info("User logged in", { userId: 123 });
logger.error("Failed to fetch data", error);

// Bad
console.log("User logged in");
```

## 5. State Management

- **Local State**: Use `useState` or `useReducer`.
- **Global App State (Single MFE)**: Use `zustand` created locally.
- **Global Platform State (Cross-MFE)**: Use `@repo/core` store.

## 6. Git Workflow

- **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/).
  - `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- **Branches**: `feature/my-feature`, `fix/issue-123`.
