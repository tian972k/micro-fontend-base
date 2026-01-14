import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import MainLayout from "@/components/Layout";
import { MfeHost } from "@repo/core";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@repo/ui";
import { getAppConfig } from "@/server/config.server";

export const meta: MetaFunction = () => {
    return [
        { title: "App B | MFE Platform" },
    ];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const config = getAppConfig();
    return json({ appHost: config.apps["app-b"] });
}

export default function AppBRoute() {
    const { appHost } = useLoaderData<typeof loader>();

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Application B</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Hybrid integration from: <span className="font-mono text-primary">{appHost}</span></p>
                </div>

                <Card className="overflow-hidden border-primary/10 shadow-lg">
                    <CardHeader className="bg-primary/[0.02]">
                        <CardTitle>MFE Container (Hybrid Mode)</CardTitle>
                        <CardDescription>Rendered via @repo/core with server-side URL resolution</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="min-h-[500px]">
                            <MfeHost name="app-b" host={appHost} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
