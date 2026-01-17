# Deployment & CI/CD Guide

This guide details the High-Performance CI/CD strategy for our Micro-Front-End Monorepo.

## 🏗️ Architecture

We use a **Smart Build System** powered by [Turborepo](https://turbo.build/).

### CI/CD Pipeline

```mermaid
graph LR
    Push[Git Push] --> Install[Install Deps]
    Install --> Lint[Lint & Typecheck]
    Lint --> Build[Build Apps]

    subgraph "Smart Docker Strategy"
        Build --> Check{Changed?}
        Check -->|Yes| Docker[Docker Build]
        Check -->|No| Skip[Skip Build]
        Docker --> PushImg[Push to Registry]
        Skip --> UseCache[Use Existing Tag]
    end

    PushImg --> Deploy[Deploy to K8s/Cloud]
    UseCache --> Deploy
```

### The Build Matrix

| Application | Type                  | Docker Environment | Dockerfile                                        |
| :---------- | :-------------------- | :----------------- | :------------------------------------------------ |
| **Shell**   | Node.js (Remix SSR)   | `node:18-alpine`   | `apps/shell/Dockerfile`                           |
| **App A**   | Static (React/Vite)   | `nginx:alpine`     | `Dockerfile.mfe`                                  |
| **App B**   | Static (Next.js/Vite) | `nginx:alpine`     | `Dockerfile.mfe` (Arg: `BUILD_OUTPUT_DIR=public`) |

---

## 🚀 Smart Docker Build Script

Located at `scripts/smart-docker-build.js`.

### Usage

```bash
# Dry Run (Check what would be built)
node scripts/smart-docker-build.js

# Execute Building of CHANGED apps
EXECUTE=true node scripts/smart-docker-build.js
```

### Configuration

Add an `mfe` section to `package.json` to customize behavior:

```json
{
  "mfe": {
    "dockerfile": "Dockerfile.custom",
    "imageName": "custom-service-name"
  }
}
```

---

## 🤖 GitHub Actions Workflow

Example conceptual workflow:

```mermaid
sequenceDiagram
    participant GitHub
    participant Runner
    participant Registry

    GitHub->>Runner: Trigger Workflow
    Runner->>Runner: pnpm install
    Runner->>Runner: pnpm turbo build
    Runner->>Runner: node scripts/smart-docker-build.js

    loop For Each App
        Runner->>Runner: Check specific app changes
        alt Changed
            Runner->>Registry: docker push app:sha
        else Unchanged
            Runner->>Registry: (Skip)
        end
    end
```

See `scripts/smart-docker-build.js` for implementation details.
