# Vercel Deployment Troubleshooting - 500 Error on Refresh

## Issue

When refreshing `/dashboard/app-react` (or any MFE dashboard route) on Vercel, you get:

```
GET https://micro-fontend-base-shell.vercel.app/dashboard/app-react 500 (Internal Server Error)
```

## Root Cause

The shell app's loader tries to call `getAppConfig()` which reads environment variables that may not be set in Vercel.

## Solution - Immediate Fix ✅

**Status**: Fixed in commit `116ea6a`

Added error handling to all dashboard route loaders with fallback URLs:

- If `getAppConfig()` fails, use `/api/proxy/{app}/` paths
- Logs errors without breaking the page
- Works even without env vars set

## Vercel Configuration Checklist

### 1. Required Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these for the **shell** project:

| Variable               | Value                                               | Scope              |
| ---------------------- | --------------------------------------------------- | ------------------ |
| `VERCEL`               | `1`                                                 | Production         |
| `VITE_APP_REACT_HOST`  | `https://micro-fontend-base-app-react.vercel.app`   | Production         |
| `VITE_APP_NEXTJS_HOST` | `https://micro-fontend-base-app-nextjs.vercel.app`  | Production         |
| `VITE_APP_VUE_HOST`    | `https://micro-fontend-base-app-vue.vercel.app`     | Production         |
| `VITE_APP_SVELTE_HOST` | `https://micro-fontend-base-app-svelte.vercel.app`  | Production         |
| `VITE_APP_SOLID_HOST`  | `https://micro-fontend-base-app-solidjs.vercel.app` | Production         |
| `AVAILABLE_APPS`       | `react,vue,svelte,solid,nextjs`                     | Production, Deploy |

**Important**:

- Replace domain names with your actual Vercel deployment URLs
- These should match your individual MFE deployments
- `VERCEL=1` is automatically set by Vercel, but good to verify

### 2. Verify Each MFE is Deployed

Make sure all MFE apps are deployed separately:

```bash
# Check if each app is accessible
curl -I https://micro-fontend-base-app-react.vercel.app
curl -I https://micro-fontend-base-app-vue.vercel.app
curl -I https://micro-fontend-base-app-svelte.vercel.app
curl -I https://micro-fontend-base-app-solidjs.vercel.app
curl -I https://micro-fontend-base-app-nextjs.vercel.app
```

All should return `200 OK` or `404` (404 is ok, means app exists).

### 3. Shell Project Settings

Verify `apps/shell/vercel.json`:

```json
{
  "git": {
    "deploymentEnabled": false
  },
  "buildCommand": "cd ../.. && pnpm install && VERCEL=1 pnpm turbo run build --filter=shell",
  "installCommand": "npm i -g pnpm@9",
  "env": {
    "AVAILABLE_APPS": "react,vue,svelte,solid,nextjs",
    "VERCEL": "1"
  }
}
```

### 4. Test Proxy Endpoints

After deployment, test proxy routes:

```bash
# Should proxy to React app
curl https://micro-fontend-base-shell.vercel.app/api/proxy/react/

# Should proxy to Vue app
curl https://micro-fontend-base-shell.vercel.app/api/proxy/vue/
```

### 5. Check Vercel Logs

Go to Vercel Dashboard → Deployments → Your Deployment → Functions

Look for errors in:

- `apps/shell/app/routes/api/proxy/$/route.ts`
- `apps/shell/app/routes/dashboard/app-react/page.tsx`

Common errors:

- `MFE hosts not configured` → Env vars missing
- `App "react" is currently unavailable` → MFE app not deployed or down
- `Unknown app: react` → Proxy route misconfigured

## Testing After Fix

### 1. Test Dashboard Routes

Visit each dashboard route and refresh (F5):

- <https://micro-fontend-base-shell.vercel.app/dashboard/app-react>
- <https://micro-fontend-base-shell.vercel.app/dashboard/app-vue>
- <https://micro-fontend-base-shell.vercel.app/dashboard/app-svelte>
- <https://micro-fontend-base-shell.vercel.app/dashboard/app-solidjs>
- <https://micro-fontend-base-shell.vercel.app/dashboard/app-nextjs>

All should load without 500 errors.

### 2. Check Browser Console

Open DevTools → Console

Should see:

- ✅ No 500 errors
- ✅ MFE assets loading from proxy paths
- ⚠️ May see "Configuration error" logged (non-breaking)

### 3. Check Network Tab

Open DevTools → Network

Look for:

- `/api/proxy/react/` requests → Should get 200 or 503 (if MFE down)
- Static assets (`.js`, `.css`) → Should get 200

## Quick Fix Steps

If you're still seeing 500 errors:

1. **Redeploy shell with env vars:**

   ```bash
   cd apps/shell
   npx vercel --prod
   ```

2. **Check env vars are set:**

   ```bash
   vercel env ls
   ```

3. **View logs:**

   ```bash
   vercel logs micro-fontend-base-shell
   ```

4. **Force rebuild:**
   - Go to Vercel Dashboard
   - Find latest deployment
   - Click "..." → Redeploy

## Additional Resources

- [Deployment Guide](./DEPLOYMENT.md#vercel-deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Shell Proxy Route](/apps/shell/app/routes/api/proxy/$/route.ts)
- [Shell Config](/apps/shell/app/server/config.ts)

## Status

- ✅ Code fix deployed (commit `116ea6a`)
- ⚠️ Verify Vercel env vars are set
- ⚠️ Verify all MFE apps are deployed
- ⚠️ Test dashboard routes after redeploy
