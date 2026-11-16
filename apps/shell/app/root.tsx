import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import styles from "@repo/ui/globals.css?url";
import localStyles from "./tailwind.css?url";
import { ThemeProvider } from "./components/providers/theme-provider";
import { ThemeScript } from "@repo/ui";
import { useNonce } from "./components/providers/nonce-provider";
import { startTelemetry } from "./components/providers/telemetry-setup";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: localStyles },
];

export const meta: MetaFunction = () => {
  return [
    { title: "Orbit | Micro-Frontend Platform" },
    {
      name: "description",
      content:
        "Enterprise-grade Micro-Frontend Platform powered by Remix and Vite",
    },
  ];
};

// ... existing imports
import { useEffect } from "react";

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import i18next from "./i18next.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await i18next.getLocale(request);
  return json({ locale });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { locale } = useLoaderData<typeof loader>();
  const nonce = useNonce();
  const { i18n } = useTranslation();
  // In the browser the shared locale store is the source of truth (the
  // shell and every MFE write to it) and i18next.client.ts keeps i18next in
  // sync with it. Don't sync from here: during hydration useLocaleStore()
  // returns the store's *initial* state, which would undo the user's choice.

  useEffect(() => {
    // Error reporting + Core Web Vitals for the whole page (shell + MFEs).
    startTelemetry();
  }, []);

  return (
    <html
      lang={i18n.language || locale}
      dir={i18n.dir(i18n.language || locale)}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        {/* Inline script to prevent FOUC */}
        <ThemeScript nonce={nonce} />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}
