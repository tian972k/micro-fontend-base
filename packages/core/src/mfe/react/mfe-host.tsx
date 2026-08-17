import React, { useEffect, useRef, useState } from "react";
import type { HealthCheckResponse, MicroApp, MfeManifest } from "../../types";
import { type MicroAppProps } from "../../types";
import { MfeError } from "./mfe-host-states/mfe-error";
import { MfeMaintenance } from "./mfe-host-states/mfe-maintenance";
import { MfeLoading } from "./mfe-host-states/mfe-loading";
import { MfeStrategyFactory } from "../strategy/factory";
import { type MicroAppType, MfeStatus } from "../../types";
import {
  MFE_REGISTERED_EVENT,
  type MfeRegisteredEventDetail,
} from "../registry";

/**
 * Validates that `host` is a well-formed absolute http(s) URL before it is
 * ever used to build a <script>/<link> src. This is a defense-in-depth
 * check: `host` should always come from trusted, server-controlled config
 * (see apps/shell/app/server/config.ts), never directly from user input,
 * but MfeHost is a reusable primitive and shouldn't assume its caller got
 * that right.
 */
function isValidMfeHost(host: string): boolean {
  try {
    const url = new URL(host);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Safe JSON.stringify for the `props` dependency comparison below.
 * Falls back to a stable placeholder instead of throwing if `props`
 * contains functions, circular references, etc.
 */
function safeStringifyProps(props: MicroAppProps): string {
  try {
    return JSON.stringify(props);
  } catch {
    return "[unserializable-props]";
  }
}

/**
 * Whether we're running in a dev build. Cache-busting query params
 * (`?t=timestamp`) are only appended in dev, where always-fresh health/
 * manifest checks matter more than CDN cacheability. In production this
 * would defeat CDN caching on every single MfeHost mount.
 */
function isDevBuild(): boolean {
  try {
    // Vite exposes this at build time; guarded for non-Vite consumers.
    return Boolean((import.meta as any)?.env?.DEV);
  } catch {
    return false;
  }
}

// Cache for manifest file names
const manifestCache: Record<string, string> = {};
// Cache for MFE versions - used to detect when to reload
const versionCache: Record<string, string> = {};

// Version check interval - 1 hour in milliseconds
const VERSION_CHECK_INTERVAL = 60 * 60 * 1000;
const VERSION_CACHE_KEY = "mfe_version_cache";

// Helper to get cached version info from localStorage
const getStoredVersionCache = (): Record<
  string,
  { version: string; checkedAt: number }
> => {
  try {
    const stored = localStorage.getItem(VERSION_CACHE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Helper to save version info to localStorage
const setStoredVersionCache = (
  name: string,
  version: string,
  checkedAt: number,
) => {
  try {
    const cache = getStoredVersionCache();
    cache[name] = { version, checkedAt };
    localStorage.setItem(VERSION_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore localStorage errors
  }
};

// Check if we should fetch health.json based on last check time
const shouldCheckVersion = (name: string): boolean => {
  const cache = getStoredVersionCache();
  const entry = cache[name];
  if (!entry) return true;

  const elapsed = Date.now() - entry.checkedAt;
  return elapsed >= VERSION_CHECK_INTERVAL;
};

// Get cached version from localStorage
const getCachedVersion = (name: string): string | null => {
  const cache = getStoredVersionCache();
  return cache[name]?.version || null;
};

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
  // If MFE is already loaded, start with LOADING status (faster mount, no "checking" phase)
  const [status, setStatus] = useState<MfeStatus>(
    typeof window !== "undefined" && window.MFE?.[name]
      ? MfeStatus.LOADING
      : MfeStatus.IDLE,
  );
  const [errorDetails, setErrorDetails] = useState<string>("");
  // Track if this is a "fast mount" (MFE already loaded)
  const isFastMount = useRef(
    typeof window !== "undefined" && !!window.MFE?.[name],
  );

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

        // Event-driven wait instead of polling: AppRegistry.register()
        // dispatches MFE_REGISTERED_EVENT on window as soon as the app
        // is available, so we just listen for that (with a timeout as
        // a safety net in case registration never happens).
        const onRegistered = (event: Event) => {
          const detail = (event as CustomEvent<MfeRegisteredEventDetail>)
            .detail;
          if (detail?.name === name && window.MFE?.[name]) {
            cleanup();
            resolve(window.MFE[name]);
          }
        };

        const timeoutId = setTimeout(() => {
          cleanup();
          reject(
            new Error(`Timeout waiting for MicroApp "${name}" to register`),
          );
        }, timeout);

        const cleanup = () => {
          clearTimeout(timeoutId);
          window.removeEventListener(MFE_REGISTERED_EVENT, onRegistered);
        };

        window.addEventListener(MFE_REGISTERED_EVENT, onRegistered);
      });
    };

    const loadMfe = async () => {
      if (!mounted) return;

      // Reject early if `host` isn't a well-formed http(s) URL, before it's
      // ever interpolated into a fetch URL or a <script>/<link> src.
      if (!isValidMfeHost(host)) {
        console.error(`[MfeHost] Invalid host for "${name}": "${host}"`);
        if (mounted) {
          setStatus(MfeStatus.ERROR);
          setErrorDetails(`Invalid MFE host configuration for "${name}"`);
        }
        return;
      }

      // Cache-busting query param, dev-only (see isDevBuild doc comment).
      const cacheBust = isDevBuild() ? `?t=${Date.now()}` : "";

      // Helper to fetch health.json
      const fetchHealth = async (): Promise<HealthCheckResponse> => {
        let healthCheckUrl = `${host}`;
        if (!healthCheckUrl.includes("health.json")) {
          healthCheckUrl = `${host}${host.endsWith("/") ? "" : "/"}health.json${cacheBust}`;
        }

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

        return healthRes.json();
      };

      // Helper to fetch manifest.json
      const fetchManifest = async (): Promise<MfeManifest> => {
        const manifestRes = await fetch(`${host}/manifest.json${cacheBust}`);
        if (!manifestRes.ok) throw new Error("Manifest not found");
        return manifestRes.json();
      };

      // --- CHECK IF ALREADY LOADED ---
      if (window.MFE?.[name]) {
        if (!shouldCheckVersion(name)) {
          const cachedVersion = getCachedVersion(name);
          console.log(
            `[MfeHost] ${name} already loaded (v${cachedVersion || "unknown"}), mounting directly (cache valid)`,
          );
          if (mounted) await mountMicroApp();
          return;
        }

        try {
          // Blocking on purpose: we need the confirmed version before
          // deciding whether to reuse the mounted app or reload it.
          const health = await fetchHealth();
          const cachedVersion = getCachedVersion(name);

          if (
            health.version &&
            cachedVersion &&
            health.version !== cachedVersion
          ) {
            console.log(
              `[MfeHost] ${name} version changed: ${cachedVersion} → ${health.version}, reloading...`,
            );
            setStoredVersionCache(name, health.version, Date.now());
            delete window.MFE[name];
            delete manifestCache[name];
            // Fall through to full load
          } else {
            console.log(
              `[MfeHost] ${name} already loaded (v${health.version || "unknown"}), mounting directly`,
            );
            if (health.version) {
              setStoredVersionCache(name, health.version, Date.now());
              versionCache[name] = health.version;
            }
            if (mounted) await mountMicroApp();
            return;
          }
        } catch {
          console.warn(
            `[MfeHost] ${name} health check failed, using cached version`,
          );
          if (mounted) await mountMicroApp();
          return;
        }
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

        // Fetch health and manifest in parallel to shave latency off the
        // happy path. If the app turns out to be in maintenance mode, we
        // simply discard the (already in-flight) manifest response below.
        const healthPromise = fetchHealth();
        const manifestPromise = fetchManifest();

        // Wait for health check first to check status
        const health = await healthPromise;
        if (health.status === "maintenance") {
          if (mounted) setStatus(MfeStatus.MAINTENANCE);
          return;
        }

        // Cache version
        if (health.version) {
          versionCache[name] = health.version;
          setStoredVersionCache(name, health.version, Date.now());
        }

        // Wait for manifest
        if (mounted) setStatus(MfeStatus.LOADING);
        const manifest = await manifestPromise;

        // Process Manifest
        const mfeEntryKey = Object.keys(manifest).find((key) =>
          key.match(/^src\/entry-mfe\.(ts|tsx|js)$/),
        );

        const entryKey = mfeEntryKey || "index.html";
        const entryData = manifest[entryKey] || (manifest["index.html"] as any);

        if (!entryData) throw new Error("Entry file not found in manifest");

        const entryFile = entryData.file;
        const cssFiles = entryData.css || [];

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

        // CACHE OPTIMIZATION:
        // Only add timestamp if file does not look hashed.
        // Hashed files (standard Vite output): ends with .[hash].js or -[hash].js
        const isHashedFile =
          /\.[a-f0-9]{8,}\.(js|mjs)$/i.test(entryFile) ||
          /-[a-f0-9]{8,}\.(js|mjs)$/i.test(entryFile);

        const scriptUrlWithCache = isHashedFile
          ? scriptUrl
          : `${scriptUrl}${scriptUrl.includes("?") ? "&" : "?"}t=${Date.now()}`;

        // Remove existing script if present
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
  }, [name, host, type, safeStringifyProps(props)]);

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
      {/* Only show loading for fresh loads, not fast mounts */}
      {!isFastMount.current &&
        (status === MfeStatus.CHECKING || status === MfeStatus.LOADING) &&
        (loadingComponent || <MfeLoading name={name} />)}
      <div
        ref={containerRef}
        id={`mfe-host-${name}`}
        className="w-full h-full"
      />
    </div>
  );
}
