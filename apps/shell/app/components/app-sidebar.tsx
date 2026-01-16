import { LayoutDashboard, AppWindow, Settings, LogOut } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
} from "@repo/ui";
import { Form, Link, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { userStore, useUserStore } from "@repo/core";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Application A",
    url: "/dashboard/app-a",
    icon: AppWindow,
  },
  {
    title: "Application B",
    url: "/dashboard/app-b",
    icon: AppWindow,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const user = useUserStore((state) => state.user);

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            M
          </div>
          <span>MFE Platform</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar>
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.name || "Guest"}</span>
            <span className="text-xs text-muted-foreground">
              {user?.email || "No email"}
            </span>
          </div>
        </div>
        <Form method="post" action="/logout">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            type="submit"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </Button>
        </Form>
      </SidebarFooter>
    </Sidebar>
  );
}
