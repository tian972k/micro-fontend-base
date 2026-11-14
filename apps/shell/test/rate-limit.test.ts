import { describe, expect, it } from "vitest";
import {
  createRateLimiter,
  getClientIp,
} from "../app/server/rate-limit.server";

describe("createRateLimiter", () => {
  it("allows up to the limit, then blocks until the window resets", () => {
    let time = 0;
    const limiter = createRateLimiter({
      limit: 2,
      windowMs: 1000,
      now: () => time,
    });

    expect(limiter.consume("a")).toMatchObject({ allowed: true, remaining: 1 });
    expect(limiter.consume("a")).toMatchObject({ allowed: true, remaining: 0 });
    expect(limiter.consume("a")).toMatchObject({
      allowed: false,
      retryAfterSeconds: 1,
    });

    time = 1000;
    expect(limiter.consume("a").allowed).toBe(true);
  });

  it("tracks keys independently and supports reset", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(limiter.consume("a").allowed).toBe(true);
    expect(limiter.consume("b").allowed).toBe(true);
    expect(limiter.consume("a").allowed).toBe(false);

    limiter.reset("a");
    expect(limiter.consume("a").allowed).toBe(true);
  });

  it("never tracks more than maxKeys", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 2 });
    limiter.consume("a");
    limiter.consume("b");
    limiter.consume("c"); // evicts the oldest ("a")
    expect(limiter.consume("a").allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  const request = (headers: Record<string, string>) =>
    new Request("http://shell.test/", { headers });

  it("uses the first X-Forwarded-For entry", () => {
    expect(
      getClientIp(request({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" })),
    ).toBe("203.0.113.7");
  });

  it("falls back to X-Real-IP, then unknown", () => {
    expect(getClientIp(request({ "x-real-ip": "203.0.113.9" }))).toBe(
      "203.0.113.9",
    );
    expect(getClientIp(request({}))).toBe("unknown");
  });
});
