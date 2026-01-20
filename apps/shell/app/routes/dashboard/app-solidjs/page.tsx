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
  return [{ title: "SolidJS App | MFE Platform" }];
};

export const loader = async () => {
  const config = getAppConfig();
  return json({ appHost: (config.apps as any)[APP_IDS.SOLIDJS] });
};

export default function AppSolidJsRoute() {
  const { appHost } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-600">
          SolidJS Application
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          High-performance integration from:{" "}
          <span className="font-mono text-primary">{appHost}</span>
        </p>
      </div>

      <Card className="overflow-hidden border-blue-100 shadow-lg">
        <CardHeader className="bg-blue-50/50">
          <CardTitle>SolidJS Application (Remote)</CardTitle>
          <CardDescription>
            High-performance island leveraging SolidJS fine-grained reactivity.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="min-h-[500px]">
            <MfeContainer
              appName={APP_IDS.SOLIDJS}
              host={appHost}
              appType={MicroAppType.SOLID}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
