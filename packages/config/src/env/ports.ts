import { MFE_APPS, HOST_APP } from "../constants/apps";

/**
 * Centralized port configuration for all applications in the monorepo.
 * Auto-generated from MFE_APPS registry.
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

// Auto-generate PORTS from MFE_APPS and HOST_APP registry
const generatePorts = () => {
  const ports: Record<string, number> = {
    [HOST_APP.id]: getPort("SHELL_PORT", HOST_APP.port),
  };

  MFE_APPS.forEach((app) => {
    const envKey = app.id.replace("app-", "").toUpperCase() + "_PORT";
    ports[app.id] = getPort(envKey, app.port);
  });

  return ports;
};

export const PORTS = generatePorts();

export const getAppUrl = (appName: keyof typeof PORTS | string) => {
  const port = (PORTS as any)[appName] || 8000;
  return `http://localhost:${port}`;
};
