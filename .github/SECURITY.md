# Security Policy

## Supported versions

Security fixes are made on `main` and released with the next version.

## Reporting a vulnerability

Please **do not open a public issue**. Report privately through
[GitHub Security Advisories](https://github.com/tian972k/micro-fontend-base/security/advisories/new)
or by email to **<phamtuandev0907@gmail.com>**, with:

- the affected app/package and version (commit),
- steps to reproduce or a proof of concept,
- the impact you expect.

You'll get an acknowledgement within 3 working days and a fix plan or
assessment within 10.

## How the platform is secured

The security model, CSP policy, session handling and a hardening checklist
for new deployments are documented in
[docs/security.md](../docs/security.md). Failure-mode behaviour (open
redirect, forged cookies, proxy hygiene, …) is in
[docs/edge-cases.md](../docs/edge-cases.md).
