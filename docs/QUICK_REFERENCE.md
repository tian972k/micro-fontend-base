# Orbit Quick Reference Card

**TL;DR for busy engineers**

---

## 🚀 Start Developing (5 minutes)

```bash
git clone https://github.com/your-org/orbit.git
cd orbit
pnpm install
pnpm dev:all          # Start Shell + all MFEs
```

Then open <http://localhost:8000>

---

## 📋 Quick Navigation

| I need to...                | Go to...                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| Understand the system       | [ARCHITECTURE.md](docs/ARCHITECTURE.md) (15 min)                                               |
| Add a new MFE               | [MFE_DEVELOPMENT_GUIDE.md](docs/MFE_DEVELOPMENT_GUIDE.md) (5 min)                              |
| Build with React/Vue/Svelte | [MFE_ADAPTER_PATTERNS.md](docs/MFE_ADAPTER_PATTERNS.md) (10 min)                               |
| Make MFEs communicate       | [examples/typed-event-communication.ts](docs/examples/typed-event-communication.ts) (5 min)    |
| Learn enterprise patterns   | [ENTERPRISE_PATTERNS_INTERVIEW_GUIDE.md](docs/ENTERPRISE_PATTERNS_INTERVIEW_GUIDE.md) (1 hour) |
| Fix an issue                | [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) (2 min)                                          |
| Find what to read           | [DOCUMENTATION_MAP.md](docs/DOCUMENTATION_MAP.md) (5 min)                                      |

---

## 🎯 Core Concepts (30 seconds each)

### Hub-and-Spoke Architecture

- **Shell** (Remix) at center orchestrates
- **MFEs** (React/Vue/Svelte/Solid/Next) orbit around it
- **Shared packages** provide state + utilities

### Type-Safe Events

```typescript
// Define in @repo/core/src/contracts/runtime-events.ts
export type RuntimeEventMap = {
  "nav:navigate": { to: string };
};

// Emit (type-safe)
EventBus.emit("nav:navigate", { to: "/dashboard" });

// Listen (type-safe)
EventBus.subscribe("nav:navigate", (payload) => {
  // payload: { to: string }
});
```

### Mount/Unmount Contract

Every MFE exports:

```typescript
export const mount = (container: HTMLElement, props?: MfeProps) => {
  /* ... */
};
export const unmount = (container: HTMLElement) => {
  /* ... */
};
```

### Shared State

```typescript
import { userStore } from "@repo/core/shared";

// Read
const user = userStore.getState().user;

// Write
userStore.setState({ user: newUser });

// Listen
userStore.subscribe((state) => {
  /* ... */
});
```

---

## ⚡ Common Commands

```bash
# Development
pnpm dev:all                    # Start all apps
pnpm dev -- --filter=app-react # Start one app

# Building
pnpm build                      # Build all apps
pnpm build -- --filter=app-react

# Deployment
pnpm deploy                     # Deploy to Vercel

# Utilities
pnpm kill-ports                 # Free stuck ports
pnpm lint                       # Check code quality
pnpm test                       # Run tests

# Configuration
pnpm mfe:add                    # Add new MFE
pnpm mfe:validate               # Validate MFE setup
```

---

## 📦 Package Structure

```
orbit/
├── shell/                      # Remix app (entry point)
├── apps/
│   ├── app-react/             # React MFE
│   ├── app-vue/               # Vue MFE
│   ├── app-svelte/            # Svelte MFE
│   ├── app-solidjs/           # SolidJS MFE
│   └── app-nextjs/            # Next.js MFE
└── packages/
    ├── core/                  # Shared stores + EventBus
    ├── ui/                    # Multi-framework components
    ├── utils/                 # Helper functions
    └── config/                # MFE registry + constants
```

---

## 🔑 Key Files

| File                                            | Purpose                               |
| ----------------------------------------------- | ------------------------------------- |
| `packages/config/src/constants/apps.ts`         | MFE registry (single source of truth) |
| `packages/core/src/shared.ts`                   | Export shared API                     |
| `packages/core/src/contracts/runtime-events.ts` | Event type definitions                |
| `packages/core/src/stores/`                     | Zustand stores (user, theme, etc.)    |
| `apps/*/src/mfe.tsx`                            | MFE mount/unmount entry point         |
| `shell/src/mfe-host.tsx`                        | Shell's MFE loader                    |

---

## 🚨 Troubleshooting (60 seconds)

| Issue                   | Fix                                              |
| ----------------------- | ------------------------------------------------ |
| Port already in use     | `pnpm kill-ports`                                |
| MFE not loading         | Check browser console, restart MFE               |
| Module federation error | Verify `remoteEntry.js` exists                   |
| State not syncing       | Use `userStore.subscribe()` not direct listening |
| Styles not applying     | Check Tailwind config in shared + app            |

More: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

## 💡 Best Practices

✅ **DO:**

- Use EventBus for cross-MFE communication
- Wrap apps with error boundary
- Define events in `RuntimeEventMap`
- Use Zustand stores for shared state
- Test mount/unmount lifecycle

❌ **DON'T:**

- Import MFE code directly (breaks isolation)
- Mutate store state directly (use `setState`)
- Emit 100+ events/sec (use stores instead)
- Skip error boundaries
- Make breaking changes without versioning

---

## 🎓 Learning Path

**Day 1:** Run locally, navigate between MFEs, read ARCHITECTURE.md

**Day 2:** Pick a framework, read MFE_ADAPTER_PATTERNS.md for your framework

**Day 3:** Add an event to RuntimeEventMap, wire it across 2 MFEs

**Day 4:** Deploy an MFE, monitor metrics

**Week 2:** Read ENTERPRISE_PATTERNS_INTERVIEW_GUIDE.md, understand scaling

---

## 📊 Architecture at a Glance

```
┌─────────────────┐
│  Browser User   │
└────────┬────────┘
         │
    ┌────▼─────┐
    │   Shell  │ (Remix)
    │ :8000    │ (Orchestrates)
    └─┬──┬──┬──┬─┐
      │  │  │  │ │
   ┌──▼┐│  │  │ └──┬──┐
   │app││  │  │    │  │
   │react││  │  │    │  │
   └────┘│  │  │    │  │
        ┌▼──▼──▼────▼──▼──┐
        │ Shared Packages  │
        │ core, ui, config │
        └──────────────────┘

Dev:   Module Federation (fast reload)
Prod:  Manifest System (deterministic, cacheable)
```

---

## 🔗 Key Links

- **GitHub:** [your-org/orbit](https://github.com/your-org/orbit)
- **Docs:** [docs/DOCUMENTATION_MAP.md](docs/DOCUMENTATION_MAP.md)
- **Issues:** [GitHub Issues](https://github.com/your-org/orbit/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/orbit/discussions)

---

## ❓ Still Confused?

1. Check [DOCUMENTATION_MAP.md](docs/DOCUMENTATION_MAP.md) for your use case
2. Search [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
3. Open an issue with:
   - Error message / screenshot
   - Steps to reproduce
   - Link to [relevant doc](docs/DOCUMENTATION_MAP.md)

---

**Print this card. Bookmark the docs. Ship features! 🚀**
