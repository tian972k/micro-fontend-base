import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { APP_IDS } from "@repo/config";
import { MicroAppType } from "@repo/core/react";
import { MfeContainer } from "@/components/mfe/mfe-container";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui";
import { getAppConfig } from "../../../server/config";
export const meta: MetaFunction = () => {
  return [{ title: "Vue App | MFE Platform" }];
};

export const loader = async () => {
  const config = getAppConfig();
  return json({ appHost: (config.apps as any)[APP_IDS.VUE] });
};

export default function AppVueRoute() {
  const { appHost } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-600">
          Vue Application
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Vue 3 Integration from:{" "}
          <span className="font-mono text-primary">{appHost}</span>
        </p>
      </div>

      <Card className="overflow-hidden border-emerald-100 shadow-lg">
        <CardHeader className="bg-emerald-50/50">
          <CardTitle>Vue Application (Remote)</CardTitle>
          <CardDescription>
            This island is running Vue 3, synced with React shell state.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="min-h-[500px]">
            <MfeContainer
              appName={APP_IDS.VUE}
              host={appHost}
              appType={MicroAppType.VUE}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
