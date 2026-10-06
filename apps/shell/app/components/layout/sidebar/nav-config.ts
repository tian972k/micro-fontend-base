import {
  Atom,
  Globe,
  SquaresFour,
  CircleNotch,
  Lightning,
  House,
  Gear,
  type IconProps,
} from "@phosphor-icons/react";
import React from "react";
import { MFE_APPS, type MfeAppId } from "@repo/config";
export interface NavItem {
  title: string;
  url: string;
  icon: React.ForwardRefExoticComponent<
    IconProps & React.RefAttributes<SVGSVGElement>
  >;
}

// Per-app icons; apps without one fall back to a generic icon.
const APP_ICONS: Partial<Record<MfeAppId, NavItem["icon"]>> = {
  "app-react": Atom,
  "app-nextjs": SquaresFour,
  "app-vue": Globe,
  "app-svelte": CircleNotch,
  "app-solidjs": Lightning,
};

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: House,
  },
  // One entry per registered MFE (MFE_APPS is the single source of truth).
  ...MFE_APPS.map((app) => ({
    title: app.name,
    url: `/dashboard/${app.id}`,
    icon: APP_ICONS[app.id] ?? SquaresFour,
  })),
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Gear,
  },
];
