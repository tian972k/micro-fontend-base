import {
  Outlet,
  redirect,
  useRouteError,
  isRouteErrorResponse,
  useLocation,
  Link,
} from "@remix-run/react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@repo/ui";
import { AppSidebar } from "@/components/layout/sidebar";
import { DebugPanel } from "@/components/debug-panel";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useEffect } from "react";
import { userActions } from "@repo/core/react";
import { UserNav } from "@/components/dashboard/user-nav";
import { Search } from "@/components/dashboard/search";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader || !cookieHeader.includes("auth_token=")) {
    return redirect("/login");
  }
  return null;
};

function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link to="/dashboard" className="hover:text-foreground">
        Dashboard
      </Link>
      {pathnames.slice(1).map((value, index) => {
        const to = `/dashboard/${pathnames.slice(1, index + 1).join("/")}`;
        return (
          <div key={to} className="flex items-center">
            <span className="mx-1">/</span>
            <Link to={to} className="capitalize hover:text-foreground">
              {value}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}

export default function DashboardRoute() {
  // Simulate fetching user profile
  useEffect(() => {
    const dummyUser = {
      name: "Tuan Pham",
      email: "tuan.pham@example.com",
      avatarUrl: "https://github.com/shadcn.png",
    };
    userActions.login(dummyUser);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 transition-all">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-2" />
            <div className="w-[1px] h-4 bg-border hidden md:block" />
            <Breadcrumbs />
          </div>
          <div className="flex items-center gap-4">
            <Search />
            <UserNav />
          </div>
        </header>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <Outlet />
        </div>
      </SidebarInset>
      {/* Debug Panel - Only in development */}
      {import.meta.env.DEV && <DebugPanel />}
    </SidebarProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-destructive/10 text-destructive p-10">
      <div className="max-w-md space-y-4 text-center">
        <h2 className="text-2xl font-bold">Dashboard Error</h2>
        <p className="text-lg">
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : error instanceof Error
              ? error.message
              : "Unknown Error"}
        </p>
        <Link to="/dashboard" className="underline hover:text-destructive/80">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
