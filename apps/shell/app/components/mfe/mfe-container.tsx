import { MfeHost, MicroAppType } from "@repo/core/react";
import { loadMfeRemote } from "@/lib/federation";

interface MfeContainerProps {
  appName: string;
  appType: MicroAppType;
  host: string;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * MfeHost wired to Module Federation 2.0: the remote is loaded with
 * @module-federation/runtime (same path in dev and production), and
 * MfeHost handles health checks, loading/error/maintenance UI and
 * mount/unmount.
 */
export function MfeContainer({
  appName,
  appType,
  host,
  className,
  fallback,
}: MfeContainerProps) {
  return (
    <MfeHost
      name={appName}
      type={appType}
      host={host}
      remoteLoader={() => loadMfeRemote(appName, host)}
      className={className}
      fallback={fallback}
    />
  );
}
