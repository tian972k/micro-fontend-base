import { PORTS, APP_IDS } from "@repo/config";

// This file is strictly for server-side usage in Remix loaders
export function getAppConfig() {
  const isDevelopment = process.env.NODE_ENV !== "production";
  
  // In production (Docker), use service names. In dev, use localhost with ports
  const getAppUrl = (appId: string) => {
    if (isDevelopment) {
      return `http://localhost:${(PORTS as any)[appId]}`;
    }
    // In production, use Docker service names (no port needed, nginx runs on 80)
    // Services are named as app-react, app-nextjs, etc. in docker-compose.yml
    return `http://${appId}`;
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
