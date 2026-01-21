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
export function getAppConfig() {
  const isDevelopment = process.env.NODE_ENV !== "production";

  const getAppUrl = (appId: string) => {
    if (isDevelopment) {
      // Development: use Vite dev server ports
      return `http://localhost:${(PORTS as any)[appId]}`;
    }

    // Production: determine deployment target
    if (process.env.VERCEL) {
      // Vercel deployment: use relative paths (shell's vercel.json will proxy)
      // /react/ → https://app-react.vercel.app/
      // /vue/  → https://app-vue.vercel.app/
      const pathMap: Record<string, string> = {
        [APP_IDS.REACT]: "/react/",
        [APP_IDS.NEXTJS]: "/next/",
        [APP_IDS.VUE]: "/vue/",
        [APP_IDS.SVELTE]: "/svelte/",
        [APP_IDS.SOLIDJS]: "/solid/",
      };
      return pathMap[appId] || `/${appId}/`;
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
  };

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
