#!/usr/bin/env node
/**
 * Prints a signed shell session cookie for the demo user, so Lighthouse
 * can audit authenticated pages (/dashboard) without scripting a login.
 * Must use the same SESSION_SECRET as the shell server under test.
 *
 *   SESSION_SECRET=... node scripts/lhci-session-cookie.mjs
 */
import { createRequire } from "node:module";

const require = createRequire(new URL("../apps/shell/package.json", import.meta.url));
const { createCookieSessionStorage } = require("@remix-run/node");

const secret = process.env.SESSION_SECRET;
if (!secret) {
  console.error("SESSION_SECRET is required");
  process.exit(1);
}

// Mirrors apps/shell/app/server/session.server.ts (name + secrets).
const storage = createCookieSessionStorage({
  cookie: { name: "__session", secrets: secret.split(","), path: "/" },
});
const session = await storage.getSession();
session.set("user", {
  id: "demo-user",
  name: "Demo User",
  email: "demo@example.com",
  avatarUrl: "",
});
const setCookie = await storage.commitSession(session);
process.stdout.write(setCookie.split(";")[0]);
