import { MFE_APPS, PORTS, type MfeApp } from "@repo/config";

/**
 * Runtime MFE registry for the shell, derived from MFE_APPS.
 *
 * The URLs returned here are used by the BROWSER to load MFE code, so
 * they must be reachable from the client (not Docker-internal hostnames).
 *
 * Resolution order for each app:
 * 1. MFE_URL_<ID> env var (e.g. MFE_URL_APP_REACT=https://cdn.example.com/react/v42)
 *    - read at request time, so one MFE can be repointed (rollback, canary,
 *      new release) without rebuilding or redeploying the shell.
 * 2. Development: the app's Vite dev server (http://localhost:<port>).
 * 3. Vercel: the shell's same-origin proxy (/api/proxy/<slug>/).
 * 4. Docker Compose / other: http://localhost:<port> (ports exposed by compose).
 */
export function getAppUrl(appId: string): string {
  const app = MFE_APPS.find((a) => a.id === appId);
  if (!app) {
    throw new Error(`Unknown MFE "${appId}" (not in MFE_APPS)`);
  }

  const override = process.env[envKeyFor(app)];
  if (override) return override;

  if (process.env.NODE_ENV !== "production") {
    return `http://localhost:${PORTS[app.id] ?? app.port}`;
  }
  if (process.env.VERCEL) {
    return `/api/proxy/${app.slug}/`;
  }
  return `http://localhost:${app.port}`;
}

/** MFE_URL_APP_REACT for app-react, etc. */
export function envKeyFor(app: Pick<MfeApp, "id">): string {
  return `MFE_URL_${app.id.replace(/-/g, "_").toUpperCase()}`;
}

export function getAppConfig() {
  return {
    apps: Object.fromEntries(
      MFE_APPS.map((app) => [app.id, getAppUrl(app.id)]),
    ) as Record<MfeApp["id"], string>,
  };
}
