# Conventions & Standards

## Code Style

- **Strict TypeScript**: No `any` (unless strictly necessary for boundary crossing).
- **ESLint**: Shared config from `@repo/config`.
- **Formatting**: Prettier on commit.

## UI Components

- **Single Source of Truth**: `@repo/ui`.
- **NO Local Components**: Do no copy-paste Button/Input code into `apps/*`. Import them.
- **Tailwind**: Use standard utility classes. Avoid arbitrary values (`w-[123px]`).

## Micro-Front-End Rules

1. **No Shell Imports**: An MFE must NEVER import code from `apps/shell`.
2. **No Peer Imports**: An MFE must NEVER import code from `apps/other-mfe`.
3. **Props vs Events**:
   - **Props**: Data passed down from Shell (Auth, Locale, Theme). READ ONLY.
   - **Events**: Actions meant to trigger side effects (Navigation, Notifications).

## Deployment

- **Health Check**: Every MFE MUST have a `public/health.json`.
- **Manifest**: Every MFE MUST output a `manifest.json` (or similar entry map).
