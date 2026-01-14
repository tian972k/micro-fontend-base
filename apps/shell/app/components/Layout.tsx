import React, { type ReactNode, useState } from "react";
import { globalEventBus } from "@repo/core";
import { Outlet, Link, useLocation } from "@remix-run/react";
import { Button, cn } from "@repo/ui";

interface MainLayoutProps {
    children?: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const [globalCount, setGlobalCount] = useState(0);
    const location = useLocation();

    const handleBroadcast = () => {
        const newCount = globalCount + 1;
        setGlobalCount(newCount);
        globalEventBus.emit("SHELL_COUNTER_UPDATE", newCount);
    };

    const navItems = [
        { label: "Home", href: "/" },
        { label: "Application A", href: "/app-a" },
        { label: "Application B", href: "/app-b" },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-background font-sans antialiased text-foreground">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">M</div>
                            <span className="font-bold text-xl inline-block">MFE Platform</span>
                        </Link>
                        <nav className="flex items-center space-x-6 text-sm font-medium">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={cn(
                                        "transition-colors hover:text-foreground/80",
                                        location.pathname === item.href ? "text-foreground" : "text-foreground/60"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleBroadcast}
                            className="hidden md:flex gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Signal: {globalCount}
                        </Button>
                        <div className="w-px h-6 bg-border mx-2" />
                        <Button size="sm">Get Started</Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 container py-8">
                <div className="animate-fade-in">
                    {children || <Outlet />}
                </div>
            </main>
            <footer className="border-t bg-muted/30 py-6 text-center text-sm text-muted-foreground">
                <div className="container flex flex-col items-center gap-4 md:flex-row md:justify-between">
                    <p>© 2026 Micro-Frontend Architecture Base. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <span className="hover:underline cursor-pointer">Documentation</span>
                        <span className="hover:underline cursor-pointer">GitHub</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
