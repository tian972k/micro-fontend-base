const manifestCache: Record<string, string> = {};

import { useEffect, useRef, useState } from "react";
import type { HealthCheckResponse, MicroApp } from "@repo/core";

interface MicroFrontendHostProps {
    name: string;
    host: string;
}

type LoadStatus = "idle" | "checking" | "loading" | "mounted" | "error" | "maintenance";

export function MicroFrontendHost({ name, host }: MicroFrontendHostProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<LoadStatus>("idle");
    const [errorDetails, setErrorDetails] = useState<string>("");

    useEffect(() => {
        let mounted = true;

        const waitForMfe = (name: string, timeout = 5000): Promise<MicroApp> => {
            return new Promise((resolve, reject) => {
                // @ts-ignore
                if (window.MFE?.[name]) {
                    // @ts-ignore
                    return resolve(window.MFE[name]);
                }

                const startTime = Date.now();
                const interval = setInterval(() => {
                    // @ts-ignore
                    if (window.MFE?.[name]) {
                        clearInterval(interval);
                        // @ts-ignore
                        resolve(window.MFE[name]);
                    } else if (Date.now() - startTime > timeout) {
                        clearInterval(interval);
                        reject(new Error(`Timeout waiting for MicroApp "${name}" to register in window.MFE`));
                    }
                }, 50);
            });
        };

        const loadMfe = async () => {
            if (!mounted) return;

            // 1. Check Health
            setStatus("checking");
            try {
                // Cache busting only for the control files (health/manifest)
                const healthRes = await fetch(`${host}/health.json?t=${Date.now()}`);
                if (!healthRes.ok) throw new Error(`Health check failed: ${healthRes.statusText}`);
                const health: HealthCheckResponse = await healthRes.json();

                if (health.status === "maintenance") {
                    if (mounted) setStatus("maintenance");
                    return;
                }

                // 2. Load Manifest with Cache Busting
                if (mounted) setStatus("loading");
                const manifestRes = await fetch(`${host}/manifest.json?t=${Date.now()}`);
                if (!manifestRes.ok) throw new Error("Manifest not found");
                const manifest = await manifestRes.json();

                const entryFile = manifest["index.html"]?.file;
                const cssFiles = manifest["index.html"]?.css || [];

                if (!entryFile) throw new Error("Entry file not found in manifest");

                // --- SMART CHECK ---
                // If the entryFile URL is the same as what we already have, 
                // and the MFE is already registered in window, we can skip re-loading.
                // @ts-ignore
                const isAlreadyRegistered = !!window.MFE?.[name];
                const lastLoadedEntry = manifestCache[name];

                if (isAlreadyRegistered && lastLoadedEntry === entryFile) {
                    console.log(`[MFE] ${name} is up to date (${entryFile}). Skipping script injection.`);
                    if (mounted) {
                        await mountMicroApp();
                        return;
                    }
                }

                // Update cache with the new entry file version
                manifestCache[name] = entryFile;

                // 3. Inject Assets
                cssFiles.forEach((css: string) => {
                    const cssUrl = `${host}/${css}`;
                    if (!document.querySelector(`link[href^="${cssUrl}"]`)) {
                        const link = document.createElement("link");
                        link.rel = "stylesheet";
                        link.href = cssUrl;
                        document.head.appendChild(link);
                    }
                });

                // Load Script (No timestamp here! Let the browser cache the hash-based file)
                const scriptUrl = `${host}/${entryFile}`;
                if (!document.querySelector(`script[src^="${scriptUrl}"]`)) {
                    await new Promise<void>((resolve, reject) => {
                        const script = document.createElement("script");
                        script.src = scriptUrl;
                        script.type = "module";
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error(`Failed to load script: ${entryFile}`));
                        document.body.appendChild(script);
                    });
                }

                if (mounted) await mountMicroApp();

            } catch (err: any) {
                console.error(`[MFE] Error loading ${name}:`, err);
                if (mounted) {
                    setStatus("error");
                    setErrorDetails(err.message);
                }
            }
        };

        const mountMicroApp = async () => {
            if (!containerRef.current) {
                console.error(`[MFE] ${name} container not found`);
                return;
            }

            try {
                // Wait for the app to be registered in window.MFE
                const microApp = await waitForMfe(name);

                // Important: mount is idempotent or handles re-mounting safely
                microApp.mount(containerRef.current, { theme: "light" });
                if (mounted) setStatus("mounted");
            } catch (err: any) {
                console.error(`[MFE] Error mounting ${name}:`, err);
                if (mounted) {
                    setStatus("error");
                    setErrorDetails(err.message || "Failed to mount application");
                }
            }
        };

        loadMfe();

        return () => {
            mounted = false;
            // Note: We don't always want to unmount here if we want instant back-navigation,
            // but for a clean base, we follow the cleanup rule.
            if (containerRef.current) {
                // @ts-ignore
                window.MFE?.[name]?.unmount(containerRef.current);
            }
        };
    }, [name, host]);

    // Render Logic: 
    // We ALWAYS render the container div so it exists in the DOM.
    // We overlay loading/error states on top or replace if critical.

    if (status === "maintenance") {
        return (
            <div className="p-8 text-center border-2 border-yellow-200 bg-yellow-50 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-800">Under Maintenance</h3>
                <p className="text-yellow-700">This application is currently undergoing scheduled maintenance.</p>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="p-8 text-center border-2 border-red-200 bg-red-50 rounded-lg">
                <h3 className="text-xl font-bold text-red-800">Unavailable</h3>
                <p className="text-red-700">We could not load this application.</p>
                <p className="text-xs text-red-500 mt-2">{errorDetails}</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-[400px]">
            {/* Loading Overlay */}
            {(status === "checking" || status === "loading") && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 transition-opacity duration-300">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        <p className="text-muted-foreground text-sm font-medium">Loading {name}...</p>
                    </div>
                </div>
            )}

            {/* The Actual MFE Container - Always Present */}
            <div ref={containerRef} id={`mfe-${name}`} className="h-full w-full" />
        </div>
    );
}
