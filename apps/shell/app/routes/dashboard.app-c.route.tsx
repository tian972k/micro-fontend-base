import { MfeHost } from "@repo/core";
import { PORTS } from "@repo/config";
import { type MetaFunction } from "@remix-run/node";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui";

export const meta: MetaFunction = () => {
  return [{ title: "App C (Vue) | MFE Platform" }];
};

export default function AppCRoute() {
  const appHost = `http://localhost:${PORTS.APP_C}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-600">
          Application C
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Vue 3 Integration from:{" "}
          <span className="font-mono text-primary">{appHost}</span>
        </p>
      </div>

      <Card className="overflow-hidden border-emerald-100 shadow-lg">
        <CardHeader className="bg-emerald-50/50">
          <CardTitle>Vue MFE Container</CardTitle>
          <CardDescription>
            This island is running Vue 3, synced with React shell state.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="min-h-[500px]">
            <MfeHost name="app-c" host={appHost} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
