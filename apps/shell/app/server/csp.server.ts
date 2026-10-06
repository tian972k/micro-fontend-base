import { randomBytes } from "node:crypto";
import { getAppConfig } from "./config";

export type CspMode = "enforce" | "report-only" | "off";

export function createNonce(): string {
  return randomBytes(16).toString("base64");
}

/**
 * CSP_MODE=enforce|report-only|off. Defaults to enforce in production and
 * report-only in development (Vite HMR and dev tooling need things a
 * strict production policy rightly forbids, so violations are only
 * reported there).
 */
export function getCspMode(): CspMode {
  const mode = process.env.CSP_MODE;
  if (mode === "enforce" || mode === "report-only" || mode === "off") {
    return mode;
  }
  return process.env.NODE_ENV === "production" ? "enforce" : "report-only";
}

/** Origins the browser loads MFE code/assets from (absolute hosts only). */
function getMfeOrigins(): string[] {
  const origins = new Set<string>();
  for (const host of Object.values(getAppConfig().apps)) {
    try {
      // Relative hosts (/api/proxy/...) are same-origin and covered by 'self'.
      if (/^https?:\/\//.test(host)) origins.add(new URL(host).origin);
    } catch {
      // ignore malformed entries; MfeHost rejects them at runtime anyway
    }
  }
  for (const extra of (process.env.CSP_EXTRA_ORIGINS ?? "").split(",")) {
    if (extra.trim()) origins.add(extra.trim());
  }
  return [...origins];
}

export function buildContentSecurityPolicy(nonce: string): string {
  const isDev = process.env.NODE_ENV !== "production";
  const mfe = getMfeOrigins();

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // 'strict-dynamic' lets nonce'd scripts (Remix runtime, federation
    // loader) load MFE entry modules; the origins are a fallback for
    // browsers without strict-dynamic support.
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...mfe],
    // MFEs and Radix inject <style> tags / inline styles at runtime.
    "style-src": ["'self'", "'unsafe-inline'", ...mfe],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "font-src": ["'self'", "data:", ...mfe],
    "connect-src": ["'self'", ...mfe, ...(isDev ? ["ws:", "wss:"] : [])],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "object-src": ["'none'"],
  };

  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}

/** Sets CSP plus the other baseline security headers on a document response. */
export function applySecurityHeaders(headers: Headers, nonce: string): void {
  const mode = getCspMode();
  if (mode !== "off") {
    headers.set(
      mode === "enforce"
        ? "Content-Security-Policy"
        : "Content-Security-Policy-Report-Only",
      buildContentSecurityPolicy(nonce),
    );
  }
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Frame-Options", "DENY");
}
