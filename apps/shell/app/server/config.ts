import { PORTS, APP_IDS } from "@repo/config";

// MFE port mapping for production (exposed via docker-compose)
const MFE_PORTS: Record<string, number> = {
  [APP_IDS.REACT]: 8001,
  [APP_IDS.NEXTJS]: 8002,
  [APP_IDS.VUE]: 8003,
  [APP_IDS.SVELTE]: 8004,
  [APP_IDS.SOLIDJS]: 8005,
};

/**
 * Get app configuration for MFE loading.
 *
 * IMPORTANT: These URLs are used by the BROWSER (client-side) to fetch MFE assets.
 * Browser cannot resolve Docker internal hostnames like 'http://app-react'.
 *
 * Options:
 * 1. Development: http://localhost:{PORTS[appId]} (Vite dev server ports)
 * 2. Production (Docker): http://localhost:{MFE_PORTS[appId]} (exposed Docker ports)
 * 3. Production (Vercel): Relative paths like /react/, /vue/ (shell's vercel.json proxies these)
 */
export function getAppUrl(appId: string) {
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (isDevelopment) {
    // Development: use Vite dev server ports
    return `http://localhost:${(PORTS as any)[appId]}`;
  }

  // Production: determine deployment target
  if (process.env.VERCEL) {
    // Vercel deployment: use proxy paths via /api/proxy/[app]
    // This ensures proper error handling and health checks
    // /api/proxy/react/ → health check → https://app-react.vercel.app/
    const pathMap: Record<string, string> = {
      [APP_IDS.REACT]: "/api/proxy/react/",
      [APP_IDS.NEXTJS]: "/api/proxy/nextjs/",
      [APP_IDS.VUE]: "/api/proxy/vue/",
      [APP_IDS.SVELTE]: "/api/proxy/svelte/",
      [APP_IDS.SOLIDJS]: "/api/proxy/solid/",
    };
    return pathMap[appId] || `/api/proxy/${appId}/`;
  }

  // Docker Compose: use exposed ports
  // Browser accesses localhost:{exposed_port} which maps to container:80
  const mfePort = MFE_PORTS[appId];
  if (mfePort) {
    return `http://localhost:${mfePort}`;
  }

  // Fallback: should not reach here
  console.warn(`No URL configured for ${appId}`);
  return `http://localhost:${(PORTS as any)[appId]}`;
}

/**
 * Get app configuration for MFE loading.
 *
 * IMPORTANT: These URLs are used by the BROWSER (client-side) to fetch MFE assets.
 * Browser cannot resolve Docker internal hostnames like 'http://app-react'.
 *
 * Options:
 * 1. Development: http://localhost:{PORTS[appId]} (Vite dev server ports)
 * 2. Production (Docker): http://localhost:{MFE_PORTS[appId]} (exposed Docker ports)
 * 3. Production (Vercel): Relative paths like /react/, /vue/ (shell's vercel.json proxies these)
 */
export function getAppConfig() {
  return {
    apps: {
      [APP_IDS.REACT]: getAppUrl(APP_IDS.REACT),
      [APP_IDS.NEXTJS]: getAppUrl(APP_IDS.NEXTJS),
      [APP_IDS.VUE]: getAppUrl(APP_IDS.VUE),
      [APP_IDS.SVELTE]: getAppUrl(APP_IDS.SVELTE),
      [APP_IDS.SOLIDJS]: getAppUrl(APP_IDS.SOLIDJS),
    },
  };
}
