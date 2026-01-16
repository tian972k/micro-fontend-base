import { MfeHost } from "@repo/core";
import { type MetaFunction } from "@remix-run/node";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui";

export const meta: MetaFunction = () => {
  return [{ title: "App A | MFE Platform" }];
};

export default function AppARoute() {
  // Hardcoded host for debugging
  const appHost = "http://localhost:8001";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Application A</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Real-time integration from:{" "}
          <span className="font-mono text-primary">{appHost}</span>
        </p>
      </div>

      <Card className="overflow-hidden border-primary/10 shadow-lg">
        <CardHeader className="bg-primary/[0.02]">
          <CardTitle>MFE Container</CardTitle>
          <CardDescription>
            This area is orchestrated by @repo/core
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="min-h-[500px]">
            <MfeHost name="app-a" host={appHost} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
