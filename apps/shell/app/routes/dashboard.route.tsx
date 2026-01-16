import {
  Outlet,
  redirect,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@repo/ui";
import { AppSidebar } from "@/components/app-sidebar";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useEffect } from "react";
import { userActions } from "@repo/core";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader || !cookieHeader.includes("auth_token=")) {
    return redirect("/login");
  }
  return null;
};

export default function DashboardLayout() {
  // Simulate fetching user profile on mount (flux pattern: dispatch action to update store)
  useEffect(() => {
    // In a real app, you might fetch from /api/me here
    const dummyUser = {
      name: "Tuan Pham",
      email: "tuan.pham@example.com",
      avatarUrl: "https://github.com/shadcn.png", // Using shadcn png as requested/placeholder
    };
    userActions.login(dummyUser);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="w-[1px] h-4 bg-border mx-2" />
          <span className="font-semibold">My Platform</span>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="w-[1px] h-4 bg-border mx-2" />
          <span className="font-semibold">My Platform</span>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive">
            <h2 className="text-lg font-bold">
              Something went wrong in the Dashboard!
            </h2>
            <p>
              {isRouteErrorResponse(error)
                ? `${error.status} ${error.statusText}`
                : error instanceof Error
                  ? error.message
                  : "Unknown Error"}
            </p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
