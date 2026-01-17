import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./sidebar";
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

const meta: Meta<typeof Sidebar> = {
  title: "React/Sidebar",
  component: Sidebar,
  tags: ["autodocs", "react"],
  decorators: [
    (Story) => (
      <div className="h-[600px] border rounded-lg overflow-hidden flex">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export const Default: Story = {
  render: (args) => (
    <SidebarProvider>
      <Sidebar {...args}>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <span className="p-2 text-xs text-muted-foreground">Footer</span>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 p-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <span className="font-semibold">Dashboard</span>
        </div>
        <div className="mt-4 border-dashed border-2 rounded-lg h-full flex items-center justify-center text-muted-foreground">
          Content
        </div>
      </main>
    </SidebarProvider>
  ),
};
