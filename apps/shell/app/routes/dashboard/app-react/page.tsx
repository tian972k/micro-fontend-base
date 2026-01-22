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
  return [{ title: "React App | MFE Platform" }];
};

export const loader = async () => {
  try {
    const config = getAppConfig();
    return json({ appHost: (config.apps as any)[APP_IDS.REACT] });
  } catch (error) {
    console.error("Failed to load app config:", error);
    // Fallback to proxy path in production
    return json({
      appHost: process.env.VERCEL
        ? "/api/proxy/react/"
        : "http://localhost:8001",
      error: "Configuration error",
    });
  }
};

export default function AppReactRoute() {
  const { appHost } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">React Application</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Real-time integration from:{" "}
          <span className="font-mono text-primary">{appHost}</span>
        </p>
      </div>

      <Card className="overflow-hidden border-primary/10 shadow-lg">
        <CardHeader className="bg-primary/[0.02]">
          <CardTitle>React Application (Remote)</CardTitle>
          <CardDescription>
            This area is orchestrated by @repo/core
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="min-h-[500px]">
            <MfeContainer
              appName={APP_IDS.REACT}
              host={appHost}
              appType={MicroAppType.REACT}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
