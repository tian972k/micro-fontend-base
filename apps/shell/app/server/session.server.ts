import { createCookieSessionStorage } from "@remix-run/node";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Secrets used to sign the session cookie. Supports rotation: put the new
 * secret first, keep old ones after it (comma-separated) until existing
 * sessions expire.
 */
function getSessionSecrets(): string[] {
  const secrets = (process.env.SESSION_SECRET ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (secrets.length > 0) return secrets;

  if (isProduction) {
    throw new Error(
      "SESSION_SECRET must be set in production (comma-separated for rotation).",
    );
  }

  console.warn(
    "[session] SESSION_SECRET is not set; using an insecure development secret.",
  );
  return ["dev-only-insecure-session-secret"];
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secrets: getSessionSecrets(),
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
