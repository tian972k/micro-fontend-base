import { redirect } from "@remix-run/node";
import { timingSafeEqual } from "node:crypto";
import type { UserProfile } from "@repo/core/react";
import { commitSession, destroySession, getSession } from "./session.server";

const USER_SESSION_KEY = "user";

export type SessionUser = UserProfile & { id: string };

/**
 * Credential check. This is the single place to plug in a real identity
 * provider (database lookup, OIDC, an auth service, ...).
 *
 * Out of the box it accepts one demo account configured through
 * AUTH_DEMO_EMAIL / AUTH_DEMO_PASSWORD. Outside production those default
 * to demo@example.com / demo1234; in production nothing is accepted
 * unless they are explicitly set.
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const isProduction = process.env.NODE_ENV === "production";
  const demoEmail =
    process.env.AUTH_DEMO_EMAIL ?? (isProduction ? "" : "demo@example.com");
  const demoPassword =
    process.env.AUTH_DEMO_PASSWORD ?? (isProduction ? "" : "demo1234");

  if (!demoEmail || !demoPassword) return null;

  const emailOk = safeEqual(
    email.trim().toLowerCase(),
    demoEmail.toLowerCase(),
  );
  const passwordOk = safeEqual(password, demoPassword);
  if (!emailOk || !passwordOk) return null;

  return {
    id: "demo-user",
    name: "Demo User",
    email: demoEmail,
    avatarUrl: "",
  };
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // timingSafeEqual requires equal lengths; compare against itself to keep
  // the timing similar when lengths differ.
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * Only allow redirects to same-site relative paths, so `?redirectTo=`
 * can't be used to bounce users to another origin after login.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  fallback = "/dashboard",
): string {
  if (typeof to !== "string" || !to.startsWith("/") || to.startsWith("//")) {
    return fallback;
  }
  if (to.startsWith("/\\")) return fallback;
  return to;
}

export async function getUser(request: Request): Promise<SessionUser | null> {
  const session = await getSession(request.headers.get("Cookie"));
  return (session.get(USER_SESSION_KEY) as SessionUser | undefined) ?? null;
}

/** Returns the logged-in user or redirects to /login (keeping the target). */
export async function requireUser(request: Request): Promise<SessionUser> {
  const user = await getUser(request);
  if (!user) {
    const url = new URL(request.url);
    const params = new URLSearchParams({
      redirectTo: `${url.pathname}${url.search}`,
    });
    throw redirect(`/login?${params}`);
  }
  return user;
}

export async function createUserSession(
  request: Request,
  user: SessionUser,
  redirectTo: string,
) {
  const session = await getSession(request.headers.get("Cookie"));
  session.set(USER_SESSION_KEY, user);
  return redirect(redirectTo, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}
