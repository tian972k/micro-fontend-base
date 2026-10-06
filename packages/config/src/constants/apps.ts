/**
 * Centralized registry of application IDs.
 * Use these constants instead of hardcoded strings to ensure consistency.
 *
 * To add a new MFE: add an entry to MFE_APPS (and the matching entry in
 * scripts/mfe.config.mjs - a unit test fails if they drift).
 */

// MFE App Registry - Single source of truth for all MFE apps.
// Everything else (ports, shell routes + nav, proxy paths, runtime URLs,
// federation remote names, build scripts) is derived from this list.
//
// - slug:        path segment under the shell proxy (/api/proxy/<slug>/)
//                and in VITE_APP_<SLUG>_HOST
// - type:        MicroAppType used to mount it (see @repo/core)
// - accent:      colour key the shell uses for the app page
export const MFE_APPS = [
  {
    id: "app-react",
    name: "React Dashboard",
    framework: "react",
    port: 8001,
    slug: "react",
    type: "react",
    title: "React Application",
    description: "Real-time React 18 island orchestrated by @repo/core.",
    accent: "primary",
  },
  {
    id: "app-nextjs",
    name: "Next.js App",
    framework: "nextjs",
    port: 8002,
    slug: "nextjs",
    type: "nextjs",
    title: "Next.js Application",
    description: "Hybrid Next.js app; its MFE bundle is built with Vite.",
    accent: "primary",
  },
  {
    id: "app-vue",
    name: "Vue Dashboard",
    framework: "vue",
    port: 8003,
    slug: "vue",
    type: "vue",
    title: "Vue Application",
    description: "Vue 3 island, synced with the shell's shared state.",
    accent: "emerald",
  },
  {
    id: "app-svelte",
    name: "Svelte Dashboard",
    framework: "svelte",
    port: 8004,
    slug: "svelte",
    type: "svelte",
    title: "Svelte Application",
    description: "Svelte 4 island participating in global state sync.",
    accent: "orange",
  },
  {
    id: "app-solidjs",
    name: "SolidJS Dashboard",
    framework: "solidjs",
    port: 8005,
    slug: "solid",
    type: "solid",
    title: "SolidJS Application",
    description: "Fine-grained reactive SolidJS island.",
    accent: "blue",
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

export type MfeApp = (typeof MFE_APPS)[number];

/** Module Federation container name for an app id (app-react -> app_react). */
export const toFederationName = (id: string) => id.replace(/-/g, "_");
