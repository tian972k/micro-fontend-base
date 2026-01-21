import {
  type LoaderFunction,
  type ActionFunction,
  json,
} from "@remix-run/node";

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
 * Proxy requests to MFE apps (production only)
 * Handles: /api/proxy/:app/:path*
 */
export const loader: LoaderFunction = async ({ request, params }) => {
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

  // Extract app and path from the splat param
  // params["*"] contains everything after /api/proxy/
  const splatPath = params["*"] || "";
  const pathParts = splatPath.split("/").filter(Boolean);

  const app = pathParts[0];
  const path = pathParts.slice(1).join("/");

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

  // Skip health check for static assets (JS, CSS, fonts, images) to improve performance
  const isStaticAsset =
    /\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|ico|json)(\?.*)?$/i.test(
      path,
    );

  if (!isStaticAsset) {
    // Only check health for non-static requests
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
  }

  try {
    // Build target URL
    const targetUrl = new URL(`${hostUrl}/${path}${url.search}`);

    // Forward request to MFE with shorter timeout for static assets
    const timeout = isStaticAsset ? 5000 : 10000;
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: new Headers(request.headers),
      body: ["GET", "HEAD"].includes(request.method)
        ? undefined
        : await request.text(),
      signal: AbortSignal.timeout(timeout),
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

    // Get content type to handle binary vs text responses
    const contentType = response.headers.get("content-type") || "";

    // Build clean headers - remove encoding headers since fetch already decoded
    const cleanHeaders = new Headers();
    for (const [key, value] of response.headers.entries()) {
      // Skip encoding-related headers that cause issues after decoding
      const lowerKey = key.toLowerCase();
      if (
        lowerKey === "content-encoding" ||
        lowerKey === "content-length" ||
        lowerKey === "transfer-encoding"
      ) {
        continue;
      }
      cleanHeaders.set(key, value);
    }

    // Add CORS and proxy headers
    cleanHeaders.set(
      "Access-Control-Allow-Origin",
      "https://micro-fontend-base-shell.vercel.app",
    );
    cleanHeaders.set("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
    cleanHeaders.set(
      "Access-Control-Allow-Headers",
      "Content-Type,Authorization",
    );
    cleanHeaders.set("X-Proxy-For", app);

    // Add aggressive caching for static assets (JS, CSS with hashes are immutable)
    if (isStaticAsset) {
      // Check if filename has hash (e.g., entry-mfe-abc123.js)
      const hasHash =
        /\.[a-f0-9]{8,}\.(js|css)$/i.test(path) ||
        /-([\w]{8,})\.(js|css)$/i.test(path);
      if (hasHash) {
        // Immutable files with hash - cache for 1 year
        cleanHeaders.set(
          "Cache-Control",
          "public, max-age=31536000, immutable",
        );
      } else {
        // Other static files - cache for 1 hour
        cleanHeaders.set("Cache-Control", "public, max-age=3600");
      }
    }

    // For binary content (images, fonts, etc.), pass through as-is
    if (
      contentType.includes("image/") ||
      contentType.includes("font/") ||
      contentType.includes("application/octet-stream") ||
      contentType.includes("application/wasm")
    ) {
      const responseBody = await response.arrayBuffer();
      return new Response(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: cleanHeaders,
      });
    }

    // For text content (JS, CSS, JSON, HTML, etc.)
    const responseBody = await response.text();
    return new Response(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: cleanHeaders,
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
 * Handle POST requests
 */
export const action: ActionFunction = async (args) => {
  return loader(args);
};
