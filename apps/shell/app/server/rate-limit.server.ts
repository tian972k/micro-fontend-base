/**
 * Small in-memory rate limiter (fixed window per key).
 *
 * Good enough to blunt password guessing and log flooding on a single
 * instance. Counters are per process: behind several instances or on
 * serverless, back `createRateLimiter` with a shared store (Redis,
 * Upstash, ...) or enforce the limit at the edge/WAF instead.
 */

export interface RateLimitResult {
  allowed: boolean;
  /** Requests left in the current window. */
  remaining: number;
  /** Seconds until the window resets (for the Retry-After header). */
  retryAfterSeconds: number;
}

export interface RateLimiterOptions {
  /** Requests allowed per window. */
  limit: number;
  windowMs: number;
  /** Injectable clock, for tests. */
  now?: () => number;
  /** Upper bound on tracked keys, so a flood of keys can't grow memory. */
  maxKeys?: number;
}

export interface RateLimiter {
  /** Counts one request for `key` and reports whether it is allowed. */
  consume(key: string): RateLimitResult;
  /** Forget `key` (e.g. after a successful login). */
  reset(key: string): void;
}

export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
  maxKeys = 10_000,
}: RateLimiterOptions): RateLimiter {
  const windows = new Map<string, { count: number; resetAt: number }>();

  function prune(current: number) {
    for (const [key, entry] of windows) {
      if (entry.resetAt <= current) windows.delete(key);
    }
    // Still full of live windows: drop the oldest entries.
    while (windows.size >= maxKeys) {
      const oldest = windows.keys().next().value;
      if (oldest === undefined) break;
      windows.delete(oldest);
    }
  }

  return {
    consume(key) {
      const current = now();
      let entry = windows.get(key);
      if (!entry || entry.resetAt <= current) {
        if (windows.size >= maxKeys) prune(current);
        entry = { count: 0, resetAt: current + windowMs };
        windows.set(key, entry);
      }
      entry.count += 1;
      return {
        allowed: entry.count <= limit,
        remaining: Math.max(0, limit - entry.count),
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((entry.resetAt - current) / 1000),
        ),
      };
    },
    reset(key) {
      windows.delete(key);
    },
  };
}

/**
 * Best-effort client address. Behind a proxy/CDN the left-most
 * X-Forwarded-For entry is the client; make sure your proxy overwrites
 * that header rather than appending to a client-supplied one.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** 5 failed sign-ins per 15 minutes per client address. */
export const loginRateLimiter = createRateLimiter({
  limit: 5,
  windowMs: 15 * 60 * 1000,
});

/** 60 telemetry batches per minute per client address. */
export const telemetryRateLimiter = createRateLimiter({
  limit: 60,
  windowMs: 60 * 1000,
});
