import {
  type LoaderFunction,
  type ActionFunction,
  json,
} from "@remix-run/node";
import { MFE_APPS } from "@repo/config";
import {
  buildDownstreamHeaders,
  buildUpstreamHeaders,
  createHealthCache,
  isStaticAsset as isStaticAssetPath,
} from "../../../../server/proxy.server";

/**
 * Load MFE hosts from environment variables
 * Returns direct URLs for internal use (server-side)
 * Format: VITE_APP_{APP_NAME}_HOST (e.g., VITE_APP_REACT_HOST)
 */
function getMfeHosts(): Record<string, string> {
  const hosts: Record<string, string> = {};

  for (const { slug: app } of MFE_APPS) {
    const envKey = `VITE_APP_${app.toUpperCase()}_HOST`;
    const url = process.env[envKey];

    if (url) {
      hosts[app] = url;
    }
  }

  return hosts;
}

const healthCache = createHealthCache();

/**
 * Check if MFE app is available (cached)
 */
async function checkMfeHealth(app: string, hostUrl: string): Promise<boolean> {
  const cached = healthCache.get(app);
  if (cached !== undefined) return cached;

  try {
    const response = await fetch(hostUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(2000),
    });

    const isHealthy = response.ok || response.status === 404; // 404 means app exists but route not found
    healthCache.set(app, isHealthy);
    return isHealthy;
  } catch {
    healthCache.set(app, false);
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
  const isStaticAsset = isStaticAssetPath(path);

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
      headers: buildUpstreamHeaders(request.headers),
      body: ["GET", "HEAD"].includes(request.method)
        ? undefined
        : await request.arrayBuffer(),
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

    // Stream the (already decoded) body through instead of buffering it,
    // so large bundles don't sit in the shell's memory.
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: buildDownstreamHeaders(response.headers, {
        origin: url.origin,
        app,
        path,
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
 * Handle POST requests
 */
export const action: ActionFunction = async (args) => {
  return loader(args);
};
