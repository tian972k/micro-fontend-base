import { MFE_APPS } from "./apps";

/**
 * Centralized registry of application routes.
 * Use these constants instead of hardcoded strings to ensure consistency.
 * MFE routes are derived from MFE_APPS, so they follow the registry.
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  LOGOUT: "/logout",
  DASHBOARD: "/dashboard",
  EXAMPLE: "/example",
  SETTINGS: "/dashboard/settings",
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];

/** Shell route of a registered MFE: /dashboard/<app id>. */
export const mfeRoute = (appId: string) => `${ROUTES.DASHBOARD}/${appId}`;

const MFE_NAV = MFE_APPS.map((app) => ({
  label: app.name,
  href: mfeRoute(app.id),
}));

/**
 * Navigation items for the shell header/sidebar
 */
export const NAV_ITEMS = [
  { label: "Home", href: ROUTES.HOME },
  { label: "Dashboard", href: ROUTES.DASHBOARD },
  ...MFE_NAV,
];

/**
 * Dashboard sidebar navigation items
 */
export const DASHBOARD_NAV_ITEMS = [
  { label: "Overview", href: ROUTES.DASHBOARD },
  ...MFE_NAV,
  { label: "Settings", href: ROUTES.SETTINGS },
];
