import { type LoaderFunction, json } from "@remix-run/node";

/**
 * Get client-facing proxy URLs for MFE apps
 * Used by frontend to load MFE via shell proxy
 */
function getMfeProxyUrls(): Record<string, string> {
  const appNames = ["react", "vue", "svelte", "solid", "nextjs"];
  const proxyUrls: Record<string, string> = {};

  for (const app of appNames) {
    proxyUrls[app] = `/api/proxy/${app}`;
  }

  return proxyUrls;
}

/**
 * GET /api/proxy - Returns available proxy URLs for MFE apps
 */
export const loader: LoaderFunction = async ({ request }) => {
  // Only in production
  if (!process.env.VERCEL) {
    return json(
      { error: "Not available in this environment" },
      { status: 403 },
    );
  }

  const proxyUrls = getMfeProxyUrls();
  return json({ apps: proxyUrls });
};
