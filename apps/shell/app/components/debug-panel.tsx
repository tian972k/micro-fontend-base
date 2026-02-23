import { useState, useEffect } from "react";
import { perfMonitor } from "@repo/core/performance/monitor";
import { mfeLogger } from "@repo/core/logger";

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
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 text-sm font-medium"
        title="Open Debug Panel"
      >
        🔍 Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        <h3 className="font-semibold">🔍 MFE Debug Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3 overflow-y-auto max-h-80">
        {/* Debug Mode Toggle */}
        <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
          <span className="text-sm">Debug Logging</span>
          <button
            onClick={toggleDebug}
            className={`px-3 py-1 rounded text-xs font-medium ${
              debugMode
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {debugMode ? "ON" : "OFF"}
          </button>
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
          <button
            onClick={() => setMetrics(perfMonitor.getAllMetrics())}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              perfMonitor.exportMetrics();
            }}
            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs font-medium"
          >
            Export
          </button>
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
