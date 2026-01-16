import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "Dashboard - App Shell" }];
};

export default function DashboardIndex() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight mb-4">
        Welcome to the Dashboard
      </h1>
      <p className="text-lg text-muted-foreground max-w-[600px] mb-8">
        You are now in the protected area. Start clicking on apps in the
        sidebar.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full max-w-4xl px-4">
        <div className="p-6 border rounded-lg shadow-sm bg-card text-card-foreground">
          <div className="text-4xl font-bold text-primary">12</div>
          <div className="text-sm text-muted-foreground mt-2">Active Users</div>
        </div>
        <div className="p-6 border rounded-lg shadow-sm bg-card text-card-foreground">
          <div className="text-4xl font-bold text-primary">$1,234</div>
          <div className="text-sm text-muted-foreground mt-2">Revenue</div>
        </div>
        <div className="p-6 border rounded-lg shadow-sm bg-card text-card-foreground">
          <div className="text-4xl font-bold text-primary">+23%</div>
          <div className="text-sm text-muted-foreground mt-2">Growth</div>
        </div>
      </div>
    </div>
  );
}
