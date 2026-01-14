import type { Metadata } from "next";
import "@repo/ui/globals.css";

export const metadata: Metadata = {
    title: "App B Standalone",
    description: "App B running in standalone Next.js mode",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
