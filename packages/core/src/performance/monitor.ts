import { mfeLogger } from "../logger";

interface PerformanceMetrics {
  mfeId: string;
  loadTime: number;
  mountTime: number;
  bundleSize?: number;
  timestamp: string;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== "undefined" && window.PerformanceObserver) {
      this.setupObservers();
    }
  }

  private setupObservers() {
    // Monitor resource loading
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes("remoteEntry.js")) {
          const mfeId = this.extractMfeIdFromUrl(entry.name);
          if (mfeId) {
            mfeLogger.perf(`MFE Load: ${mfeId}`, entry.duration);
          }
        }
      }
    });

    try {
      resourceObserver.observe({ entryTypes: ["resource"] });
      this.observers.push(resourceObserver);
    } catch (error) {
      console.warn("Resource observer not supported", error);
    }

    // Monitor long tasks
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn(`⚠️ Long task detected: ${entry.duration}ms`);
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ["longtask"] });
      this.observers.push(longTaskObserver);
    } catch (error) {
      // longtask not supported in all browsers
      console.warn("Long task observer not supported", error);
    }
  }

  private extractMfeIdFromUrl(url: string): string | null {
    const match = url.match(/localhost:(\d+)/);
    if (!match) return null;

    const portMap: Record<string, string> = {
      "8001": "app-react",
      "8002": "app-nextjs",
      "8003": "app-vue",
      "8004": "app-svelte",
      "8005": "app-solidjs",
    };

    return portMap[match[1]] || null;
  }

  /**
   * Start measuring MFE load time
   */
  startMfeLoad(mfeId: string) {
    performance.mark(`mfe-${mfeId}-start`);
  }

  /**
   * End measuring MFE load time
   */
  endMfeLoad(mfeId: string) {
    performance.mark(`mfe-${mfeId}-end`);

    try {
      performance.measure(
        `mfe-${mfeId}-load`,
        `mfe-${mfeId}-start`,
        `mfe-${mfeId}-end`,
      );

      const measure = performance.getEntriesByName(`mfe-${mfeId}-load`)[0];
      if (measure) {
        mfeLogger.perf(`MFE ${mfeId} total load`, measure.duration);

        this.metrics.set(mfeId, {
          mfeId,
          loadTime: measure.duration,
          mountTime: 0,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn("Performance measurement failed:", e);
    }
  }

  /**
   * Measure mount time
   */
  measureMount(mfeId: string, callback: () => void) {
    const start = performance.now();
    callback();
    const duration = performance.now() - start;

    mfeLogger.perf(`MFE ${mfeId} mount`, duration);

    const existing = this.metrics.get(mfeId);
    if (existing) {
      existing.mountTime = duration;
    }
  }

  /**
   * Get metrics for a specific MFE
   */
  getMetrics(mfeId: string): PerformanceMetrics | undefined {
    return this.metrics.get(mfeId);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics() {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: this.getAllMetrics(),
      navigation: this.getNavigationTiming(),
    };

    console.table(this.getAllMetrics());
    return data;
  }

  /**
   * Get navigation timing
   */
  private getNavigationTiming() {
    if (typeof window === "undefined") return null;

    const nav = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    if (!nav) return null;

    return {
      dns: nav.domainLookupEnd - nav.domainLookupStart,
      tcp: nav.connectEnd - nav.connectStart,
      ttfb: nav.responseStart - nav.requestStart,
      download: nav.responseEnd - nav.responseStart,
      domInteractive: nav.domInteractive - nav.fetchStart,
      domComplete: nav.domComplete - nav.fetchStart,
      loadComplete: nav.loadEventEnd - nav.fetchStart,
    };
  }

  /**
   * Cleanup observers
   */
  disconnect() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

export const perfMonitor = new PerformanceMonitor();

// Add to window for debugging
if (typeof window !== "undefined") {
  (window as any).__MFE_PERF__ = {
    getMetrics: () => perfMonitor.getAllMetrics(),
    export: () => perfMonitor.exportMetrics(),
  };
}
