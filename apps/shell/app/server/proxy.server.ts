/**
 * Pure helpers for the MFE proxy route (/api/proxy/<slug>/<path>).
 * Kept apart from the route so they can be unit-tested.
 */

/**
 * Request headers that must not be forwarded to MFE origins: the shell's
 * session cookie / credentials belong to the shell only, and hop-by-hop or
 * host headers would be wrong for the upstream request anyway.
 */
const STRIPPED_REQUEST_HEADERS = [
  "cookie",
  "authorization",
  "host",
  "connection",
  "content-length",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-real-ip",
];

export function buildUpstreamHeaders(incoming: Headers): Headers {
  const headers = new Headers(incoming);
  for (const name of STRIPPED_REQUEST_HEADERS) {
    headers.delete(name);
  }
  return headers;
}

/**
 * Response headers dropped on the way back: fetch() already decoded the
 * body (so encoding/length no longer match), and an MFE origin must never
 * set cookies on the shell's domain.
 */
const STRIPPED_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "set-cookie",
]);

export function isStaticAsset(path: string): boolean {
  return /\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|ico|json)(\?.*)?$/i.test(
    path,
  );
}

/** Content-hashed files never change; everything else is revalidated soon. */
export function cacheControlFor(path: string): string | null {
  if (!isStaticAsset(path)) return null;
  const hasHash =
    /\.[a-f0-9]{8,}\.(js|css)$/i.test(path) ||
    /-([\w]{8,})\.(js|css)$/i.test(path);
  return hasHash
    ? "public, max-age=31536000, immutable"
    : "public, max-age=3600";
}

export function buildDownstreamHeaders(
  upstream: Headers,
  options: { origin: string; app: string; path: string },
): Headers {
  const headers = new Headers();
  for (const [key, value] of upstream.entries()) {
    if (STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) continue;
    headers.set(key, value);
  }

  // Responses are consumed by the shell itself, so only its own origin
  // (whatever domain it's deployed on) needs to be allowed.
  headers.set("Access-Control-Allow-Origin", options.origin);
  headers.set("Vary", "Origin");
  headers.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization");
  headers.set("X-Proxy-For", options.app);

  const cacheControl = cacheControlFor(options.path);
  if (cacheControl) headers.set("Cache-Control", cacheControl);
  return headers;
}

/**
 * Cached availability per app. A healthy result is trusted for minutes;
 * a failure only briefly, so one blip doesn't take an MFE offline for
 * the whole cache lifetime.
 */
export const HEALTHY_TTL_MS = 5 * 60 * 1000;
export const UNHEALTHY_TTL_MS = 15 * 1000;

export function createHealthCache(now: () => number = Date.now) {
  const cache = new Map<string, { timestamp: number; isHealthy: boolean }>();
  return {
    get(app: string): boolean | undefined {
      const entry = cache.get(app);
      if (!entry) return undefined;
      const ttl = entry.isHealthy ? HEALTHY_TTL_MS : UNHEALTHY_TTL_MS;
      return now() - entry.timestamp < ttl ? entry.isHealthy : undefined;
    },
    set(app: string, isHealthy: boolean) {
      cache.set(app, { timestamp: now(), isHealthy });
    },
  };
}
