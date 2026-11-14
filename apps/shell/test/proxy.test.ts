import { describe, expect, it } from "vitest";
import {
  HEALTHY_TTL_MS,
  UNHEALTHY_TTL_MS,
  buildDownstreamHeaders,
  buildUpstreamHeaders,
  cacheControlFor,
  createHealthCache,
  isStaticAsset,
} from "../app/server/proxy.server";

describe("buildUpstreamHeaders", () => {
  it("never forwards the shell's credentials to an MFE origin", () => {
    const headers = buildUpstreamHeaders(
      new Headers({
        cookie: "__session=secret",
        authorization: "Bearer token",
        host: "shell.example",
        "x-forwarded-for": "203.0.113.7",
        accept: "text/javascript",
      }),
    );
    expect(headers.get("cookie")).toBeNull();
    expect(headers.get("authorization")).toBeNull();
    expect(headers.get("host")).toBeNull();
    expect(headers.get("x-forwarded-for")).toBeNull();
    expect(headers.get("accept")).toBe("text/javascript");
  });
});

describe("buildDownstreamHeaders", () => {
  const options = {
    origin: "https://shell.example",
    app: "react",
    path: "assets/entry-mfe-1a2b3c4d.js",
  };

  it("drops Set-Cookie and encoding headers from the MFE response", () => {
    const headers = buildDownstreamHeaders(
      new Headers({
        "set-cookie": "evil=1",
        "content-encoding": "gzip",
        "content-length": "123",
        "content-type": "text/javascript",
      }),
      options,
    );
    expect(headers.get("set-cookie")).toBeNull();
    expect(headers.get("content-encoding")).toBeNull();
    expect(headers.get("content-length")).toBeNull();
    expect(headers.get("content-type")).toBe("text/javascript");
  });

  it("allows only the shell origin and labels the upstream app", () => {
    const headers = buildDownstreamHeaders(new Headers(), options);
    expect(headers.get("Access-Control-Allow-Origin")).toBe(
      "https://shell.example",
    );
    expect(headers.get("X-Proxy-For")).toBe("react");
    expect(headers.get("Cache-Control")).toContain("immutable");
  });
});

describe("static assets and caching", () => {
  it("recognises static assets", () => {
    expect(isStaticAsset("assets/app.js")).toBe(true);
    expect(isStaticAsset("mf-manifest.json?t=1")).toBe(true);
    expect(isStaticAsset("api/users")).toBe(false);
  });

  it("caches hashed files forever and other assets briefly", () => {
    expect(cacheControlFor("assets/index-1a2b3c4d.css")).toBe(
      "public, max-age=31536000, immutable",
    );
    expect(cacheControlFor("remoteEntry.js")).toBe("public, max-age=3600");
    expect(cacheControlFor("api/users")).toBeNull();
  });
});

describe("createHealthCache", () => {
  it("trusts a healthy result much longer than a failure", () => {
    let time = 0;
    const cache = createHealthCache(() => time);
    cache.set("up", true);
    cache.set("down", false);

    time = UNHEALTHY_TTL_MS - 1;
    expect(cache.get("down")).toBe(false);
    time = UNHEALTHY_TTL_MS;
    expect(cache.get("down")).toBeUndefined();
    expect(cache.get("up")).toBe(true);

    time = HEALTHY_TTL_MS;
    expect(cache.get("up")).toBeUndefined();
    expect(cache.get("unknown")).toBeUndefined();
  });
});
