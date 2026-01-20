import { useEffect, useRef, useState } from "react";
import type { HealthCheckResponse, MicroApp } from "@repo/core/react";
import { AppRegistry } from "@repo/core/react";

const manifestCache: Record<string, string> = {};

export type LoadStatus =
  | "idle"
  | "checking"
  | "loading"
  | "mounted"
  | "error"
  | "maintenance";

interface UseMicroAppOptions {
  name: string;
  host: string;
}

/**
 * Custom hook to manage the lifecycle of a Micro-Frontend.
 * Handles health checking, manifest fetching, asset injection, and mounting.
 */
export function useMicroApp({ name, host }: UseMicroAppOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [errorDetails, setErrorDetails] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    const waitForMfe = (name: string, timeout = 5000): Promise<MicroApp> => {
      return new Promise((resolve, reject) => {
        const app = AppRegistry.get(name);
        if (app) return resolve(app);

        const startTime = Date.now();
        const interval = setInterval(() => {
          const app = AppRegistry.get(name);
          if (app) {
            clearInterval(interval);
            resolve(app);
          } else if (Date.now() - startTime > timeout) {
            clearInterval(interval);
            reject(new Error(`Timeout waiting for MicroApp "${name}"`));
          }
        }, 50);
      });
    };

    const loadMfe = async () => {
      if (!mounted) return;

      try {
        // 1. Health Check
        setStatus("checking");
        const healthRes = await fetch(`${host}/health.json?t=${Date.now()}`);
        if (!healthRes.ok)
          throw new Error(`Health check failed: ${healthRes.statusText}`);
        const health: HealthCheckResponse = await healthRes.json();

        if (health.status === "maintenance") {
          if (mounted) setStatus("maintenance");
          return;
        }

        // 2. Load Manifest or fallback to dev mode
        if (mounted) setStatus("loading");

        let entryFile: string;
        let cssFiles: string[] = [];

        try {
          const manifestRes = await fetch(
            `${host}/manifest.json?t=${Date.now()}`,
          );

          if (manifestRes.ok) {
            const manifest = await manifestRes.json();
            entryFile = manifest["index.html"]?.file;
            cssFiles = manifest["index.html"]?.css || [];

            if (!entryFile) throw new Error("Entry file not found in manifest");
          } else {
            // Dev mode: manifest doesn't exist, use direct entry file
            console.info(
              `[useMicroApp] Dev mode detected for ${name}, using direct entry`,
            );
            entryFile = "src/entry-mfe.ts"; // or "src/entry-mfe.tsx" for React/Next
          }
        } catch (err) {
          // Fallback to dev mode
          console.info(
            `[useMicroApp] Manifest error for ${name}, using dev mode entry`,
          );
          entryFile = "src/entry-mfe.ts";
        }

        // Optimization: Skip injection if already loaded and version hasn't changed
        const isAlreadyRegistered = AppRegistry.isRegistered(name);
        const lastLoadedEntry = manifestCache[name];

        if (isAlreadyRegistered && lastLoadedEntry === entryFile) {
          if (mounted) await mountMicroApp();
          return;
        }

        manifestCache[name] = entryFile;

        // 3. Inject CSS
        cssFiles.forEach((css: string) => {
          const cssUrl = `${host}/${css}`;
          if (!document.querySelector(`link[href^="${cssUrl}"]`)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = cssUrl;
            document.head.appendChild(link);
          }
        });

        // 4. Inject JS
        const scriptUrl = `${host}/${entryFile}`;
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
        console.error(`[useMicroApp] Error loading ${name}:`, err);
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
        microApp.mount(containerRef.current, { theme: "light" });
        if (mounted) setStatus("mounted");
      } catch (err: unknown) {
        console.error(`[useMicroApp] Error executing ${name}:`, err);
        if (mounted) {
          setStatus("error");
          setErrorDetails(err instanceof Error ? err.message : String(err));
        }
      }
    };

    loadMfe();

    return () => {
      mounted = false;
      const app = AppRegistry.get(name);
      if (app && containerRef.current) {
        app.unmount(containerRef.current);
      }
    };
  }, [name, host]);

  return {
    containerRef,
    status,
    errorDetails,
  };
}
