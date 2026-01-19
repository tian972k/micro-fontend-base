import { APP_IDS } from "../constants/apps.js";

/**
 * Centralized port configuration for all applications in the monorepo.
 * Values are read from environment variables with sensible defaults.
 */

interface ViteEnv {
  [key: string]: string | undefined;
}

const getPort = (envVar: string, defaultPort: number): number => {
  // CommonJS / Node.js / Next.js
  if (typeof process !== "undefined" && process.env[envVar]) {
    return parseInt(process.env[envVar] as string, 10);
  }

  // Vite
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const metaEnv = import.meta.env as ViteEnv;
    const viteVar = `VITE_${envVar}`;
    if (metaEnv[viteVar]) {
      return parseInt(metaEnv[viteVar] as string, 10);
    }
    if (metaEnv[envVar]) {
      return parseInt(metaEnv[envVar] as string, 10);
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
