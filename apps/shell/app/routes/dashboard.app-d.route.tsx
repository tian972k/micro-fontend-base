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
  return [{ title: "App D (Svelte) | MFE Platform" }];
};

export default function AppDRoute() {
  const appHost = `http://localhost:${PORTS.APP_D}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-orange-600">
          Application D
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Svelte 4 Integration from:{" "}
          <span className="font-mono text-primary">{appHost}</span>
        </p>
      </div>

      <Card className="overflow-hidden border-orange-100 shadow-lg">
        <CardHeader className="bg-orange-50/50">
          <CardTitle>Svelte MFE Container</CardTitle>
          <CardDescription>
            This island is running Svelte, participating in global state sync.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="min-h-[500px]">
            <MfeHost name="app-d" host={appHost} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
