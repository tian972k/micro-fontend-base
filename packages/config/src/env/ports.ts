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
  SHELL: getPort("SHELL_PORT", 8000),
  APP_A: getPort("APP_A_PORT", 8001),
  APP_B: getPort("APP_B_PORT", 8002),
  APP_C: getPort("APP_C_PORT", 8003),
  APP_D: getPort("APP_D_PORT", 8004),
} as const;

export const getAppUrl = (appName: keyof typeof PORTS | string) => {
  const portKey = appName.toUpperCase().replace("-", "_") as keyof typeof PORTS;
  const port = PORTS[portKey] || 8000;
  return `http://localhost:${port}`;
};
