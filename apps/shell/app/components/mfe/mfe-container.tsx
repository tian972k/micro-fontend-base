import { MfeHost, MicroAppType } from "@repo/core/react";
import { mfeLoaders } from "virtual:mfe-loaders";

interface MfeContainerProps {
  appName: string;
  appType: MicroAppType;
  host: string;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * MfeContainer
 *
 * A higher-level wrapper around MfeHost that encapsulates the logic for
 * loading Micro-Frontends in both Development (Federation) and Production (Manifest) modes.
 *
 * Logic:
 * - Dev: Uses Module Federation via `virtual:mfe-loaders` to support HMR.
 * - Prod: Passes undefined to `remoteLoader`, letting MfeHost use the Manifest strategy.
 */
export function MfeContainer({
  appName,
  appType,
  host,
  className,
  fallback,
}: MfeContainerProps) {
  // In Dev mode, we try to get the federated loader from the virtual module.
  const devRemoteLoader = import.meta.env.DEV ? mfeLoaders[appName] : undefined;

  // In Prod, we construct a dynamic loader using the standard Federation pattern
  const prodRemoteLoader = async () => {
    // 1. Load remoteEntry.js
    await new Promise<void>((resolve, reject) => {
      // Ensure no double slashes
      const cleanHost = host.endsWith("/") ? host.slice(0, -1) : host;
      const remoteEntryUrl = `${cleanHost}/remoteEntry.js`;

      if (document.querySelector(`script[src="${remoteEntryUrl}"]`)) {
        return resolve();
      }
      const script = document.createElement("script");
      script.src = remoteEntryUrl;
      script.type = "module";
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error(`Failed to load remoteEntry: ${remoteEntryUrl}`));
      document.body.appendChild(script);
    });

    // 2. Initialize the container
    // valid variable name from app-name: app-react -> app_react
    const scope = appName.replace(/-/g, "_");
    const container = (window as any)[scope];

    if (!container) {
      throw new Error(`Remote container ${scope} not found on window`);
    }

    // Initialize with shared scope if not already initialized
    // The Shell (Host) initializes the shared scope, so we pass it to the Remote
    if (!container.__initialized) {
      // @ts-ignore
      await container.init(__federation_shared__);
      container.__initialized = true;
    }

    // 3. Get the module
    const factory = await container.get("./Mfe");
    const Module = factory();
    return Module;
  };

  const remoteLoader = import.meta.env.DEV ? devRemoteLoader : prodRemoteLoader;

  return (
    <MfeHost
      name={appName}
      type={appType}
      host={host}
      remoteLoader={remoteLoader}
      className={className}
      fallback={fallback}
    />
  );
}
