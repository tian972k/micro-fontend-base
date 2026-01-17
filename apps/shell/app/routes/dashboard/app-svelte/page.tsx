import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { APP_IDS } from "@repo/config";
import { MfeHost } from "@repo/core";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui";
import { getAppConfig } from "../../../server/config";
export const meta: MetaFunction = () => {
  return [{ title: "Svelte App | MFE Platform" }];
};

export const loader = async () => {
  const config = getAppConfig();
  return json({ appHost: (config.apps as any)[APP_IDS.SVELTE] });
};

export default function AppSvelteRoute() {
  const { appHost } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-orange-600">
          Svelte Application
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
            <MfeHost name={APP_IDS.SVELTE} host={appHost} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
