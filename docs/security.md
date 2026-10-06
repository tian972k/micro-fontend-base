# Security

Security is layered. Each layer assumes the others may fail.

| Layer                   | What it does                                                            | Where                                        |
| ----------------------- | ----------------------------------------------------------------------- | -------------------------------------------- |
| Authentication          | Signed cookie session, server-verified on every protected request       | `server/auth.server.ts`, `session.server.ts` |
| Redirect safety         | `redirectTo` limited to same-site paths                                 | `safeRedirect()`                             |
| Content-Security-Policy | Nonce + `strict-dynamic`, origins from the registry, no framing/plugins | `server/csp.server.ts`, `entry.server.tsx`   |
| MFE host validation     | Only http(s)/same-origin hosts reach `fetch`/`<script>`/`<link>`        | `MfeHost`                                    |
| Proxy hygiene           | Never forwards shell cookies/credentials; drops upstream `Set-Cookie`   | `routes/api/proxy/$/route.ts`                |
| CSS isolation           | MFE utilities can't restyle the shell                                   | `createMfeTailwindConfig`                    |
| Error isolation         | One MFE crashing doesn't take down the page                             | `MfeErrorBoundary`                           |
| Telemetry endpoint      | Size/record limits, JSON validation                                     | `routes/api/telemetry/route.ts`              |

## Authentication

- `verifyCredentials()` is the **only** place credentials are checked.
  Replace the demo implementation with your IdP: database + password hash
  (argon2/bcrypt), OIDC (Auth0, Keycloak, Entra ID) or an internal auth
  service.
- Sessions use `createCookieSessionStorage`. They're signed, `httpOnly`,
  `sameSite=lax`, `secure` in production and last 7 days.
- `SESSION_SECRET` is mandatory in production. The server won't start
  without it. Rotate with `SESSION_SECRET=new,old`.
- Logout is POST-only and destroys the session. The shared user store is
  cleared so MFEs drop the identity too.
- **MFEs never see credentials.** They read the identity from `userStore`
  (populated from the server-verified session). If an MFE must call an
  API as the user, route it through a shell endpoint (BFF) instead of
  handing tokens to the browser.

> The session stores the user profile in the signed cookie. For large
> profiles or server-side revocation, switch to
> `createSessionStorage` with a DB/Redis backend. The API stays the same.

## Content-Security-Policy

Default policy (production):

```text
default-src 'self';
script-src 'self' 'nonce-<random>' 'strict-dynamic' <MFE origins>;
style-src 'self' 'unsafe-inline' <MFE origins>;
img-src 'self' data: blob: https:;
font-src 'self' data: <MFE origins>;
connect-src 'self' <MFE origins>;
frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'
```

Plus `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin` and
`X-Frame-Options: DENY`.

- MFE origins come from the registry (`getAppConfig()`); same-origin
  proxy hosts are covered by `'self'`.
- `style-src 'unsafe-inline'` is needed because MFEs and Radix inject
  styles at runtime.
- Start a new deployment with `CSP_MODE=report-only`, check the console
  for violations, then switch to `enforce`.

## Proxy (Vercel)

`/api/proxy/<slug>/*` is enabled only when `VERCEL` is set. It strips
`cookie`, `authorization`, `host`, `x-forwarded-*` and hop-by-hop headers
on the way up, and `set-cookie` on the way down.

## Supply chain & dependencies

- Versions are pinned through the pnpm catalog and the lockfile
  (`--frozen-lockfile` in CI).
- Only framework runtimes are shared at runtime. A remote can't replace
  platform code in the shell.
- Run `pnpm audit` regularly. Dependabot/Renovate is recommended.

## Reporting a vulnerability

See [`.github/SECURITY.md`](../.github/SECURITY.md).

## Hardening checklist for a new deployment

- [ ] `SESSION_SECRET` set (32+ random bytes), demo account disabled
- [ ] Real `verifyCredentials()` (and rate limiting on `/login`, e.g. at
      the edge/WAF)
- [ ] `CSP_MODE=enforce`, with only the required `CSP_EXTRA_ORIGINS`
- [ ] MFE hosts are HTTPS
- [ ] `VITE_APP_*_HOST` point to deployments you control
- [ ] Telemetry forwarded somewhere monitored
