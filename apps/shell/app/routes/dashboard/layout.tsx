import {
  Outlet,
  redirect,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
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

export default function DashboardRoute() {
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
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <DashboardLayout>
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
    </DashboardLayout>
  );
}
