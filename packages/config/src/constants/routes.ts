import { APP_IDS } from "./apps";

/**
 * Centralized registry of application routes.
 * Use these constants instead of hardcoded strings to ensure consistency.
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  LOGOUT: "/logout",
  DASHBOARD: "/dashboard",
  EXAMPLE: "/example",
  SETTINGS: "/dashboard/settings",

  // MFE App routes
  APP_REACT: `/dashboard/${APP_IDS.REACT}`,
  APP_NEXTJS: `/dashboard/${APP_IDS.NEXTJS}`,
  APP_VUE: `/dashboard/${APP_IDS.VUE}`,
  APP_SVELTE: `/dashboard/${APP_IDS.SVELTE}`,
  APP_SOLIDJS: `/dashboard/${APP_IDS.SOLIDJS}`,
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * Navigation items for the shell header/sidebar
 */
export const NAV_ITEMS = [
  { label: "Home", href: ROUTES.HOME },
  { label: "Dashboard", href: ROUTES.DASHBOARD },
  { label: "React App", href: ROUTES.APP_REACT },
  { label: "Next.js App", href: ROUTES.APP_NEXTJS },
  { label: "Vue App", href: ROUTES.APP_VUE },
  { label: "Svelte App", href: ROUTES.APP_SVELTE },
  { label: "SolidJS App", href: ROUTES.APP_SOLIDJS },
] as const;

/**
 * Dashboard sidebar navigation items
 */
export const DASHBOARD_NAV_ITEMS = [
  { label: "Overview", href: ROUTES.DASHBOARD },
  { label: "React App", href: ROUTES.APP_REACT },
  { label: "Next.js App", href: ROUTES.APP_NEXTJS },
  { label: "Vue App", href: ROUTES.APP_VUE },
  { label: "Svelte App", href: ROUTES.APP_SVELTE },
  { label: "SolidJS App", href: ROUTES.APP_SOLIDJS },
  { label: "Settings", href: ROUTES.SETTINGS },
] as const;
