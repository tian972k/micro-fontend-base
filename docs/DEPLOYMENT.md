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

> 📚 **Deep Dive**: For detailed architecture, component roles, and design principles, see [ARCHITECTURE.md](./ARCHITECTURE.md).

### Deployment Topology

```mermaid
flowchart TB
    User[👤 User] --> CDN[🌐 CDN/Edge Cache]

    subgraph Cloud ["Cloud Infrastructure"]
        CDN --> LB[⚖️ Load Balancer]

        subgraph Apps ["Application Layer"]
            LB --> Shell1[🏠 Shell 1<br/>Node.js:3000]
            LB --> Shell2[🏠 Shell 2<br/>Node.js:3000]

            Shell1 & Shell2 --> MFE1[⚛️ React MFE<br/>Nginx:80]
            Shell1 & Shell2 --> MFE2["▲ Next.js MFE<br/>Nginx:80"]
            Shell1 & Shell2 --> MFE3["💚 Vue MFE<br/>Nginx:80"]
            Shell1 & Shell2 --> MFE4["🔥 Svelte MFE<br/>Nginx:80"]
        end

        subgraph Data ["Data Layer"]
            Redis[(🟥 Redis<br/>Sessions)]
            DB[(🟢 PostgreSQL<br/>Database)]
        end
    end

    Shell1 & Shell2 -.-> Redis
    Shell1 & Shell2 -.-> DB

    style User fill:#3b82f6,stroke:#2563eb,color:#fff
    style CDN fill:#8b5cf6,stroke:#6d28d9,color:#fff
    style LB fill:#eab308,stroke:#ca8a04,color:#000
    style Shell1 fill:#22c55e,stroke:#16a34a,color:#fff
    style Shell2 fill:#22c55e,stroke:#16a34a,color:#fff
    style Redis fill:#ef4444,stroke:#dc2626,color:#fff
    style DB fill:#10b981,stroke:#059669,color:#fff
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

All MFE apps are configured in `scripts/mfe.config.mjs`. This configuration drives the build process, port assignment, and federation setup.

> See [ARCHITECTURE.md - MFE Configuration](./ARCHITECTURE.md#5-mfe-configuration) for the complete schema and configuration details.

### Build Commands

| Command                | Description                      | Use Case              |
| :--------------------- | :------------------------------- | :-------------------- |
| `pnpm build`           | Build all packages and apps      | Full build            |
| `pnpm build:packages`  | Build only shared packages       | Package changes       |
| `pnpm build:mfes`      | Build all MFE apps (development) | Development           |
| `pnpm build:mfes:prod` | Production build for all MFEs    | Production deployment |

### Turbo Build Pipeline

```mermaid
flowchart TB
    subgraph Stage1 ["Stage 1: Foundation (Parallel)"]
        Config[📦 @repo/config<br/>~5s]:::pkg
        Utils[🔧 @repo/utils<br/>~3s]:::pkg
    end

    subgraph Stage2 ["Stage 2: Core Libraries (Parallel)"]
        Core[💡 @repo/core<br/>~8s]:::pkg
        UI[🎨 @repo/ui<br/>~12s]:::pkg
    end

    subgraph Stage3 ["Stage 3: Applications (Parallel)"]
        Shell[🏠 Shell<br/>~15s]:::app
        React[⚛️ React<br/>~10s]:::app
        Vue["💚 Vue<br/>~10s"]:::app
        Svelte["🔥 Svelte<br/>~8s"]:::app
        Solid["💎 Solid<br/>~8s"]:::app
    end

    Config & Utils --> Core & UI
    Core & UI --> Shell & React & Vue & Svelte & Solid

    Stage1 -.->|"Total: ~5s"| T1[ ]
    Stage2 -.->|"Total: ~12s"| T2[ ]
    Stage3 -.->|"Total: ~15s"| T3[ ]

    T1 & T2 & T3 -.-> Total[\Total Build Time: ~32s/]

    classDef pkg fill:#8b5cf6,stroke:#6d28d9,color:#fff
    classDef app fill:#22c55e,stroke:#16a34a,color:#fff
    style Total fill:#3b82f6,stroke:#2563eb,color:#fff
    style T1 fill:none,stroke:none
    style T2 fill:none,stroke:none
    style T3 fill:none,stroke:none
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

### Docker Build & Deploy Flow

```mermaid
flowchart LR
    subgraph Local ["Local Development"]
        Code[💻 Source Code] --> Build[🔨 Build Assets]
    end

    subgraph Docker ["Docker Build"]
        Build --> Multi[Multi-Stage Build]
        Multi --> D1[🏠 Shell Image]:::shell
        Multi --> D2[⚛️ React Image]:::mfe
        Multi --> D3["💚 Vue Image"]:::mfe
    end

    subgraph Registry ["Container Registry"]
        D1 --> R1[ghcr.io/org/shell:latest]
        D2 --> R2[ghcr.io/org/react:latest]
        D3 --> R3[ghcr.io/org/vue:latest]
    end

    subgraph Deploy ["Deployment"]
        R1 & R2 & R3 --> K8s[⎈ Kubernetes/<br/>Docker Swarm]
        K8s --> Live[🌐 Production]
    end

    classDef shell fill:#22c55e,stroke:#16a34a,color:#fff
    classDef mfe fill:#3b82f6,stroke:#2563eb,color:#fff
    style Live fill:#ec4899,stroke:#db2777,color:#fff
```

### Local Development (Recommended)

For day-to-day development with Hot Module Replacement (HMR) and Turbo caching:

```bash
# Start all apps in development mode
pnpm dev

# Start specific apps
pnpm dev --filter=shell --filter=app-react

# Start Shell + specific MFEs (others will be loaded from dev manifest)
pnpm dev:mfes
```

This runs:

- **Shell (Remix):** `http://localhost:8000`
- **App React:** `http://localhost:8001`
- **App Next.js:** `http://localhost:8002`
- **App Vue:** `http://localhost:8003`
- **App Svelte:** `http://localhost:8004`
- **App SolidJS:** `http://localhost:8005`

### Docker Production Preview

Use Docker Compose to simulate the production environment locally. This builds optimized artifacts and serves them via Nginx/Node.js.

```bash
# Start all services (Builds production images)
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f shell

# Stop all services
docker-compose down
```

> **Note:** This is NOT a development environment. It runs `production` builds. Changes require a rebuild.

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

The CI/CD pipeline is designed to be smart and efficient, only building and deploying what has changed.

```mermaid
flowchart TD
    Start([Push / PR]) --> Secrets{Check Secrets}
    Secrets --> Detect[Detect Changes]

    subgraph Quality_Gate [Quality Gate]
        Detect --> Lint[Lint & Typecheck]
    end

    subgraph Build_Core [Core Build]
        Lint --> BuildPkg[Build Packages]
    end

    subgraph Build_Apps [Build Applications]
        BuildPkg --> BuildShell[Build Shell]
        BuildPkg --> BuildReact[Build React]
        BuildPkg --> BuildNext[Build Next.js]
        BuildPkg --> BuildVue[Build Vue]
        BuildPkg --> BuildSvelte[Build Svelte]
        BuildPkg --> BuildSolid[Build SolidJS]
    end

    subgraph Docker_Publish [Docker Publish]
        BuildShell --> DockerShell[Docker Build Shell]
        BuildReact --> DockerReact[Docker Build React]
        BuildNext --> DockerNext[Docker Build Next.js]
        BuildVue --> DockerVue[Docker Build Vue]
        BuildSvelte --> DockerSvelte[Docker Build Svelte]
        BuildSolid --> DockerSolid[Docker Build SolidJS]
    end

    DockerShell --> Summary[Pipeline Summary]
    DockerReact --> Summary
    DockerNext --> Summary
    DockerVue --> Summary
    DockerSvelte --> Summary
    DockerSolid --> Summary

    Detect -.->|Skip if no changes| Summary
```

### GitHub Actions Workflow

Our pipeline is optimized for performance using `dorny/paths-filter` for change detection and `turborepo` for caching.

[View complete workflow configuration](../.github/workflows/ci-cd.yml)

### Key Features

1. **Change Detection**: Using `dorny/paths-filter` to determine exactly which apps or packages have changed.
2. **Affected Builds**: `pnpm turbo run ... --affected` ensures we only lint/test changed code.
3. **Smart Docker**: We only build and push Docker images for apps that actually changed, saving massive amounts of CI time and bandwidth.
4. **Artifact Sharing**: Build artifacts from `build-packages` are passed to app build jobs to avoid recompilation.

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
    ports:
      - "8000:3000" # Host 8000 -> Container 3000
    environment:
      - NODE_ENV=production
      # - MFE_APP_REACT_PUBLIC_URL=https://app-react.example.com
    depends_on:
      - app-react
      - app-nextjs
      # ...
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

### Vercel Deployment

> **Detailed Guide**: See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete Vercel setup.

**Architecture: API Proxy Pattern**

```
Shell (Gateway): micro-fontend-base-shell.vercel.app
    ├─ /api/proxy/react/*   → micro-fontend-base-app-react.vercel.app
    ├─ /api/proxy/vue/*     → micro-fontend-base-app-vue.vercel.app
    ├─ /api/proxy/svelte/*  → micro-fontend-base-app-svelte.vercel.app
    ├─ /api/proxy/solid/*   → micro-fontend-base-app-solidjs.vercel.app
    └─ /api/proxy/nextjs/*  → micro-fontend-base-app-nextjs.vercel.app
```

**Shell Environment Variables (Vercel Dashboard):**

| Variable               | Value                                               |
| ---------------------- | --------------------------------------------------- |
| `VITE_APP_REACT_HOST`  | `https://micro-fontend-base-app-react.vercel.app`   |
| `VITE_APP_NEXTJS_HOST` | `https://micro-fontend-base-app-nextjs.vercel.app`  |
| `VITE_APP_VUE_HOST`    | `https://micro-fontend-base-app-vue.vercel.app`     |
| `VITE_APP_SVELTE_HOST` | `https://micro-fontend-base-app-svelte.vercel.app`  |
| `VITE_APP_SOLID_HOST`  | `https://micro-fontend-base-app-solidjs.vercel.app` |

**Deploy Commands:**

```bash
# Deploy Shell
cd apps/shell && npx vercel --prod

# Deploy MFE
cd apps/app-react && npx vercel --prod
```

### Netlify / Other Static Hosting

For static MFE apps:

```bash
# Build for static hosting
pnpm turbo run build --filter=app-react

# Output: apps/app-react/dist/
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

This is a reference configuration for deploying to Kubernetes.

**Shell (Remix) Deployment:**

```yaml
# kubernetes/shell.yaml
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
          image: myregistry/orbit-shell:latest
          ports:
            - containerPort: 3000 # Shell runs on port 3000
          env:
            - name: NODE_ENV
              value: "production"
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
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
      targetPort: 3000 # Map Service port 80 to Container port 3000
  type: ClusterIP
```

**MFE (Nginx) Deployment:**

```yaml
# kubernetes/app-react.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orbit-app-react
spec:
  replicas: 2
  selector:
    matchLabels:
      app: orbit-app-react
  template:
    metadata:
      labels:
        app: orbit-app-react
    spec:
      containers:
        - name: app-react
          image: myregistry/orbit-app-react:latest
          ports:
            - containerPort: 80 # Nginx runs on port 80
          readinessProbe:
            httpGet:
              path: /health.json
              port: 80
---
apiVersion: v1
kind: Service
metadata:
  name: orbit-app-react
spec:
  selector:
    app: orbit-app-react
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP
```

### AWS ECS / Fargate

Reference Task Definition for AWS ECS.

```json
{
  "family": "orbit-shell",
  "containerDefinitions": [
    {
      "name": "orbit-shell",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/orbit-shell:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/orbit-shell",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "cpu": "256",
  "memory": "512",
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc"
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
