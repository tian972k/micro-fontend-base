import { type LoaderFunction, json } from "@remix-run/node";

/**
 * Load MFE hosts from environment variables
 * Returns direct URLs for internal use (server-side)
 * Format: VITE_APP_{APP_NAME}_HOST (e.g., VITE_APP_REACT_HOST)
 */
function getMfeHosts(): Record<string, string> {
  const hosts: Record<string, string> = {};
  const appNames = ["react", "vue", "svelte", "solid", "nextjs"];

  for (const app of appNames) {
    const envKey = `VITE_APP_${app.toUpperCase()}_HOST`;
    const url = process.env[envKey];

    if (url) {
      hosts[app] = url;
    }
  }

  return hosts;
}

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

// Health check cache: { app: { timestamp, isHealthy } }
const healthCache = new Map<
  string,
  { timestamp: number; isHealthy: boolean }
>();
const HEALTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if MFE app is available (cached)
 */
async function checkMfeHealth(app: string, hostUrl: string): Promise<boolean> {
  const cached = healthCache.get(app);
  const now = Date.now();

  // Return cached result if fresh
  if (cached && now - cached.timestamp < HEALTH_CACHE_TTL) {
    return cached.isHealthy;
  }

  try {
    const response = await fetch(hostUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(2000),
    });

    const isHealthy = response.ok || response.status === 404; // 404 means app exists but route not found
    healthCache.set(app, { timestamp: now, isHealthy });
    return isHealthy;
  } catch (err) {
    healthCache.set(app, { timestamp: now, isHealthy: false });
    return false;
  }
}

/**
 * GET /api/proxy - Returns available proxy URLs for MFE apps
 */
export const action: LoaderFunction = async ({ request }) => {
  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

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

/**
 * Proxy requests to MFE apps (production only)
 */
export const loader: LoaderFunction = async ({ request }) => {
  // Only enable proxy in production (VERCEL env var set by Vercel)
  if (!process.env.VERCEL) {
    return json(
      { error: "Proxy not available in this environment" },
      { status: 403 },
    );
  }

  const MFE_HOSTS = getMfeHosts();

  if (Object.keys(MFE_HOSTS).length === 0) {
    return json(
      { error: "MFE hosts not configured. Set VITE_APP_*_HOST env variables." },
      { status: 500 },
    );
  }

  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);

  // Path format: /api/proxy/[app]/[...path]
  if (
    pathParts.length < 2 ||
    pathParts[0] !== "api" ||
    pathParts[1] !== "proxy"
  ) {
    return json({ error: "Invalid proxy path" }, { status: 400 });
  }

  const app = pathParts[2];
  const path = pathParts.slice(3).join("/");

  // Validate app name
  if (!app || !(app in MFE_HOSTS)) {
    return json(
      {
        error: `Unknown app: ${app}. Available: ${Object.keys(MFE_HOSTS).join(", ")}`,
      },
      { status: 404 },
    );
  }

  const hostUrl = MFE_HOSTS[app as keyof typeof MFE_HOSTS];

  // Check MFE health before proxying
  const isHealthy = await checkMfeHealth(app, hostUrl);
  if (!isHealthy) {
    return json(
      {
        error: `App "${app}" is currently unavailable. Please try again later.`,
      },
      {
        status: 503,
        headers: { "Retry-After": "60" },
      },
    );
  }

  try {
    // Build target URL
    const targetUrl = new URL(`${hostUrl}/${path}${url.search}`);

    // Forward request to MFE
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: new Headers(request.headers),
      body: ["GET", "HEAD"].includes(request.method)
        ? undefined
        : await request.text(),
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    });

    // Handle non-ok responses
    if (!response.ok) {
      console.warn(`[Proxy] ${app}/${path} returned ${response.status}`);

      if (response.status === 404) {
        return json(
          { error: `Resource not found in app "${app}": /${path}` },
          { status: 404 },
        );
      }

      if (
        response.status === 500 ||
        response.status === 502 ||
        response.status === 503
      ) {
        return json(
          {
            error: `App "${app}" encountered an error. Status: ${response.status}`,
          },
          { status: response.status },
        );
      }
    }

    // Clone response and add CORS headers
    const responseBody = await response.text();
    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers({
        ...Object.fromEntries(response.headers.entries()),
        "Access-Control-Allow-Origin":
          "https://micro-fontend-base-shell.vercel.app",
        "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "X-Proxy-For": app,
      }),
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (errorMsg.includes("timeout")) {
      console.error(`[Proxy] ${app}/${path} timeout`);
      return json(
        { error: `App "${app}" request timeout. Please try again.` },
        { status: 504 },
      );
    }

    if (errorMsg.includes("Failed to fetch") || errorMsg.includes("network")) {
      console.error(`[Proxy] ${app}/${path} network error:`, errorMsg);
      return json(
        { error: `Cannot reach app "${app}". Network error.` },
        { status: 503 },
      );
    }

    console.error(`[Proxy] ${app}/${path} error:`, errorMsg);
    return json({ error: "Proxy request failed" }, { status: 500 });
  }
};

/**
 * OPTIONS request for CORS preflight
 */
export const options: LoaderFunction = async () => {
  if (!process.env.VERCEL) {
    return json({ error: "Not available" }, { status: 403 });
  }

  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin":
        "https://micro-fontend-base-shell.vercel.app",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
};
