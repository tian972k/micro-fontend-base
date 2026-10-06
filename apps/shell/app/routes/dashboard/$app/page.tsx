import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { MFE_APPS, type MfeApp } from "@repo/config";
import { MicroAppType } from "@repo/core/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { MfeContainer } from "@/components/mfe/mfe-container";
import { mergeMeta } from "@/lib/meta";
import { getAppUrl } from "../../../server/config";

/**
 * One route for every registered MFE: /dashboard/<app id>.
 * Adding an app to MFE_APPS is enough to get its page, nav entry and URL.
 */
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const app = MFE_APPS.find((a) => a.id === params.app);
  if (!app) {
    throw new Response("Unknown micro-frontend", { status: 404 });
  }
  return json({ app, appHost: getAppUrl(app.id) });
};

export const meta = mergeMeta<typeof loader>(({ data }) => [
  { title: `${data?.app.title ?? "Micro-frontend"} | MFE Platform` },
  ...(data ? [{ name: "description", content: data.app.description }] : []),
]);

// Literal class names so Tailwind's scanner picks them up.
const ACCENTS: Record<
  MfeApp["accent"],
  { heading: string; card: string; header: string }
> = {
  primary: {
    heading: "",
    card: "border-primary/10",
    header: "bg-primary/[0.02]",
  },
  emerald: {
    heading: "text-emerald-700",
    card: "border-emerald-100",
    header: "bg-emerald-50/50",
  },
  orange: {
    heading: "text-orange-700",
    card: "border-orange-100",
    header: "bg-orange-50/50",
  },
  blue: {
    heading: "text-blue-700",
    card: "border-blue-100",
    header: "bg-blue-50/50",
  },
};

export default function MfeRoute() {
  const { app, appHost } = useLoaderData<typeof loader>();
  const accent = ACCENTS[app.accent];

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-3xl font-bold tracking-tight ${accent.heading}`}>
          {app.title}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Loaded from: <span className="font-mono text-primary">{appHost}</span>
        </p>
      </div>

      <Card className={`overflow-hidden shadow-lg ${accent.card}`}>
        <CardHeader className={accent.header}>
          <CardTitle>{app.name} (Remote)</CardTitle>
          <CardDescription>{app.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="min-h-[500px]">
            {/* key: remount cleanly when navigating between apps */}
            <MfeContainer
              key={app.id}
              appName={app.id}
              host={appHost}
              appType={app.type as MicroAppType}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
