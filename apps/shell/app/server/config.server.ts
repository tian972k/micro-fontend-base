import { PORTS } from "@repo/config";

// This file is strictly for server-side usage in Remix loaders
export function getAppConfig() {
  return {
    apps: {
      "app-a": `http://localhost:${PORTS.APP_A}`,
      "app-b": `http://localhost:${PORTS.APP_B}`,
      "app-c": `http://localhost:${PORTS.APP_C}`,
      "app-d": `http://localhost:${PORTS.APP_D}`,
    },
  };
}
