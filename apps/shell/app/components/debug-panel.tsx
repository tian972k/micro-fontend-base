import { useState, useEffect } from "react";
import { perfMonitor } from "@repo/core/performance/monitor";
import { mfeLogger } from "@repo/core/logger";
import { Button } from "@repo/ui";
import { cn } from "@repo/utils";

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [debugMode, setDebugMode] = useState(mfeLogger.isDebugEnabled());

  useEffect(() => {
    if (isOpen) {
      setMetrics(perfMonitor.getAllMetrics());
    }
  }, [isOpen]);

  const toggleDebug = () => {
    const newMode = !debugMode;
    setDebugMode(newMode);
    if (newMode) {
      mfeLogger.enableDebug();
    } else {
      mfeLogger.disableDebug();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white shadow-lg hover:bg-gray-800"
        title="Open Debug Panel"
      >
        🔍 Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        <h3 className="font-semibold">🔍 MFE Debug Panel</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-7 w-7 text-gray-400 hover:bg-gray-700 hover:text-white"
          aria-label="Close debug panel"
        >
          ✕
        </Button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3 overflow-y-auto max-h-80">
        {/* Debug Mode Toggle */}
        <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
          <span className="text-sm">Debug Logging</span>
          <Button
            size="sm"
            onClick={toggleDebug}
            aria-pressed={debugMode}
            className={cn(
              "h-7 px-3 text-xs text-white",
              debugMode
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-700 hover:bg-gray-600",
            )}
          >
            {debugMode ? "ON" : "OFF"}
          </Button>
        </div>

        {/* Performance Metrics */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 mb-2">
            Performance Metrics
          </h4>
          {metrics.length === 0 ? (
            <p className="text-xs text-gray-500">No metrics available</p>
          ) : (
            <div className="space-y-2">
              {metrics.map((metric) => (
                <div
                  key={metric.mfeId}
                  className="p-2 bg-gray-800 rounded text-xs"
                >
                  <div className="font-semibold text-blue-400">
                    {metric.mfeId}
                  </div>
                  <div className="mt-1 space-y-0.5 text-gray-300">
                    <div>Load: {metric.loadTime.toFixed(2)}ms</div>
                    <div>Mount: {metric.mountTime.toFixed(2)}ms</div>
                    {metric.bundleSize && (
                      <div>
                        Bundle: {(metric.bundleSize / 1024).toFixed(2)}KB
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setMetrics(perfMonitor.getAllMetrics())}
            className="flex-1 bg-blue-600 text-xs text-white hover:bg-blue-700"
          >
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => perfMonitor.exportMetrics()}
            className="flex-1 bg-gray-700 text-xs text-white hover:bg-gray-600"
          >
            Export
          </Button>
        </div>

        {/* Console Commands */}
        <div className="p-2 bg-gray-800 rounded">
          <div className="text-xs font-semibold text-gray-400 mb-1">
            Console Commands
          </div>
          <code className="text-xs text-green-400 block">
            __MFE_DEBUG__.enableDebug()
          </code>
          <code className="text-xs text-green-400 block">
            __MFE_PERF__.getMetrics()
          </code>
        </div>
      </div>
    </div>
  );
}
