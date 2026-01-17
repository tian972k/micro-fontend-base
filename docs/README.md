# 📚 Documentation

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run all apps
pnpm dev

# Run specific app
pnpm dev:shell   # Shell (port 8000)
pnpm dev:a       # App A (port 8001)

# Create new app
pnpm create-app

# Generate UI component
cd packages/ui && pnpm generate
```

## 🏗️ Architecture

**Micro-Front-End** platform using **Module Federation** for runtime dependency sharing.

```text
├── apps/
│   ├── shell/    # Host (Remix)
│   ├── app-a/    # React MFE
│   ├── app-b/    # Next.js MFE
│   ├── app-c/    # Vue MFE
│   └── app-d/    # Svelte MFE
├── packages/
│   ├── core/     # State & MFE utilities
│   ├── ui/       # Design system
│   ├── utils/    # Shared helpers
│   └── config/   # Shared configs
```

**Key Concepts:**

- **Host (Shell)**: Remix app that loads remote apps
- **Remotes**: Independent apps exposing components via Module Federation
- **Shared Dependencies**: React, Core libraries shared at runtime
- **State Management**: Zustand (vanilla) with framework adapters

## 🛠️ Development

### Creating New App

```bash
pnpm create-app
```

**Steps:**

1. Choose framework (React/Vue/Svelte)
2. Enter app name (kebab-case)
3. Auto-configures everything
4. Update port in `vite.config.ts`
5. Register in Shell's `remotes.config.ts`

### Creating UI Component

```bash
cd packages/ui
pnpm generate
```

Supports React, Vue, Svelte with auto-generated Storybook stories.

### Code Standards

- **TypeScript**: Strict mode, no `any`
- **Components**: Feature-based structure
- **State**: Use `@repo/core` shared state
- **Styling**: Tailwind CSS
- **Commits**: Conventional commits format

### Module Federation

Each remote exposes `./entry-mfe` module:

```typescript
// vite.config.ts
federation({
  name: 'app-name',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/entry-mfe.tsx'
  },
  shared: ['react', 'react-dom', '@repo/core']
})
```

## 🚀 Deployment

### Build

```bash
pnpm build
```

### Docker

```bash
docker-compose up
```

### Environment Variables

```bash
# apps/shell/.env
VITE_APP_A_URL=http://localhost:8001/assets/remoteEntry.js
VITE_APP_B_URL=http://localhost:8002/assets/remoteEntry.js
```

## 🧠 State Management

**Shared State** (`@repo/core/shared`):

```typescript
import { userStore } from '@repo/core/shared';

// Subscribe
userStore.subscribe(state => console.log(state.user));

// Update
userStore.getState().setUser({ name: 'John' });
```

**React Hook** (`@repo/core/store/react`):

```typescript
import { useUserStore } from '@repo/core/store/react';

const user = useUserStore(state => state.user);
```

## 📦 Packages

- **@repo/core**: State management, MFE utilities
- **@repo/ui**: Shared UI components (shadcn/ui)
- **@repo/utils**: Helper functions
- **@repo/config**: TypeScript, Tailwind configs

## 🔧 Common Issues

**Port conflict**: Change port in `vite.config.ts`

**Module not found**: Check `shared` in Module Federation config

**Type errors**: Run `pnpm install` after pulling changes

**Build fails**: Clear `.turbo` cache: `pnpm clean`

## 🔗 Resources

- [Turborepo](https://turbo.build/repo/docs)
- [Module Federation](https://module-federation.io/)
- [Vite](https://vitejs.dev/)
- [Storybook](http://localhost:6006) - Run `pnpm storybook`
