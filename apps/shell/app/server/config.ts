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
 * 3. Production (Cloud): Use public URLs from environment variables
 */
export function getAppConfig() {
  const isDevelopment = process.env.NODE_ENV !== "production";

  const getAppUrl = (appId: string) => {
    // Check for explicit public URL from environment (e.g., Kubernetes, Cloud)
    const envKey = `MFE_${appId.toUpperCase().replace(/-/g, "_")}_PUBLIC_URL`;
    const publicUrl = process.env[envKey];
    if (publicUrl) {
      return publicUrl;
    }

    if (isDevelopment) {
      // Development: use Vite dev server ports
      return `http://localhost:${(PORTS as any)[appId]}`;
    }

    // Production (Docker Compose): use exposed ports
    // Browser accesses localhost:{exposed_port} which maps to container:80
    const mfePort = MFE_PORTS[appId];
    if (mfePort) {
      return `http://localhost:${mfePort}`;
    }

    // Fallback: should not reach here
    console.warn(`No public URL configured for ${appId}`);
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
