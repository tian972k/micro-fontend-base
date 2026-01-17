import { PORTS, APP_IDS } from "@repo/config";

// This file is strictly for server-side usage in Remix loaders
export function getAppConfig() {
  return {
    apps: {
      [APP_IDS.REACT]: `http://localhost:${PORTS[APP_IDS.REACT]}`,
      [APP_IDS.NEXTJS]: `http://localhost:${PORTS[APP_IDS.NEXTJS]}`,
      [APP_IDS.VUE]: `http://localhost:${PORTS[APP_IDS.VUE]}`,
      [APP_IDS.SVELTE]: `http://localhost:${PORTS[APP_IDS.SVELTE]}`,
      [APP_IDS.SOLIDJS]: `http://localhost:${PORTS[APP_IDS.SOLIDJS]}`,
    },
  };
}
