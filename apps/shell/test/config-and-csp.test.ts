import { afterEach, describe, expect, it, vi } from "vitest";
import { MFE_APPS } from "@repo/config";
import { envKeyFor, getAppUrl } from "../app/server/config";
import {
  buildContentSecurityPolicy,
  getCspMode,
} from "../app/server/csp.server";

const app = MFE_APPS[0];

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getAppUrl", () => {
  it("derives the override key from the app id", () => {
    expect(envKeyFor({ id: "app-react" })).toBe("MFE_URL_APP_REACT");
  });

  it("prefers MFE_URL_<ID> over everything else", () => {
    vi.stubEnv(envKeyFor(app), "https://cdn.example.com/v42/");
    expect(getAppUrl(app.id)).toBe("https://cdn.example.com/v42/");
  });

  it("uses the dev server outside production", () => {
    expect(getAppUrl(app.id)).toBe(`http://localhost:${app.port}`);
  });

  it("uses the same-origin proxy on Vercel", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL", "1");
    expect(getAppUrl(app.id)).toBe(`/api/proxy/${app.slug}/`);
  });

  it("rejects unknown apps", () => {
    expect(() => getAppUrl("app-nope")).toThrow(/Unknown MFE/);
  });
});

describe("Content-Security-Policy", () => {
  it("enforces in production and only reports in development", () => {
    expect(getCspMode()).toBe("report-only");
    vi.stubEnv("NODE_ENV", "production");
    expect(getCspMode()).toBe("enforce");
    vi.stubEnv("CSP_MODE", "off");
    expect(getCspMode()).toBe("off");
  });

  it("allows nonce'd scripts, MFE origins and nothing framed", () => {
    vi.stubEnv(envKeyFor(app), "https://cdn.example.com/v42/");
    vi.stubEnv("CSP_EXTRA_ORIGINS", "https://analytics.example.com");
    const policy = buildContentSecurityPolicy("abc123");

    expect(policy).toContain("'nonce-abc123'");
    expect(policy).toContain("https://cdn.example.com");
    expect(policy).toContain("https://analytics.example.com");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).not.toContain("'unsafe-eval'");
  });
});
