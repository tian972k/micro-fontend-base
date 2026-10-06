# API Reference: Shell (`apps/shell`)

Server modules live in `app/server/*` and only run on the server.

## MFE URLs: `app/server/config.ts`

```ts
getAppUrl(appId): string     // resolution: MFE_URL_<ID> → dev → Vercel proxy → localhost:<port>
getAppConfig(): { apps: Record<MfeAppId, string> }
envKeyFor({ id })            // "MFE_URL_APP_REACT"
```

## Auth: `app/server/auth.server.ts`

```ts
verifyCredentials(email, password): Promise<SessionUser | null>  // ← plug your IdP in here
requireUser(request): Promise<SessionUser>   // throws redirect("/login?redirectTo=…")
getUser(request): Promise<SessionUser | null>
createUserSession(request, user, redirectTo): Promise<Response>
logout(request): Promise<Response>
safeRedirect(to, fallback = "/dashboard"): string
```

`session.server.ts` exports `sessionStorage`, `getSession`,
`commitSession` and `destroySession`. The cookie is `__session`:
httpOnly, sameSite=lax, secure in production, 7 days.

Protecting a route:

```ts
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  return json({ user });
};
```

## Security headers: `app/server/csp.server.ts`

```ts
createNonce(): string
getCspMode(): "enforce" | "report-only" | "off"
buildContentSecurityPolicy(nonce): string
applySecurityHeaders(headers, nonce): void
```

`entry.server.tsx` applies them to every document response. Components
read the nonce with `useNonce()` (`components/providers/nonce-provider`).

## Federation loader: `app/lib/federation.ts`

```ts
loadMfeRemote(appId, host): Promise<module>
```

- Registers `{ name: toFederationName(appId), entry: <host>/mf-manifest.json }`.
- Shares React singletons.
- Injects the expose's CSS.
- `MfeContainer` passes it to `MfeHost` as `remoteLoader`.

## Routes

| Route                 | Purpose                                                             |
| --------------------- | ------------------------------------------------------------------- |
| `/`                   | Redirects to `/dashboard` or `/login`                               |
| `/login`              | Form; POST verifies credentials, creates the session, safe redirect |
| `/logout`             | POST destroys the session; GET redirects to `/login`                |
| `/dashboard`          | Overview (protected layout)                                         |
| `/dashboard/:app`     | Any registered MFE (404 for unknown ids)                            |
| `/dashboard/settings` | Settings                                                            |
| `POST /api/telemetry` | Beacon sink (see observability.md)                                  |
| `/api/proxy`          | Lists proxy URLs (Vercel only)                                      |
| `/api/proxy/:slug/*`  | Same-origin proxy to MFE deployments (Vercel only)                  |

## Telemetry bootstrap

`components/providers/telemetry-setup.ts` → `startTelemetry()`, called once
from `root.tsx`. It installs the beacon reporter (plus Sentry if
`window.Sentry` exists), global error capture and Web Vitals.
