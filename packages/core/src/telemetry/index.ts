/**
 * Pluggable telemetry shared by the shell and every MFE.
 *
 * Code reports through `telemetry` (errors, metrics, events); the host app
 * decides where it goes by installing reporters once at startup:
 *
 *   setTelemetryReporters([
 *     createBeaconReporter("/api/telemetry"),
 *     createSentryReporter(Sentry), // optional, any Sentry-like client
 *   ]);
 *
 * Reporters live on `window`, so MFE bundles (which each have their own
 * copy of @repo/core) all report to the reporters the shell installed.
 */

export type TelemetryLevel = "error" | "warning" | "info";

export interface TelemetryContext {
  /** MFE that produced the report ("shell" for the host). */
  mfeId?: string;
  /** Where it happened, e.g. "MfeHost.load" or "ErrorBoundary". */
  source?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

export type TelemetryRecord =
  | {
      kind: "error";
      level: TelemetryLevel;
      message: string;
      name?: string;
      stack?: string;
      context: TelemetryContext;
      timestamp: string;
    }
  | {
      kind: "metric";
      name: string;
      value: number;
      unit?: string;
      context: TelemetryContext;
      timestamp: string;
    }
  | {
      kind: "event";
      name: string;
      context: TelemetryContext;
      timestamp: string;
    };

export interface TelemetryReporter {
  report(record: TelemetryRecord): void;
  /** Send anything buffered (called on page hide). */
  flush?(): void;
}

const GLOBAL_KEY = "__MFE_TELEMETRY__";

type TelemetryGlobal = { reporters: TelemetryReporter[] };

function getGlobal(): TelemetryGlobal {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: TelemetryGlobal;
  };
  if (!g[GLOBAL_KEY]) g[GLOBAL_KEY] = { reporters: [] };
  return g[GLOBAL_KEY];
}

/** Replace the active reporters (normally called once by the shell). */
export function setTelemetryReporters(reporters: TelemetryReporter[]): void {
  getGlobal().reporters = reporters;
}

export function addTelemetryReporter(reporter: TelemetryReporter): () => void {
  const global = getGlobal();
  global.reporters = [...global.reporters, reporter];
  return () => {
    global.reporters = global.reporters.filter((r) => r !== reporter);
  };
}

function dispatch(record: TelemetryRecord) {
  for (const reporter of getGlobal().reporters) {
    try {
      reporter.report(record);
    } catch {
      // A broken reporter must never take the app (or other reporters) down.
    }
  }
}

function toErrorParts(error: unknown) {
  if (error instanceof Error) {
    return { message: error.message, name: error.name, stack: error.stack };
  }
  return { message: typeof error === "string" ? error : String(error) };
}

export const telemetry = {
  captureError(
    error: unknown,
    context: TelemetryContext = {},
    level: TelemetryLevel = "error",
  ) {
    dispatch({
      kind: "error",
      level,
      ...toErrorParts(error),
      context,
      timestamp: new Date().toISOString(),
    });
  },
  captureMetric(
    name: string,
    value: number,
    context: TelemetryContext = {},
    unit?: string,
  ) {
    dispatch({
      kind: "metric",
      name,
      value,
      unit,
      context,
      timestamp: new Date().toISOString(),
    });
  },
  captureEvent(name: string, context: TelemetryContext = {}) {
    dispatch({
      kind: "event",
      name,
      context,
      timestamp: new Date().toISOString(),
    });
  },
  flush() {
    for (const reporter of getGlobal().reporters) {
      try {
        reporter.flush?.();
      } catch {
        // ignore
      }
    }
  },
};

/**
 * Batches records and ships them with navigator.sendBeacon (falls back to
 * fetch keepalive). Flushes when the batch is full, on an interval, and
 * when the page is hidden, so reports survive navigation/tab close.
 */
export function createBeaconReporter(
  endpoint: string,
  { maxBatch = 20, intervalMs = 5000 } = {},
): TelemetryReporter {
  let queue: TelemetryRecord[] = [];

  const flush = () => {
    if (queue.length === 0) return;
    const body = JSON.stringify({ records: queue });
    queue = [];
    try {
      const sent =
        typeof navigator !== "undefined" &&
        typeof navigator.sendBeacon === "function" &&
        navigator.sendBeacon(
          endpoint,
          new Blob([body], { type: "application/json" }),
        );
      if (!sent && typeof fetch === "function") {
        void fetch(endpoint, {
          method: "POST",
          body,
          headers: { "Content-Type": "application/json" },
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // telemetry is best-effort
    }
  };

  if (typeof window !== "undefined") {
    setInterval(flush, intervalMs);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
  }

  return {
    report(record) {
      queue.push(record);
      if (queue.length >= maxBatch) flush();
    },
    flush,
  };
}

/** The part of a Sentry client (browser SDK) this adapter uses. */
export interface SentryLike {
  captureException(error: unknown, context?: Record<string, unknown>): unknown;
  captureMessage?(message: string, context?: Record<string, unknown>): unknown;
}

/** Forwards errors to Sentry (or any API-compatible client). */
export function createSentryReporter(sentry: SentryLike): TelemetryReporter {
  return {
    report(record) {
      if (record.kind !== "error") return;
      const error = Object.assign(new Error(record.message), {
        name: record.name ?? "Error",
        stack: record.stack,
      });
      sentry.captureException(error, {
        level: record.level,
        tags: {
          mfe: record.context.mfeId ?? "unknown",
          source: record.context.source ?? "unknown",
          ...record.context.tags,
        },
        extra: record.context.extra,
      });
    },
  };
}

/**
 * Report uncaught errors and unhandled promise rejections. Call once in
 * the host; returns a cleanup function.
 */
export function captureGlobalErrors(context: TelemetryContext = {}) {
  if (typeof window === "undefined") return () => {};
  const onError = (event: ErrorEvent) =>
    telemetry.captureError(event.error ?? event.message, {
      ...context,
      source: "window.onerror",
    });
  const onRejection = (event: PromiseRejectionEvent) =>
    telemetry.captureError(event.reason, {
      ...context,
      source: "unhandledrejection",
    });
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
}
