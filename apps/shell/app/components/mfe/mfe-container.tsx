import { MfeHost, MicroAppType } from "@repo/core";
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
  // In Dev mode, we try to get the federated loader.
  // In Prod mode, this will be undefined (or the map will be empty), fallback to Manifest.
  const remoteLoader = import.meta.env.DEV ? mfeLoaders[appName] : undefined;

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
