# Security Policy

Security guidelines and vulnerability reporting for the Orbit Micro-Frontend Platform.

```mermaid
graph TB
    subgraph Defense ["Defense in Depth"]
        L1[🔒 Layer 1: Input Validation]:::layer
        L2[🔐 Layer 2: Authentication]:::layer
        L3[🚪 Layer 3: Authorization]:::layer
        L4[🛡️ Layer 4: Security Headers]:::layer
        L5[📊 Layer 5: Monitoring]:::layer
    end

    Request[User Request] --> L1
    L1 --> L2
    L2 --> L3
    L3 --> L4
    L4 --> App[Application]
    App --> L5

    L5 -.->|Alerts| Admin[👨‍💻 Admin]

    classDef layer fill:#8b5cf6,stroke:#6d28d9,color:#fff
    style Request fill:#3b82f6,stroke:#2563eb,color:#fff
    style App fill:#22c55e,stroke:#16a34a,color:#fff
    style Admin fill:#eab308,stroke:#ca8a04,color:#000
```

---

## Table of Contents

1. [Supported Versions](#supported-versions)
2. [Reporting a Vulnerability](#reporting-a-vulnerability)
3. [Security Best Practices](#security-best-practices)
4. [Authentication & Authorization](#authentication--authorization)
5. [Dependency Management](#dependency-management)
6. [XSS Prevention](#xss-prevention)
7. [CSRF Protection](#csrf-protection)
8. [Content Security Policy](#content-security-policy)
9. [Secure Communication](#secure-communication)
10. [Security Checklist](#security-checklist)

---

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

### Reporting Flow

```mermaid
flowchart LR
    A[🔍 Find Vulnerability] --> B[📧 Email Security Team]
    B --> C[⏱️ Wait 48h]
    C --> D[💬 Acknowledgment]
    D --> E[🔧 Fix Development]
    E --> F[✅ Patch Released]
    F --> G[📢 Public Disclosure]

    style A fill:#ef4444,stroke:#dc2626,color:#fff
    style B fill:#eab308,stroke:#ca8a04,color:#000
    style F fill:#22c55e,stroke:#16a34a,color:#fff
    style G fill:#3b82f6,stroke:#2563eb,color:#fff
```

### How to Report

1. **Email**: Send details to **<phamtuandev0907@gmail.com>**
2. **Subject**: "Security Vulnerability - Orbit Platform"
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Regular Updates**: Every 5 business days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: Next release

### Disclosure Policy

- We will coordinate disclosure with you
- Credit will be given for responsible disclosure
- We request 90 days before public disclosure

---

## Security Best Practices

### 1. Environment Variables

```bash
# ❌ Never commit secrets
DATABASE_URL=postgresql://user:password@localhost:5432/db

# ✅ Use .env files (gitignored)
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/db

# ✅ Use environment-specific files
# .env.production (encrypted)
```

**Protect sensitive files:**

```gitignore
# .gitignore
.env
.env.local
.env.production
*.key
*.pem
*.p12
secrets/
```

### 2. API Keys & Tokens

```typescript
// ❌ Never hardcode API keys
const API_KEY = "sk_live_abc123xyz";

// ✅ Use environment variables
const API_KEY = process.env.API_KEY;

// ✅ Validate environment variables
if (!process.env.API_KEY) {
  throw new Error("API_KEY is required");
}
```

### 3. Input Validation

```typescript
// ✅ Always validate user input
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(120),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
});

// Validate
const result = userSchema.safeParse(userInput);
if (!result.success) {
  throw new Error("Invalid input");
}
```

### 4. SQL Injection Prevention

```typescript
// ❌ Never concatenate SQL queries
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ Use parameterized queries
const query = {
  text: "SELECT * FROM users WHERE id = $1",
  values: [userId],
};

// ✅ Use ORM
const user = await prisma.user.findUnique({
  where: { id: userId },
});
```

---

## Authentication & Authorization

### Session Management

```typescript
// Use secure session configuration
import session from "express-session";

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Long random string
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // HTTPS only
      httpOnly: true, // No JavaScript access
      maxAge: 3600000, // 1 hour
      sameSite: "strict", // CSRF protection
    },
  }),
);
```

### JWT Best Practices

```typescript
import jwt from "jsonwebtoken";

// ✅ Generate token
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
  expiresIn: "15m", // Short expiry
  issuer: "orbit-platform",
  audience: "orbit-apps",
});

// ✅ Verify token
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    issuer: "orbit-platform",
    audience: "orbit-apps",
  });
} catch (error) {
  // Invalid token
  throw new Error("Authentication failed");
}

// ✅ Use refresh tokens
const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_SECRET, {
  expiresIn: "7d",
});
```

### Password Security

```typescript
import bcrypt from "bcrypt";

// ✅ Hash passwords
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// ✅ Verify passwords
const isValid = await bcrypt.compare(inputPassword, hashedPassword);

// ❌ Never store plain text passwords
const user = { password: "plain-text-password" }; // NEVER!
```

### Role-Based Access Control (RBAC)

```typescript
// Define roles and permissions
const ROLES = {
  ADMIN: "admin",
  USER: "user",
  GUEST: "guest",
};

const PERMISSIONS = {
  READ_USERS: "read:users",
  WRITE_USERS: "write:users",
  DELETE_USERS: "delete:users",
};

// Middleware to check permissions
const requirePermission = (permission: string) => {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
};

// Use in routes
app.delete(
  "/users/:id",
  requirePermission(PERMISSIONS.DELETE_USERS),
  deleteUser,
);
```

---

## Dependency Management

### Regular Updates

```bash
# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities automatically
pnpm audit fix

# Update dependencies
pnpm update

# Check outdated packages
pnpm outdated
```

### Automated Security Checks

```yaml
# .github/workflows/security.yml
name: Security Audit

on:
  schedule:
    - cron: "0 0 * * 1" # Weekly on Monday
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2

      - name: Run security audit
        run: pnpm audit --audit-level=high

      - name: Check for outdated packages
        run: pnpm outdated
```

### Dependency Policies

```json
// package.json
{
  "overrides": {
    // Force secure version of vulnerable package
    "vulnerable-package": "^2.0.0"
  }
}
```

---

## XSS Prevention

### Sanitize User Input

```typescript
import DOMPurify from "dompurify";

// ✅ Sanitize HTML
const cleanHTML = DOMPurify.sanitize(userInput);

// ✅ React auto-escapes
<div>{userInput}</div> // Safe

// ❌ Dangerous - don't use dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // Unsafe!

// ✅ If you must use it, sanitize first
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### Content Encoding

```typescript
// ✅ Always encode output
const encodeHTML = (str: string) => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
};
```

### Template Security

```typescript
// Vue - Auto-escapes by default
<template>
  <div>{{ userInput }}</div> <!-- Safe -->
  <div v-html="userInput"></div> <!-- Unsafe! -->
</template>

// Svelte - Auto-escapes by default
<div>{userInput}</div> <!-- Safe -->
<div>{@html userInput}</div> <!-- Unsafe! -->
```

---

## CSRF Protection

### CSRF Tokens

```typescript
import csrf from "csurf";

// Setup CSRF protection
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

// Send token to client
app.get("/form", (req, res) => {
  res.render("form", { csrfToken: req.csrfToken() });
});

// Include in form
<form method="POST">
  <input type="hidden" name="_csrf" value="{{ csrfToken }}" />
  <!-- form fields -->
</form>
```

### SameSite Cookies

```typescript
// Use SameSite attribute
res.cookie("token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "strict", // or "lax"
});
```

---

## Content Security Policy

### CSP Headers

```typescript
// Remix - apps/shell/app/root.tsx
export const headers = () => ({
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' localhost:*",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' localhost:* ws://localhost:*",
    "frame-ancestors 'none'",
  ].join("; "),
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
});
```

### Nginx Configuration

```nginx
# nginx.conf
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## Secure Communication

### HTTPS Only

```typescript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header("x-forwarded-proto") !== "https") {
    res.redirect(`https://${req.header("host")}${req.url}`);
  } else {
    next();
  }
});
```

### CORS Configuration

```typescript
import cors from "cors";

// ✅ Restrictive CORS
app.use(
  cors({
    origin: [
      "https://yourdomain.com",
      process.env.NODE_ENV === "development" ? "http://localhost:8000" : "",
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ❌ Never use in production
app.use(cors({ origin: "*" })); // Insecure!
```

### Rate Limiting

```typescript
import rateLimit from "express-rate-limit";

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests, please try again later",
});

app.use("/api/", limiter);

// Stricter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 attempts
  skipSuccessfulRequests: true,
});

app.use("/api/auth/", authLimiter);
```

---

## Security Checklist

### Development

- [ ] Use environment variables for secrets
- [ ] Never commit `.env` files
- [ ] Validate all user input
- [ ] Sanitize output to prevent XSS
- [ ] Use parameterized queries
- [ ] Hash passwords with bcrypt
- [ ] Implement CSRF protection
- [ ] Use secure session configuration
- [ ] Set security headers
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Implement rate limiting

### Dependencies

- [ ] Run `pnpm audit` regularly
- [ ] Keep dependencies updated
- [ ] Use `pnpm audit fix`
- [ ] Review dependency changes
- [ ] Use lock files (`pnpm-lock.yaml`)
- [ ] Scan for known vulnerabilities
- [ ] Remove unused dependencies

### Deployment

- [ ] Use HTTPS/TLS certificates
- [ ] Set secure HTTP headers
- [ ] Configure CSP
- [ ] Enable HSTS
- [ ] Use secure cookies
- [ ] Implement logging & monitoring
- [ ] Set up intrusion detection
- [ ] Regular security audits
- [ ] Backup data regularly
- [ ] Test disaster recovery

### Code Review

- [ ] Review authentication logic
- [ ] Check authorization flows
- [ ] Verify input validation
- [ ] Check for hardcoded secrets
- [ ] Review error messages (no info leaks)
- [ ] Verify secure defaults
- [ ] Check for SQL injection risks
- [ ] Review file upload handling

---

## Security Resources

### Tools

- **Snyk**: Dependency vulnerability scanning
- **OWASP ZAP**: Web application security testing
- **npm audit** / **pnpm audit**: Dependency auditing
- **ESLint Security Plugin**: Static code analysis
- **SonarQube**: Code quality & security

### References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

---

## Incident Response

### If a Vulnerability is Found

1. **Assess Severity**: Critical, High, Medium, Low
2. **Contain**: Temporarily disable affected features if needed
3. **Fix**: Develop and test patch
4. **Deploy**: Release security update
5. **Notify**: Inform users if necessary
6. **Post-Mortem**: Document and learn

### Communication Template

```
Subject: [Security Advisory] Vulnerability Fixed in Version X.Y.Z

We have identified and fixed a [severity] security vulnerability in Orbit Platform.

Impact: [Brief description]
Affected Versions: [List versions]
Fixed in Version: X.Y.Z

Action Required:
- Update to version X.Y.Z immediately
- Run: pnpm update

For more information, see: [Link to advisory]
```

---

## Contact

For security concerns:

- **Email**: <phamtuandev0907@gmail.com>
- **Subject**: "Security - Orbit Platform"
- **PGP Key**: [If available]

---

**Security is everyone's responsibility. Stay vigilant! 🔒**
