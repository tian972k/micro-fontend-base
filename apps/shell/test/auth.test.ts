import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createUserSession,
  getUser,
  logout,
  requireUser,
  safeRedirect,
  verifyCredentials,
} from "../app/server/auth.server";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("safeRedirect", () => {
  it("keeps same-site relative paths", () => {
    expect(safeRedirect("/dashboard/app-react?tab=1")).toBe(
      "/dashboard/app-react?tab=1",
    );
  });

  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "dashboard",
    "",
    null,
    undefined,
  ])("falls back for %s", (target) => {
    expect(safeRedirect(target)).toBe("/dashboard");
  });

  it("uses the given fallback", () => {
    expect(safeRedirect("https://evil.example", "/home")).toBe("/home");
  });
});

describe("verifyCredentials", () => {
  it("accepts the default demo account outside production", async () => {
    const user = await verifyCredentials(" Demo@Example.com ", "demo1234");
    expect(user).toMatchObject({ id: "demo-user", email: "demo@example.com" });
  });

  it("rejects a wrong password or email", async () => {
    expect(await verifyCredentials("demo@example.com", "nope")).toBeNull();
    expect(await verifyCredentials("other@example.com", "demo1234")).toBeNull();
  });

  it("accepts nothing in production unless an account is configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(await verifyCredentials("demo@example.com", "demo1234")).toBeNull();

    vi.stubEnv("AUTH_DEMO_EMAIL", "ops@example.com");
    vi.stubEnv("AUTH_DEMO_PASSWORD", "s3cret-pass");
    expect(
      await verifyCredentials("ops@example.com", "s3cret-pass"),
    ).toMatchObject({ email: "ops@example.com" });
  });
});

describe("sessions", () => {
  const user = {
    id: "u1",
    name: "Ada",
    email: "ada@example.com",
    avatarUrl: "",
  };

  async function signIn() {
    const response = await createUserSession(
      new Request("http://shell.test/login"),
      user,
      "/dashboard",
    );
    const cookie = response.headers.get("Set-Cookie") ?? "";
    return { response, cookie: cookie.split(";")[0] };
  }

  it("creates a signed, http-only session and redirects", async () => {
    const { response } = await signIn();
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("/dashboard");
    const setCookie = response.headers.get("Set-Cookie") ?? "";
    expect(setCookie).toMatch(/^__session=/);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
  });

  it("reads the user back from the cookie", async () => {
    const { cookie } = await signIn();
    const request = new Request("http://shell.test/dashboard", {
      headers: { Cookie: cookie },
    });
    expect(await getUser(request)).toEqual(user);
    expect(await requireUser(request)).toEqual(user);
  });

  it("ignores a tampered cookie", async () => {
    const { cookie } = await signIn();
    const request = new Request("http://shell.test/dashboard", {
      headers: { Cookie: `${cookie.slice(0, -4)}AAAA` },
    });
    expect(await getUser(request)).toBeNull();
  });

  it("redirects anonymous users to /login and keeps the target", async () => {
    const request = new Request("http://shell.test/dashboard/app-vue?x=1");
    const thrown = await requireUser(request).catch((error) => error);
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get("Location")).toBe(
      "/login?redirectTo=%2Fdashboard%2Fapp-vue%3Fx%3D1",
    );
  });

  it("clears the session on logout", async () => {
    const { cookie } = await signIn();
    const response = await logout(
      new Request("http://shell.test/logout", { headers: { Cookie: cookie } }),
    );
    expect(response.headers.get("Location")).toBe("/login");
    const cleared = (response.headers.get("Set-Cookie") ?? "").split(";")[0];
    expect(
      await getUser(
        new Request("http://shell.test/", { headers: { Cookie: cleared } }),
      ),
    ).toBeNull();
  });
});
