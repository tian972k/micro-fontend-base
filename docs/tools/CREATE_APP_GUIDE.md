# 🚀 Create App CLI Guide

Enterprise-grade CLI tool for scaffolding new Micro-Front-End applications with automatic configuration.

---

## ✨ Features

- 🎨 **Framework Selection**: Choose from React, Vue, or Svelte
- 🔄 **Template Cloning**: Based on proven, production-ready apps
- ⚙️ **Auto-Configuration**: Updates root package.json scripts automatically
- 🧹 **Smart Cleanup**: Removes template artifacts and build outputs
- 📝 **Manifest Update**: Configures Module Federation manifest
- ✅ **Validation**: Ensures naming conventions and prevents conflicts

---

## 🎯 Usage

### Quick Start

```bash
# From project root
pnpm create-app
```

### Interactive Prompts

1. **App Name** (kebab-case)

   ```text
   📦 App Name: trade-desk
   ```

   - Must be lowercase, numbers, and dashes only
   - Checks for duplicates automatically

2. **Framework Selection**

   ```text
   🎨 Choose Framework:
     1. React (Vite + Remix)
     2. Vue 3 (Vite + Composition API)
     3. Svelte (Vite + SvelteKit)
   
   Your choice (1-3): 1
   ```

### What Gets Created

```text
apps/
└── your-app-name/
    ├── src/
    │   ├── App.tsx|vue|svelte
    │   ├── entry-mfe.tsx|ts
    │   ├── main.tsx|ts
    │   └── ...
    ├── public/
    │   ├── health.json
    │   └── manifest.json (auto-configured)
    ├── package.json (updated with app name)
    ├── vite.config.ts
    ├── tsconfig.json
    └── README.md
```

---

## 🔧 Automatic Configuration

### 1. Root package.json

Automatically adds a dev script for your app:

```json
{
  "scripts": {
    "dev:your-app": "turbo run dev --filter=your-app"
  }
}
```

### 2. package.json (App)

Updates app's package.json:

```json
{
  "name": "your-app",
  "version": "0.1.0"
}
```

### 3. public/manifest.json

Configures Module Federation:

```json
{
  "name": "your-app",
  "entry": "./your-app/entry-mfe"
}
```

### 4. Cleanup

Automatically removes:

- `node_modules/`
- `pnpm-lock.yaml`
- `.turbo/`
- `dist/`
- `build/`

---

## 📋 Post-Creation Checklist

After running `pnpm create-app`:

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Port (Optional)

Edit `apps/your-app/vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 8005, // Change to your preferred port
  }
})
```

### 3. Update Module Federation (If needed)

Edit `apps/your-app/vite.config.ts`:

```typescript
federation({
  name: 'your-app',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/entry-mfe.tsx',
  },
})
```

### 4. Register in Shell

Edit `apps/shell/app/remotes.config.ts`:

```typescript
export const REMOTES = {
  // ... existing
  'your-app': {
    url: 'http://localhost:8005/assets/remoteEntry.js',
    format: 'esm',
  },
}
```

### 5. Run Your App

```bash
# Run only your app
pnpm dev:your-app

# Or run all apps
pnpm dev
```

---

## 🎨 Framework Templates

### React Template (from app-a)

- ⚛️ React 18
- ⚡ Vite 5
- 🎨 Tailwind CSS
- 📦 Module Federation
- 🔧 TypeScript

### Vue Template (from app-c)

- 🟢 Vue 3 Composition API
- ⚡ Vite 5
- 🎨 Tailwind CSS
- 📦 Module Federation
- 🔧 TypeScript

### Svelte Template (from app-d)

- 🔴 Svelte 4
- ⚡ Vite 5
- 📦 Module Federation
- 🔧 TypeScript

---

## ⚠️ Important Notes

### Naming Conventions

- ✅ **Valid**: `trade-desk`, `user-profile`, `analytics-dashboard`
- ❌ **Invalid**: `TradDesk`, `trade_desk`, `Trade-Desk`

### Port Management

Each app needs a unique port. Default ports:

- Shell: 8000
- App A: 8001
- App B: 8002
- App C: 8003
- App D: 8004
- **Your new app**: 8005+ (configure manually)

### Module Federation

After creating a new app, you must:

1. Configure the app's Federation plugin
2. Register the remote in the Shell's `remotes.config.ts`

---

## 🐛 Troubleshooting

### App name already exists

```text
❌ App "trade-desk" already exists!
```

**Solution**: Choose a different name or remove the existing app.

### Invalid framework choice

```text
❌ Invalid framework choice.
```

**Solution**: Enter 1, 2, or 3 only.

### Port conflict

If your app fails to start due to port conflict:

1. Check `vite.config.ts` in your app
2. Change the port to an unused one (8005, 8006, etc.)
3. Update Shell's `remotes.config.ts` with the new port

---

## 🔗 Related Documentation

- [Project Structure](../docs/PROJECT_STRUCTURE.md)
- [MFE Lifecycle](../docs/MFE_LIFECYCLE.md)
- [Conventions](../docs/CONVENTIONS.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)

---

## 💡 Tips

1. **Use descriptive names**: `trading-dashboard` is better than `app-e`
2. **Follow domain structure**: Group by business domain, not tech
3. **Keep it simple**: Start with the template, customize incrementally
4. **Test isolation**: Run `pnpm dev:your-app` to test standalone
5. **Federation first**: Design your exposed modules from the start

---

**Happy coding!** 🚀
