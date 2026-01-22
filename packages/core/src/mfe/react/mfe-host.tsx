import React, { useEffect, useRef, useState } from "react";
import type { HealthCheckResponse, MicroApp, MfeManifest } from "../../types";
import { type MicroAppProps } from "../../types";
import { MfeError } from "./mfe-host-states/mfe-error";
import { MfeMaintenance } from "./mfe-host-states/mfe-maintenance";
import { MfeLoading } from "./mfe-host-states/mfe-loading";
import { MfeStrategyFactory } from "../strategy/factory";
import { type MicroAppType, MfeStatus } from "../../types";

const manifestCache: Record<string, string> = {};

export interface MfeHostProps {
  name: string;
  type: MicroAppType;
  host: string;
  props?: MicroAppProps;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  maintenanceComponent?: React.ReactNode;
  onMount?: () => void;
  onUnmount?: () => void;
  onError?: (error: string) => void;
  remoteLoader?: () => Promise<any>;
  className?: string;
}

export function MfeHost({
  name,
  type,
  host,
  props = {},
  fallback,
  loadingComponent,
  maintenanceComponent,
  remoteLoader,
}: MfeHostProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<MfeStatus>(MfeStatus.IDLE);
  const [errorDetails, setErrorDetails] = useState<string>("");

  const handleRetry = () => {
    setStatus(MfeStatus.IDLE);
    window.location.reload();
  };

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
            reject(
              new Error(`Timeout waiting for MicroApp "${name}" to register`),
            );
          }
        }, 50);
      });
    };

    const loadMfe = async () => {
      if (!mounted) return;

      // --- CHECK IF ALREADY LOADED ---
      // If MFE is already registered in window.MFE, just mount it directly
      // This prevents re-fetching manifest and re-loading script on route changes
      if (window.MFE?.[name]) {
        console.log(`[MfeHost] ${name} already loaded, mounting directly`);
        if (mounted) await mountMicroApp();
        return;
      }

      setStatus(MfeStatus.CHECKING);
      try {
        // 0. Federation / Direct Import Mode
        if (remoteLoader) {
          if (mounted) setStatus(MfeStatus.LOADING);
          await remoteLoader();
          if (mounted) await mountMicroApp();
          return;
        }

        // 0.5. Handle proxy URLs - append health check path if not already there
        let healthCheckUrl = `${host}`;
        if (!healthCheckUrl.includes("health.json")) {
          healthCheckUrl = `${host}${host.endsWith("/") ? "" : "/"}health.json?t=${Date.now()}`;
        }

        // 1. Health Check
        let healthRes;
        try {
          healthRes = await fetch(healthCheckUrl);
        } catch {
          throw new Error("CORE_CONNECTION_REFUSED");
        }

        if (!healthRes.ok) {
          if (healthRes.status === 404) throw new Error("CORE_NOT_FOUND");
          if (healthRes.status >= 500) throw new Error("CORE_SERVER_ERROR");
          throw new Error(`Health check failed: ${healthRes.statusText}`);
        }

        const health: HealthCheckResponse = await healthRes.json();
        if (health.status === "maintenance") {
          if (mounted) setStatus(MfeStatus.MAINTENANCE);
          return;
        }

        // 2. Load Manifest
        if (mounted) setStatus(MfeStatus.LOADING);
        const manifestRes = await fetch(
          `${host}/manifest.json?t=${Date.now()}`,
        );
        if (!manifestRes.ok) throw new Error("Manifest not found");
        const manifest: MfeManifest = await manifestRes.json();

        // Try to find the MFE entry point (src/entry-mfe.ts/tsx/js)
        // Fallback to index.html if not found (though index.html usually points to standalone main.ts)
        const mfeEntryKey = Object.keys(manifest).find((key) =>
          key.match(/^src\/entry-mfe\.(ts|tsx|js)$/),
        );

        const entryKey = mfeEntryKey || "index.html";
        const entryData = manifest[entryKey] || (manifest["index.html"] as any);

        if (!entryData) throw new Error("Entry file not found in manifest");

        const entryFile = entryData.file;
        const cssFiles = entryData.css || [];

        // --- CACHE CHECK ---
        manifestCache[name] = entryFile;

        // 3. Inject Assets
        cssFiles.forEach((css: string) => {
          const cssUrl = css.startsWith("http") ? css : `${host}/${css}`;
          if (!document.querySelector(`link[href^="${cssUrl}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = cssUrl;
            document.head.appendChild(link);
          }
        });

        const scriptUrl = entryFile.startsWith("http")
          ? entryFile
          : `${host}/${entryFile}`;
        const scriptUrlWithCache = `${scriptUrl}${scriptUrl.includes("?") ? "&" : "?"}t=${Date.now()}`;

        // Remove existing script if present (for HMR/dev mode)
        const existingScript = document.querySelector(
          `script[src^="${scriptUrl}"]`,
        );
        if (existingScript) {
          existingScript.remove();
        }

        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = scriptUrlWithCache;
          script.type = "module";
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error(`Failed to load script: ${entryFile}`));
          document.body.appendChild(script);
        });

        if (mounted) await mountMicroApp();
      } catch (err: unknown) {
        console.error("Failed to execute MFE entry script:", err);
        if (mounted) {
          setStatus(MfeStatus.ERROR);
          setErrorDetails(err instanceof Error ? err.message : String(err));
        }
      }
    };

    const mountMicroApp = async () => {
      if (!containerRef.current) return;
      try {
        const microApp = await waitForMfe(name);
        // Use Strategy Factory to determine how to mount
        const strategy = MfeStrategyFactory.get(type);
        strategy.mount(microApp, containerRef.current, {
          theme: "light",
          ...props,
        });

        if (mounted) setStatus(MfeStatus.MOUNTED);
      } catch (err: unknown) {
        console.error(`[MfeHost] Error mounting ${name}:`, err);
        if (mounted) {
          setStatus(MfeStatus.ERROR);
          setErrorDetails(
            err instanceof Error ? err.message : "Failed to mount application",
          );
        }
      }
    };

    loadMfe();

    return () => {
      mounted = false;
      if (containerRef.current && window.MFE?.[name]) {
        const strategy = MfeStrategyFactory.get(type);
        strategy.unmount(window.MFE[name], containerRef.current);
      }
    };
  }, [name, host, type, JSON.stringify(props)]);

  if (status === MfeStatus.MAINTENANCE) {
    return maintenanceComponent || <MfeMaintenance name={name} />;
  }

  if (status === MfeStatus.ERROR) {
    return (
      fallback || (
        <MfeError
          name={name}
          errorDetails={errorDetails}
          onRetry={handleRetry}
        />
      )
    );
  }

  return (
    <div
      className="relative min-h-[100px] w-full h-full"
      suppressHydrationWarning
    >
      {(status === MfeStatus.CHECKING || status === MfeStatus.LOADING) &&
        (loadingComponent || <MfeLoading name={name} />)}
      <div
        ref={containerRef}
        id={`mfe-host-${name}`}
        className="w-full h-full"
      />
    </div>
  );
}
