/**
 * Centralized registry of application IDs.
 * Use these constants instead of hardcoded strings to ensure consistency.
 */
export const APP_IDS = {
  SHELL: "shell",
  REACT: "app-react",
  NEXTJS: "app-nextjs",
  VUE: "app-vue",
  SVELTE: "app-svelte",
  SOLIDJS: "app-solidjs",
} as const;

export type AppId = (typeof APP_IDS)[keyof typeof APP_IDS];
