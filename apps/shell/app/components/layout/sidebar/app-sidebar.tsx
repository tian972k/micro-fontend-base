import { Sidebar, SidebarContent, SidebarFooter } from "@repo/ui";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";

/**
 * AppSidebar - Main sidebar component
 *
 * Composed of:
 * - SidebarHeader: Platform branding
 * - SidebarNav: Navigation menu items
 * - UserMenu: User profile dropdown with logout
 */
export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarNav />
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
