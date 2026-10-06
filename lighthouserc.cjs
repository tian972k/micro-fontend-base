/**
 * Lighthouse CI - scores the production build of the shell.
 *
 * Run locally:
 *   pnpm --filter shell build
 *   SESSION_SECRET=dev pnpm lhci
 *
 * Budgets: a category below its minimum fails the job ("error"); a
 * "warn" shows in the report without failing. Performance is a warning
 * because shared CI runners are noisy - track the trend instead.
 */
const { execFileSync } = require("node:child_process");

const SESSION_SECRET = process.env.SESSION_SECRET || "lhci-session-secret";
const cookie = execFileSync("node", ["scripts/lhci-session-cookie.mjs"], {
  env: { ...process.env, SESSION_SECRET },
}).toString();

module.exports = {
  ci: {
    collect: {
      startServerCommand: `cd apps/shell && NODE_ENV=production SESSION_SECRET=${SESSION_SECRET} pnpm start`,
      startServerReadyPattern: "remix-serve",
      startServerReadyTimeout: 60000,
      url: ["http://localhost:8000/login", "http://localhost:8000/dashboard"],
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
        extraHeaders: JSON.stringify({ Cookie: cookie }),
        chromeFlags: "--no-sandbox --headless=new",
      },
    },
    assert: {
      assertMatrix: [
        {
          // Every audited page.
          matchingUrlPattern: ".*",
          assertions: {
            "categories:performance": ["warn", { minScore: 0.8 }],
            "categories:accessibility": ["error", { minScore: 0.9 }],
            "categories:best-practices": ["error", { minScore: 0.9 }],
            "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
            "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
            "total-blocking-time": ["warn", { maxNumericValue: 300 }],
          },
        },
        {
          // Public pages must be fully indexable.
          matchingUrlPattern: "^(?!.*/dashboard).*$",
          assertions: {
            "categories:seo": ["error", { minScore: 0.9 }],
          },
        },
        {
          // Authenticated pages are intentionally disallowed in robots.txt,
          // so "is-crawlable" is expected to fail there; check the rest.
          matchingUrlPattern: ".*/dashboard.*",
          assertions: {
            "meta-description": "error",
            "document-title": "error",
            "html-has-lang": "error",
          },
        },
      ],
    },
    upload: {
      // Public, temporary report links (no server needed). Point this at
      // an LHCI server (target: "lhci") to keep history.
      target: "temporary-public-storage",
    },
  },
};
