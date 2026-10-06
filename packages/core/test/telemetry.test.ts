import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addTelemetryReporter,
  captureGlobalErrors,
  createBeaconReporter,
  createSentryReporter,
  setTelemetryReporters,
  telemetry,
  type TelemetryRecord,
} from "../src/telemetry";

afterEach(() => setTelemetryReporters([]));

describe("telemetry", () => {
  it("fans records out to every reporter and isolates broken ones", () => {
    const seen: TelemetryRecord[] = [];
    setTelemetryReporters([
      {
        report: () => {
          throw new Error("broken reporter");
        },
      },
      { report: (r) => void seen.push(r) },
    ]);

    telemetry.captureError(new TypeError("boom"), { mfeId: "app-a" });
    telemetry.captureMetric("lcp", 1200, { mfeId: "shell" }, "ms");
    telemetry.captureEvent("login");

    expect(seen.map((r) => r.kind)).toEqual(["error", "metric", "event"]);
    expect(seen[0]).toMatchObject({
      message: "boom",
      name: "TypeError",
      context: { mfeId: "app-a" },
    });
  });

  it("normalizes non-Error values", () => {
    const report = vi.fn();
    setTelemetryReporters([{ report }]);
    telemetry.captureError("plain string");
    expect(report.mock.calls[0][0]).toMatchObject({ message: "plain string" });
  });

  it("addTelemetryReporter returns an unsubscribe", () => {
    const report = vi.fn();
    const remove = addTelemetryReporter({ report });
    remove();
    telemetry.captureEvent("x");
    expect(report).not.toHaveBeenCalled();
  });

  it("beacon reporter batches and flushes", () => {
    const sendBeacon = vi.fn(() => true);
    Object.defineProperty(navigator, "sendBeacon", {
      value: sendBeacon,
      configurable: true,
    });
    const reporter = createBeaconReporter("/api/telemetry", { maxBatch: 2 });
    setTelemetryReporters([reporter]);

    telemetry.captureEvent("a");
    expect(sendBeacon).not.toHaveBeenCalled();
    telemetry.captureEvent("b"); // hits maxBatch
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(sendBeacon.mock.calls[0][0]).toBe("/api/telemetry");

    telemetry.captureEvent("c");
    telemetry.flush();
    expect(sendBeacon).toHaveBeenCalledTimes(2);
  });

  it("sentry reporter forwards only errors with tags", () => {
    const sentry = { captureException: vi.fn() };
    setTelemetryReporters([createSentryReporter(sentry)]);
    telemetry.captureMetric("cls", 0.1);
    telemetry.captureError(new Error("x"), { mfeId: "app-b", source: "s" });
    expect(sentry.captureException).toHaveBeenCalledTimes(1);
    expect(sentry.captureException.mock.calls[0][1]).toMatchObject({
      tags: { mfe: "app-b", source: "s" },
    });
  });

  it("captures unhandled rejections", () => {
    const report = vi.fn();
    setTelemetryReporters([{ report }]);
    const stop = captureGlobalErrors({ mfeId: "shell" });
    const event = new Event("unhandledrejection") as PromiseRejectionEvent;
    Object.defineProperty(event, "reason", { value: new Error("nope") });
    window.dispatchEvent(event);
    stop();
    expect(report.mock.calls[0][0]).toMatchObject({
      message: "nope",
      context: { mfeId: "shell", source: "unhandledrejection" },
    });
  });
});
