import { SidebarHeader as BaseSidebarHeader } from "@repo/ui";

export function SidebarHeader() {
  return (
    <BaseSidebarHeader className="border-b px-6 py-4">
      <div className="flex items-center gap-2 font-bold text-xl text-primary">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          M
        </div>
        <span>MFE Platform</span>
      </div>
    </BaseSidebarHeader>
  );
}
