# Deployment Strategy

This architecture relies on **Independent Deployments** for every application.

## 1. Shared Packages
Shared packages (`packages/*`) are **NOT** deployed. They are build-time dependencies included in the application bundles.

## 2. Micro Apps (App A, App B)
Micro-Apps are deployed as **Static Sites**.

### Build Output
Running `pnpm build` in `apps/app-a` produces a `dist/` folder containing:
- `assets/entry-mfe.js`: The entry point script.
- `assets/*.css`: Styles.
- `health.json`: Static health check.
- `manifest.json`: Asset map.
- `index.html`: Fallback for standalone viewing (optional).

### Hosting
Upload the `dist/` folder to any static host:
- AWS S3 + CloudFront
- Vercel / Netlify (Output directory: `dist`)
- Nginx Static Server

### CORS
**CRITICAL**: You must enable CORS on the static host so the App Shell (running on a different domain) can fetch `json` and `js` files.

```nginx
# Nginx Example
add_header 'Access-Control-Allow-Origin' '*';
add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
```

## 3. App Shell
The Shell is a **Node.js** server (Remix App Server).

### Build Output
- `build/server`: Server-side code.
- `build/client`: Client-side assets.

### Runtime Environment
The Shell needs Environment Variables to know where Micro-Apps are hosted.

```env
PORT=3000
MFE_APP_A_URL="https://mfe-app-a.cdn.com"
MFE_APP_B_URL="https://mfe-app-b.cdn.com"
```

### Hosting
Deploy as a Node.js application:
- Docker Container
- AWS Fargate / ECS
- Vercel (Remix Preset)
- Fly.io

## 4. Updates & Rollbacks
- **Micro-Apps** can be deployed/rolled back independently.
- **Shell** picks up the changes immediately (if cache headers on MFE assets are configured correctly) or on next reload.
- **Atomic Deployments**: For strict versioning, update the Shell's env var to point to a new specific version URL of the MFE (e.g., `.../v1.2.3`).
