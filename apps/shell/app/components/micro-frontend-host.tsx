import { useMicroApp } from "@/hooks/useMicroApp";

interface MicroFrontendHostProps {
  name: string;
  host: string;
}

/**
 * Host component for rendering a Micro-Frontend.
 * Responsibilities include rendering the container and handling loading/error/maintenance UI.
 */
export function MicroFrontendHost({ name, host }: MicroFrontendHostProps) {
  const { containerRef, status, errorDetails } = useMicroApp({ name, host });

  // Render Logic for special states
  if (status === "maintenance") {
    return (
      <div className="p-8 text-center border-2 border-yellow-200 bg-yellow-50 rounded-lg">
        <h3 className="text-xl font-bold text-yellow-800">Under Maintenance</h3>
        <p className="text-yellow-700">
          This application is currently undergoing scheduled maintenance.
        </p>
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
            <p className="text-muted-foreground text-sm font-medium">
              Loading {name}...
            </p>
          </div>
        </div>
      )}

      {/* The Actual MFE Container - Always Present */}
      <div ref={containerRef} id={`mfe-${name}`} className="h-full w-full" />
    </div>
  );
}
