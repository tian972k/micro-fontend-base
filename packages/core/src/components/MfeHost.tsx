import React, { useEffect, useRef, useState } from "react";
import type { HealthCheckResponse, MicroApp, MfeManifest } from "../types";

const manifestCache: Record<string, string> = {};

interface MfeHostProps {
    name: string;
    host: string;
    props?: Record<string, any>;
    fallback?: React.ReactNode;
    loadingComponent?: React.ReactNode;
    maintenanceComponent?: React.ReactNode;
}

type LoadStatus = "idle" | "checking" | "loading" | "mounted" | "error" | "maintenance";

export function MfeHost({
    name,
    host,
    props = {},
    fallback,
    loadingComponent,
    maintenanceComponent
}: MfeHostProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<LoadStatus>("idle");
    const [errorDetails, setErrorDetails] = useState<string>("");

    useEffect(() => {
        let mounted = true;

        const waitForMfe = (name: string, timeout = 5000): Promise<MicroApp> => {
            return new Promise((resolve, reject) => {
                if (window.MFE?.[name]) {
                    return resolve(window.MFE[name]);
                }

                const startTime = Date.now();
                const interval = setInterval(() => {
                    if (window.MFE?.[name]) {
                        clearInterval(interval);
                        resolve(window.MFE[name]);
                    } else if (Date.now() - startTime > timeout) {
                        clearInterval(interval);
                        reject(new Error(`Timeout waiting for MicroApp "${name}" to register`));
                    }
                }, 50);
            });
        };

        const loadMfe = async () => {
            if (!mounted) return;

            setStatus("checking");
            try {
                // 1. Health Check
                const healthRes = await fetch(`${host}/health.json?t=${Date.now()}`);
                if (!healthRes.ok) throw new Error(`Health check failed: ${healthRes.statusText}`);
                const health: HealthCheckResponse = await healthRes.json();

                if (health.status === "maintenance") {
                    if (mounted) setStatus("maintenance");
                    return;
                }

                // 2. Load Manifest
                if (mounted) setStatus("loading");
                const manifestRes = await fetch(`${host}/manifest.json?t=${Date.now()}`);
                if (!manifestRes.ok) throw new Error("Manifest not found");
                const manifest: MfeManifest = await manifestRes.json();

                const entryFile = manifest["index.html"]?.file;
                const cssFiles = manifest["index.html"]?.css || [];

                if (!entryFile) throw new Error("Entry file not found in manifest");

                // --- CACHE CHECK ---
                const isAlreadyRegistered = !!window.MFE?.[name];
                const lastLoadedEntry = manifestCache[name];

                if (isAlreadyRegistered && lastLoadedEntry === entryFile) {
                    if (mounted) {
                        await mountMicroApp();
                        return;
                    }
                }

                manifestCache[name] = entryFile;

                // 3. Inject Assets
                cssFiles.forEach((css: string) => {
                    const cssUrl = css.startsWith('http') ? css : `${host}/${css}`;
                    if (!document.querySelector(`link[href^="${cssUrl}"]`)) {
                        const link = document.createElement("link");
                        link.rel = "stylesheet";
                        link.href = cssUrl;
                        document.head.appendChild(link);
                    }
                });

                const scriptUrl = entryFile.startsWith('http') ? entryFile : `${host}/${entryFile}`;
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
                console.error(`[MfeHost] Error loading ${name}:`, err);
                if (mounted) {
                    setStatus("error");
                    setErrorDetails(err.message);
                }
            }
        };

        const mountMicroApp = async () => {
            if (!containerRef.current) return;

            try {
                const microApp = await waitForMfe(name);
                microApp.mount(containerRef.current, {
                    theme: "light",
                    ...props
                });
                if (mounted) setStatus("mounted");
            } catch (err: any) {
                console.error(`[MfeHost] Error mounting ${name}:`, err);
                if (mounted) {
                    setStatus("error");
                    setErrorDetails(err.message || "Failed to mount application");
                }
            }
        };

        loadMfe();

        return () => {
            mounted = false;
            if (containerRef.current) {
                window.MFE?.[name]?.unmount(containerRef.current);
            }
        };
    }, [name, host, JSON.stringify(props)]);

    if (status === "maintenance") {
        return maintenanceComponent || (
            <div className="p-8 text-center border-2 border-yellow-200 bg-yellow-50 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-800">Maintenance</h3>
                <p className="text-yellow-700">Application "${name}" is currently offline for maintenance.</p>
            </div>
        );
    }

    if (status === "error") {
        return fallback || (
            <div className="p-8 text-center border-2 border-red-200 bg-red-50 rounded-lg">
                <h3 className="text-xl font-bold text-red-800">Unavailable</h3>
                <p className="text-red-700">Failed to load micro-app "${name}".</p>
                <p className="text-xs text-red-500 mt-2">{errorDetails}</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-[100px] w-full h-full">
            {(status === "checking" || status === "loading") && (
                loadingComponent || (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 animate-pulse">
                        <p className="text-sm font-medium text-gray-500">Loading {name}...</p>
                    </div>
                )
            )}
            <div ref={containerRef} id={`mfe-host-${name}`} className="w-full h-full" />
        </div>
    );
}
