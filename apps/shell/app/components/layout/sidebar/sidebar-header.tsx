import { SidebarHeader as BaseSidebarHeader } from "@repo/ui";

export function SidebarHeader() {
  return (
    <BaseSidebarHeader className="border-b px-6 py-4">
      <div className="flex items-center gap-3 font-bold text-xl text-primary">
        <div className="flex items-center justify-center">
          <img src="/logo.svg" alt="Orbit Logo" className="h-10 w-10" />
        </div>
        <span className="text-2xl tracking-tight">Orbit</span>
      </div>
    </BaseSidebarHeader>
  );
}
