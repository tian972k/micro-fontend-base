import { APP_IDS } from "../constants/apps";

/**
 * Centralized port configuration for all applications in the monorepo.
 * Values are read from environment variables with sensible defaults.
 */

interface ViteEnv {
  [key: string]: string | undefined;
}

const getPort = (envVar: string, defaultPort: number): number => {
  if (typeof process !== "undefined" && process.env[envVar]) {
    return parseInt(process.env[envVar] as string, 10);
  }

  // Vite specific way to read env
  if (typeof import.meta !== "undefined") {
    const meta = import.meta as unknown as { env?: ViteEnv };
    if (meta.env) {
      const viteVar = `VITE_${envVar}`;
      if (meta.env[viteVar]) {
        return parseInt(meta.env[viteVar] as string, 10);
      }
      if (meta.env[envVar]) {
        return parseInt(meta.env[envVar] as string, 10);
      }
    }
  }
  return defaultPort;
};

export const PORTS = {
  [APP_IDS.SHELL]: getPort("SHELL_PORT", 8000),
  [APP_IDS.REACT]: getPort("APP_REACT_PORT", 8001),
  [APP_IDS.NEXTJS]: getPort("APP_NEXTJS_PORT", 8002),
  [APP_IDS.VUE]: getPort("APP_VUE_PORT", 8003),
  [APP_IDS.SVELTE]: getPort("APP_SVELTE_PORT", 8004),
  [APP_IDS.SOLIDJS]: getPort("APP_SOLIDJS_PORT", 8005),
} as const;

export const getAppUrl = (appName: keyof typeof PORTS | string) => {
  const port = (PORTS as any)[appName] || 8000;
  return `http://localhost:${port}`;
};
