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
import { APP_IDS } from "@repo/config";
export interface NavItem {
  title: string;
  url: string;
  icon: React.ForwardRefExoticComponent<
    IconProps & React.RefAttributes<SVGSVGElement>
  >;
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: House,
  },
  {
    title: "React App",
    url: `/dashboard/${APP_IDS.REACT}`,
    icon: Atom,
  },
  {
    title: "Next.js App",
    url: `/dashboard/${APP_IDS.NEXTJS}`,
    icon: SquaresFour,
  },
  {
    title: "Vue App",
    url: `/dashboard/${APP_IDS.VUE}`,
    icon: Globe,
  },
  {
    title: "Svelte App",
    url: `/dashboard/${APP_IDS.SVELTE}`,
    icon: CircleNotch,
  },
  {
    title: "SolidJS App",
    url: `/dashboard/${APP_IDS.SOLIDJS}`,
    icon: Lightning,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Gear,
  },
];
