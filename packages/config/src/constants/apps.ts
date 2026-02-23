/**
 * Centralized registry of application IDs.
 * Use these constants instead of hardcoded strings to ensure consistency.
 *
 * To add a new MFE:
 * 1. Add entry to MFE_APPS array
 * 2. Add port to PORTS in env/ports.ts
 * 3. Run `pnpm dev:all` to generate manifest
 */

// MFE App Registry - Single source of truth for all MFE apps
export const MFE_APPS = [
  { id: "app-react", name: "React Dashboard", framework: "react", port: 8001 },
  { id: "app-nextjs", name: "Next.js App", framework: "nextjs", port: 8002 },
  { id: "app-vue", name: "Vue Dashboard", framework: "vue", port: 8003 },
  {
    id: "app-svelte",
    name: "Svelte Dashboard",
    framework: "svelte",
    port: 8004,
  },
  {
    id: "app-solidjs",
    name: "SolidJS Dashboard",
    framework: "solidjs",
    port: 8005,
  },
] as const;

// Host app
export const HOST_APP = {
  id: "shell",
  name: "Shell Host",
  framework: "remix",
  port: 8000,
} as const;

// Type-safe MFE app IDs generation
type MfeAppKey = "REACT" | "NEXTJS" | "VUE" | "SVELTE" | "SOLIDJS";
type GeneratedAppIds = Record<MfeAppKey, string>;

const generateAppIds = (): GeneratedAppIds => {
  const ids = {} as any;
  MFE_APPS.forEach((app) => {
    const key = app.id.replace("app-", "").toUpperCase();
    ids[key] = app.id;
  });
  return ids;
};

// Auto-generate APP_IDS from registry with type safety
export const APP_IDS = {
  SHELL: HOST_APP.id,
  ...generateAppIds(),
} as const;

export type AppId = (typeof APP_IDS)[keyof typeof APP_IDS];
export type MfeAppId = (typeof MFE_APPS)[number]["id"];
export type Framework = (typeof MFE_APPS)[number]["framework"] | "remix";

// Helper functions
export const getMfeApp = (id: MfeAppId) =>
  MFE_APPS.find((app) => app.id === id);
export const getAllMfeIds = () => MFE_APPS.map((app) => app.id);
export const isMfeApp = (id: string): id is MfeAppId =>
  MFE_APPS.some((app) => app.id === id);
