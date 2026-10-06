import {
  captureGlobalErrors,
  createBeaconReporter,
  createSentryReporter,
  setTelemetryReporters,
  telemetry,
} from "@repo/core/react";

let started = false;

/**
 * Installs the platform telemetry reporters (shared by every MFE on the
 * page) and starts Core Web Vitals collection. Safe to call repeatedly.
 */
export function startTelemetry(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  setTelemetryReporters([
    createBeaconReporter("/api/telemetry"),
    // If the host page loads the Sentry browser SDK, forward errors too.
    ...(window.Sentry ? [createSentryReporter(window.Sentry)] : []),
  ]);
  captureGlobalErrors({ mfeId: "shell" });

  void import("web-vitals")
    .then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      const report = (metric: {
        name: string;
        value: number;
        rating: string;
      }) =>
        telemetry.captureMetric(
          `web_vitals.${metric.name.toLowerCase()}`,
          metric.value,
          {
            mfeId: "shell",
            source: "web-vitals",
            tags: { rating: metric.rating, page: window.location.pathname },
          },
          metric.name === "CLS" ? undefined : "ms",
        );
      onCLS(report);
      onINP(report);
      onLCP(report);
      onFCP(report);
      onTTFB(report);
    })
    .catch((error: unknown) =>
      telemetry.captureError(error, { mfeId: "shell", source: "web-vitals" }),
    );
}
