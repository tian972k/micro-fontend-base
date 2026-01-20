# Deployment Guide

This guide covers deployment strategies, CI/CD pipelines, and production setup for the Orbit Micro-Frontend Platform.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Build System](#2-build-system)
3. [Docker Deployment](#3-docker-deployment)
4. [CI/CD Pipeline](#4-cicd-pipeline)
5. [Environment Variables](#5-environment-variables)
6. [Health Checks](#6-health-checks)
7. [Cloud Deployment](#7-cloud-deployment)
8. [Monitoring & Logging](#8-monitoring--logging)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Architecture Overview

### Deployment Topology

```mermaid
flowchart TD
    subgraph "Edge Layer"
        CDN["CDN / Edge Cache"]
    end

    subgraph "Application Layer"
        Shell["Shell Container<br/>(Node.js/Remix)"]
        React["React MFE<br/>(Nginx Static)"]
        Vue["Vue MFE<br/>(Nginx Static)"]
        Svelte["Svelte MFE<br/>(Nginx Static)"]
    end

    subgraph "Persistence Layer"
        Redis["Redis (Sessions)"]
        DB["Database"]
    end

    User --> CDN
    CDN --> Shell
    Shell --> React & Vue & Svelte
    Shell --> Redis & DB
```

### The Build Matrix

| Application     | Type                 | Docker Base      | Dockerfile                |
| :-------------- | :------------------- | :--------------- | :------------------------ |
| **Shell**       | Node.js (Remix SSR)  | `node:20-alpine` | `apps/shell/Dockerfile`   |
| **App React**   | Static (Vite)        | `nginx:alpine`   | `Dockerfile.mfe`          |
| **App Vue**     | Static (Vite)        | `nginx:alpine`   | `Dockerfile.mfe`          |
| **App Svelte**  | Static (Vite)        | `nginx:alpine`   | `Dockerfile.mfe`          |
| **App SolidJS** | Static (Vite)        | `nginx:alpine`   | `Dockerfile.mfe`          |
| **App Next.js** | Static (Next Export) | `nginx:alpine`   | `Dockerfile.mfe` (custom) |

---

## 2. Build System

### Central MFE Configuration

All MFE apps are configured in `scripts/mfe.config.mjs`:

```javascript
export const MFE_APPS = [
  {
    name: "app-react",
    framework: "react",
    port: 8001,
    entryFile: "entry-mfe.tsx",
    outputDir: "dist",
  },
  // ... more apps
];
```

### Build Commands

| Command                | Description                      | Use Case              |
| :--------------------- | :------------------------------- | :-------------------- |
| `pnpm build`           | Build all packages and apps      | Full build            |
| `pnpm build:packages`  | Build only shared packages       | Package changes       |
| `pnpm build:mfes`      | Build all MFE apps (development) | Development           |
| `pnpm build:mfes:prod` | Production build for all MFEs    | Production deployment |

### Turbo Build Pipeline

```mermaid
flowchart LR
    subgraph "Stage 1: Packages"
        Config["@repo/config"]
        Utils["@repo/utils"]
    end

    subgraph "Stage 2: Core"
        Core["@repo/core"]
        UI["@repo/ui"]
    end

    subgraph "Stage 3: Apps"
        Shell["Shell"]
        React["App React"]
        Vue["App Vue"]
    end

    Config --> Core & UI
    Utils --> Core & UI
    Core --> Shell & React & Vue
    UI --> Shell & React
```

### Validate Before Build

```bash
# Check MFE configuration
pnpm validate:mfe-config

# Check APP_IDS consistency
pnpm validate:app-ids

# Type check all packages
pnpm type-check
```

---

## 3. Docker Deployment

### Docker Compose (Development)

```bash
# Start all services
docker-compose up

# Start with rebuild
docker-compose up --build

# Start specific services
docker-compose up shell app-react app-vue

# View logs
docker-compose logs -f shell

# Stop all services
docker-compose down
```

### Docker Compose (Production)

```bash
# Build production images
docker-compose -f docker-compose.yml build

# Run in detached mode
docker-compose up -d

# Scale specific service
docker-compose up -d --scale app-react=3
```

### Individual Docker Builds

```bash
# Build Shell
docker build -t orbit-shell:latest -f apps/shell/Dockerfile .

# Build MFE app
docker build -t orbit-app-react:latest \
  --build-arg APP_NAME=app-react \
  --build-arg BUILD_OUTPUT_DIR=dist \
  -f Dockerfile.mfe .

# Build Next.js MFE (different output dir)
docker build -t orbit-app-nextjs:latest \
  --build-arg APP_NAME=app-nextjs \
  --build-arg BUILD_OUTPUT_DIR=public \
  -f Dockerfile.mfe .
```

### Smart Docker Build

The smart build script only builds changed apps:

```bash
# Dry run (see what would be built)
pnpm docker:build:smart

# Execute build
EXECUTE=true pnpm docker:build:smart

# Force build ALL apps
FORCE_ALL=true EXECUTE=true node scripts/smart-docker-build.js
```

**How it works:**

```mermaid
flowchart TD
    Start["Start Build"] --> Analyze["Analyze Changed Files"]
    Analyze --> Filter["Filter Affected Apps"]
    Filter --> Check{Any Changes?}
    Check -->|Yes| Build["Build Changed Apps"]
    Check -->|No| Skip["Skip Build"]
    Build --> Push["Push to Registry"]
```

### Docker Image Naming

```
orbit-{app-name}:latest
orbit-{app-name}:{commit-sha}
orbit-{app-name}:{version}
```

**Examples:**

```bash
orbit-shell:latest
orbit-shell:abc123f
orbit-app-react:1.2.3
```

---

## 4. CI/CD Pipeline

### Pipeline Overview

```mermaid
flowchart LR
    subgraph "CI Stage"
        Lint["Lint"]
        TypeCheck["Type Check"]
        Test["Unit Tests"]
        Build["Build"]
    end

    subgraph "CD Stage"
        DockerBuild["Docker Build"]
        Push["Push to Registry"]
        Deploy["Deploy"]
    end

    Lint --> TypeCheck --> Test --> Build
    Build --> DockerBuild --> Push --> Deploy
```

### GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Test
        run: pnpm test

  build:
    needs: lint-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build packages
        run: pnpm build:packages

      - name: Build MFEs
        run: pnpm build:mfes:prod

  docker:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Build and push images
        run: |
          EXECUTE=true node scripts/smart-docker-build.js
```

### Smart Build Detection

Only build what changed:

```yaml
- name: Get changed files
  id: changed-files
  uses: tj-actions/changed-files@v40

- name: Build affected apps
  run: |
    if echo "${{ steps.changed-files.outputs.all_changed_files }}" | grep -q "apps/app-react"; then
      docker build -t orbit-app-react -f Dockerfile.mfe .
    fi
```

---

## 5. Environment Variables

### Shell (Remix) Environment

| Variable               | Description                 | Default       | Required |
| ---------------------- | --------------------------- | ------------- | -------- |
| `NODE_ENV`             | Environment mode            | `development` | No       |
| `PORT`                 | Server port                 | `3000`        | No       |
| `SESSION_SECRET`       | Session encryption secret   | -             | **Prod** |
| `REMOTE_MANIFEST_URLS` | JSON array of manifest URLs | `[]`          | No       |
| `DATABASE_URL`         | Database connection string  | -             | Optional |
| `REDIS_URL`            | Redis connection string     | -             | Optional |

### MFE Apps Environment

| Variable          | Description       | Default | Required |
| ----------------- | ----------------- | ------- | -------- |
| `VITE_API_URL`    | Backend API URL   | -       | Optional |
| `VITE_PUBLIC_URL` | Public assets URL | `/`     | Optional |
| `VITE_APP_NAME`   | Application name  | -       | Optional |

### Environment File Example

```bash
# .env (Shell)
NODE_ENV=production
PORT=3000
SESSION_SECRET=your-super-secret-key-here
REMOTE_MANIFEST_URLS=["https://react.example.com/manifest.json","https://vue.example.com/manifest.json"]

# Database (optional)
DATABASE_URL=postgresql://user:pass@localhost:5432/orbit

# Redis for sessions (optional)
REDIS_URL=redis://localhost:6379
```

```bash
# apps/app-react/.env
VITE_API_URL=https://api.example.com
VITE_PUBLIC_URL=https://cdn.example.com/app-react
```

### Docker Environment

```yaml
# docker-compose.yml
services:
  shell:
    environment:
      - NODE_ENV=production
      - SESSION_SECRET=${SESSION_SECRET}
      - REMOTE_MANIFEST_URLS=${REMOTE_MANIFEST_URLS}
```

---

## 6. Health Checks

### Health Endpoints

| App         | Endpoint       | Response Format |
| ----------- | -------------- | --------------- |
| Shell       | `/health`      | JSON            |
| Static Apps | `/health.json` | JSON            |

### Health Response Schema

```json
{
  "status": "up",
  "version": "1.2.3",
  "timestamp": "2024-01-20T12:00:00Z",
  "checks": {
    "database": "healthy",
    "redis": "healthy"
  }
}
```

### Status Values

| Status        | Meaning                         |
| ------------- | ------------------------------- |
| `up`          | Service is healthy              |
| `maintenance` | Service is in maintenance mode  |
| `degraded`    | Service is partially functional |
| `down`        | Service is unavailable          |

### Docker Health Checks

```yaml
# docker-compose.yml
services:
  shell:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  app-react:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health.json"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Kubernetes Probes

```yaml
# kubernetes/deployment.yaml
spec:
  containers:
    - name: shell
      livenessProbe:
        httpGet:
          path: /health
          port: 3000
        initialDelaySeconds: 30
        periodSeconds: 10
      readinessProbe:
        httpGet:
          path: /health
          port: 3000
        initialDelaySeconds: 5
        periodSeconds: 5
```

---

## 7. Cloud Deployment

### Vercel / Netlify (Static Apps)

For static MFE apps:

```bash
# Build for static hosting
pnpm turbo run build --filter=app-react

# Output: apps/app-react/dist/
```

**Vercel Configuration:**

```json
{
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=app-react",
  "outputDirectory": "dist",
  "framework": null
}
```

### Docker Registries

```bash
# Docker Hub
docker tag orbit-app-react:latest your-username/orbit-app-react:latest
docker push your-username/orbit-app-react:latest

# GitHub Container Registry
docker tag orbit-app-react:latest ghcr.io/your-org/orbit-app-react:latest
docker push ghcr.io/your-org/orbit-app-react:latest

# AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker tag orbit-app-react:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/orbit-app-react:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/orbit-app-react:latest
```

### Kubernetes Deployment

```yaml
# kubernetes/shell-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orbit-shell
  labels:
    app: orbit-shell
spec:
  replicas: 2
  selector:
    matchLabels:
      app: orbit-shell
  template:
    metadata:
      labels:
        app: orbit-shell
    spec:
      containers:
        - name: shell
          image: orbit-shell:latest
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: production
            - name: SESSION_SECRET
              valueFrom:
                secretKeyRef:
                  name: orbit-secrets
                  key: session-secret
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: orbit-shell
spec:
  selector:
    app: orbit-shell
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: orbit-ingress
spec:
  rules:
    - host: orbit.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: orbit-shell
                port:
                  number: 80
```

### AWS ECS / Fargate

```json
{
  "family": "orbit-shell",
  "containerDefinitions": [
    {
      "name": "shell",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/orbit-shell:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "SESSION_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:orbit/session-secret"
        }
      ],
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3000/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

---

## 8. Monitoring & Logging

### Logging Strategy

```typescript
// Logger is available from any framework-specific entry or shared
import { Logger } from "@repo/core/shared"; // or @repo/core/react, etc.

// Structured logging
Logger.info("Request processed", {
  path: "/api/users",
  duration: 45,
  statusCode: 200,
});

Logger.error("Failed to fetch data", {
  error: error.message,
  stack: error.stack,
});
```

### Log Levels

| Level   | Use Case                   |
| ------- | -------------------------- |
| `debug` | Development debugging      |
| `info`  | General information        |
| `warn`  | Potential issues           |
| `error` | Errors that need attention |

### Metrics to Monitor

| Metric              | Description                   |
| ------------------- | ----------------------------- |
| Request latency     | Time to process requests      |
| Error rate          | Percentage of failed requests |
| MFE load time       | Time to load and mount MFEs   |
| Bundle size         | Size of JavaScript bundles    |
| Health check status | Service availability          |

### Integration Points

```yaml
# Docker logging driver
services:
  shell:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 9. Troubleshooting

### Common Issues

| Issue                  | Solution                              |
| :--------------------- | :------------------------------------ |
| **Docker build fails** | Check `pnpm-lock.yaml` is committed   |
| **MFE not loading**    | Verify `manifest.json` is accessible  |
| **Health check fails** | Ensure `health.json` exists in public |
| **CORS errors**        | Configure proper CORS headers         |
| **SSL issues**         | Check certificate configuration       |

### Debug Docker Build

```bash
# Build with verbose output
docker build --progress=plain -t orbit-app-react -f Dockerfile.mfe .

# Check container logs
docker logs orbit-app-react

# Enter container for debugging
docker exec -it orbit-app-react /bin/sh
```

### Verify Deployment

```bash
# Check health endpoint
curl -s https://your-domain.com/health | jq

# Check MFE manifest
curl -s https://react.your-domain.com/manifest.json | jq

# Check MFE availability
curl -I https://react.your-domain.com/remoteEntry.js
```

### Rollback Procedure

```bash
# Docker Compose
docker-compose down
docker tag orbit-shell:previous orbit-shell:latest
docker-compose up -d

# Kubernetes
kubectl rollout undo deployment/orbit-shell
kubectl rollout status deployment/orbit-shell
```

---

## Related Documentation

- [CI/CD Pipeline](../.github/CI_CD.md) - Detailed CI/CD configuration
- [Getting Started](./GETTING_STARTED.md) - Local development setup
- [Architecture](./ARCHITECTURE.md) - System architecture overview
- [Standards](./STANDARDS.md) - Coding standards and conventions
