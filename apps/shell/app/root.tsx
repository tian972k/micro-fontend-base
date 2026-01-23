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
import { useChangeLanguage } from "remix-i18next/react";
import { useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import i18next from "./i18next.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await i18next.getLocale(request);
  return json({ locale });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { locale } = useLoaderData<typeof loader>();
  const { i18n } = useTranslation();
  useChangeLanguage(locale);

  useEffect(() => {
    // Basic Web Vitals monitoring
    if (typeof window !== "undefined") {
      // @ts-ignore
      import("web-vitals")
        .then(({ onCLS, onFID, onLCP, onFCP, onTTFB }) => {
          onCLS(console.log);
          onFID(console.log);
          onLCP(console.log);
          onFCP(console.log);
          onTTFB(console.log);
        })
        .catch(() => {
          console.warn("web-vitals not installed");
        });
    }
  }, []);

  return (
    <html lang={locale} dir={i18n.dir(locale)} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        {/* Inline script to prevent FOUC */}
        <ThemeScript />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
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
