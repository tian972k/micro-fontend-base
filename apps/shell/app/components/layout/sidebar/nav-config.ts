import {
  LayoutDashboard,
  AppWindow,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Application A (React)",
    url: "/dashboard/app-a",
    icon: AppWindow,
  },
  {
    title: "Application B (Next.js)",
    url: "/dashboard/app-b",
    icon: AppWindow,
  },
  {
    title: "Application C (Vue)",
    url: "/dashboard/app-c",
    icon: AppWindow,
  },
  {
    title: "Application D (Svelte)",
    url: "/dashboard/app-d",
    icon: AppWindow,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];
