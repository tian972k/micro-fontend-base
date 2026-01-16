import type { MetaFunction } from "@remix-run/node";
import MainLayout from "@/components/main-layout";
import { Button } from "@repo/ui";

export const meta: MetaFunction = () => {
  return [
    { title: "App Shell" },
    { name: "description", content: "Micro-Frontend Shell" },
  ];
};

export default function Index() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Welcome to the App Shell
        </h1>
        <p className="text-lg text-muted-foreground max-w-[600px] mb-8">
          This is the server-rendered container that orchestrates micro-apps.
          Navigate to App A or App B to see client-side islands in action.
        </p>
        <div className="flex gap-4">
          <Button size="lg">Get Started</Button>
          <Button variant="outline" size="lg">
            Documentation
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
