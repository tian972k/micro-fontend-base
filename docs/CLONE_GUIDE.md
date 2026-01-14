# Clone Guide

How to use this repository as a base for new projects.

## 1. Clone & Rename
```bash
git clone <repo-url> new-project
cd new-project
rm -rf .git
git init
```

## 2. Update Names
- Update `name` in `package.json`.
- Update `package.json` in `apps/shell`.

## 3. Adding a New Micro App

### Option A: Standard Vite App
1. Copy `apps/app-a` to `apps/new-app`.
2. Update `package.json` name.
3. Update `vite.config.ts` port.
4. Add to Shell `.env`: `MFE_NEW_APP_URL="http://localhost:xxxx"`.
5. Create Shell route: `apps/shell/app/routes/new-app.tsx`.

### Option B: Next.js Hybrid App
1. Copy `apps/app-b` to `apps/new-app`.
2. Update `package.json` name.
3. Update `next.config.js` and `vite.config.ts`.
