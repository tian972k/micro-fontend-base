import React, { useEffect, useRef, useState } from "react";
import type { HealthCheckResponse, MicroApp, MfeManifest } from "../../types";
import { type MicroAppProps } from "../../types";
import { MfeError } from "./mfe-host-states/mfe-error";
import { MfeMaintenance } from "./mfe-host-states/mfe-maintenance";
import { MfeLoading } from "./mfe-host-states/mfe-loading";

const manifestCache: Record<string, string> = {};

export interface MfeHostProps {
  name: string;
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

type LoadStatus =
  | "idle"
  | "checking"
  | "loading"
  | "mounted"
  | "error"
  | "maintenance";

export function MfeHost({
  name,
  host,
  props = {},
  fallback,
  loadingComponent,
  maintenanceComponent,
  remoteLoader,
}: MfeHostProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [errorDetails, setErrorDetails] = useState<string>("");

  const handleRetry = () => {
    setStatus("idle");
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
      setStatus("checking");
      try {
        // 0. Federation / Direct Import Mode
        if (remoteLoader) {
          if (mounted) setStatus("loading");
          await remoteLoader();
          if (mounted) await mountMicroApp();
          return;
        }

        // 1. Health Check
        let healthRes;
        try {
          healthRes = await fetch(`${host}/health.json?t=${Date.now()}`);
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
          if (mounted) setStatus("maintenance");
          return;
        }

        // 2. Load Manifest
        if (mounted) setStatus("loading");
        const manifestRes = await fetch(
          `${host}/manifest.json?t=${Date.now()}`,
        );
        if (!manifestRes.ok) throw new Error("Manifest not found");
        const manifest: MfeManifest = await manifestRes.json();

        const entryFile = manifest["index.html"]?.file;
        const cssFiles = manifest["index.html"]?.css || [];

        if (!entryFile) throw new Error("Entry file not found in manifest");

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
        if (!document.querySelector(`script[src^="${scriptUrl}"]`)) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = scriptUrl;
            script.type = "module";
            script.onload = () => resolve();
            script.onerror = () =>
              reject(new Error(`Failed to load script: ${entryFile}`));
            document.body.appendChild(script);
          });
        }

        if (mounted) await mountMicroApp();
      } catch (err: unknown) {
        console.error("Failed to execute MFE entry script:", err);
        if (mounted) {
          setStatus("error");
          setErrorDetails(err instanceof Error ? err.message : String(err));
        }
      }
    };

    const mountMicroApp = async () => {
      if (!containerRef.current) return;
      try {
        const microApp = await waitForMfe(name);
        microApp.mount(containerRef.current, { theme: "light", ...props });
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
    return maintenanceComponent || <MfeMaintenance name={name} />;
  }

  if (status === "error") {
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
    <div className="relative min-h-[100px] w-full h-full">
      {(status === "checking" || status === "loading") &&
        (loadingComponent || <MfeLoading name={name} />)}
      <div
        ref={containerRef}
        id={`mfe-host-${name}`}
        className="w-full h-full"
      />
    </div>
  );
}
