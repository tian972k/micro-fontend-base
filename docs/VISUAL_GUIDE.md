# 📊 Visual Architecture Guide

Complete visual reference for the Orbit Micro-Frontend Platform.

---

## 🏗️ System Overview

### Complete Architecture

```mermaid
graph TB
    subgraph Client ["🌐 Client Layer"]
        Browser[Web Browser]
    end

    subgraph Edge ["⚡ Edge Layer"]
        CDN[CDN / Cache]
        LB[Load Balancer]
    end

    subgraph Apps ["🚀 Application Layer"]
        Shell[🏠 Shell App<br/>Remix SSR<br/>Port 8000]

        subgraph MFEs ["Micro-Frontends"]
            React[⚛️ React<br/>Port 8001]
            Next[▲ Next.js<br/>Port 8002]
            Vue[💚 Vue 3<br/>Port 8003]
            Svelte[🔥 Svelte<br/>Port 8004]
            Solid[💎 SolidJS<br/>Port 8005]
        end
    end

    subgraph Shared ["📦 Shared Layer"]
        Core[💡 @repo/core<br/>State & Events]
        UI[🎨 @repo/ui<br/>Components]
        Utils[🔧 @repo/utils<br/>Helpers]
        Config[⚙️ @repo/config<br/>Configs]
    end

    subgraph Data ["💾 Data Layer"]
        Redis[(Redis<br/>Sessions)]
        DB[(PostgreSQL<br/>Database)]
        S3[(S3<br/>Assets)]
    end

    Browser --> CDN
    CDN --> LB
    LB --> Shell

    Shell -->|Module Federation| React & Next & Vue & Svelte & Solid

    Shell -.->|imports| Core & UI & Utils
    React & Next & Vue & Svelte & Solid -.->|imports| Core & UI & Utils

    Core & UI -.->|uses| Config

    Shell -.->|session| Redis
    Shell -.->|data| DB
    MFEs -.->|assets| S3

    style Browser fill:#3b82f6,stroke:#2563eb,color:#fff
    style CDN fill:#8b5cf6,stroke:#6d28d9,color:#fff
    style Shell fill:#22c55e,stroke:#16a34a,color:#fff
    style Core fill:#ec4899,stroke:#db2777,color:#fff
    style UI fill:#ec4899,stroke:#db2777,color:#fff
    style Redis fill:#ef4444,stroke:#dc2626,color:#fff
    style DB fill:#10b981,stroke:#059669,color:#fff
```

---

## 🔄 Data Flow

### Request Flow

```mermaid
sequenceDiagram
    participant U as 🧑 User
    participant B as 🌐 Browser
    participant C as ☁️ CDN
    participant S as 🏠 Shell
    participant M as ⚛️ MFE
    participant D as 💾 DB

    U->>B: Navigate to /dashboard
    B->>C: Request page
    C->>S: Forward request

    Note over S: SSR Rendering
    S->>D: Fetch user data
    D-->>S: Return data

    S-->>B: HTML + Shell JS

    Note over B: Client Hydration
    B->>M: Load MFE module
    M-->>B: MFE component

    Note over B: Render complete
    B-->>U: Interactive page
```

### State Synchronization

```mermaid
sequenceDiagram
    participant R as ⚛️ React MFE
    participant E as 📡 EventBus
    participant S as 💾 Store (Zustand)
    participant V as 💚 Vue MFE

    R->>S: Update user state
    S->>E: Emit 'user:updated'
    E->>V: Notify subscribers
    V->>S: Read new state

    Note over R,V: All MFEs stay in sync
```

---

## 🏭 Build System

### Build Pipeline

```mermaid
graph LR
    subgraph Input ["📥 Input"]
        Code[Source Code]
        Deps[Dependencies]
    end

    subgraph Stage1 ["1️⃣ Foundation"]
        C1[Config]
        U1[Utils]
    end

    subgraph Stage2 ["2️⃣ Libraries"]
        CR[Core]
        UI[UI]
    end

    subgraph Stage3 ["3️⃣ Applications"]
        SH[Shell]
        A1[React]
        A2[Vue]
        A3[Svelte]
    end

    subgraph Output ["📤 Output"]
        Dist[dist/ folders]
        Manifest[manifest.json]
    end

    Code & Deps --> C1 & U1
    C1 & U1 --> CR & UI
    CR & UI --> SH & A1 & A2 & A3
    SH & A1 & A2 & A3 --> Dist
    Dist --> Manifest

    style Input fill:#3b82f6,stroke:#2563eb,color:#fff
    style Output fill:#22c55e,stroke:#16a34a,color:#fff
```

### Development vs Production

```mermaid
graph TB
    subgraph Dev ["Development Mode"]
        D1[Vite Dev Server]
        D2[HMR Enabled]
        D3[Source Maps]
        D4[Module Federation<br/>remoteEntry.js]
    end

    subgraph Prod ["Production Mode"]
        P1[Static Build]
        P2[Minified]
        P3[Tree-shaken]
        P4[Manifest-based<br/>manifest.json]
    end

    Dev -.->|pnpm build:mfes:prod| Prod

    style Dev fill:#eab308,stroke:#ca8a04,color:#000
    style Prod fill:#22c55e,stroke:#16a34a,color:#fff
```

---

## 🚢 Deployment Flow

### CI/CD Pipeline

```mermaid
graph TB
    Start([🚀 Git Push]) --> Detect[🔍 Detect Changes]

    Detect --> Decision{What Changed?}

    Decision -->|All| Full[🔴 Full Build]
    Decision -->|Packages| Pkg[🟡 Build Packages]
    Decision -->|Apps| Smart[🟢 Smart Build]
    Decision -->|Docs| Skip[⚪ Skip]

    Full & Pkg & Smart --> QA[✅ Quality Gate]
    QA --> Test[🧪 Test]
    Test --> Docker[🐳 Docker Build]
    Docker --> Push[📤 Push Images]
    Push --> Deploy[🚀 Deploy]

    Skip --> End([✅ Complete])
    Deploy --> End

    style Start fill:#3b82f6,stroke:#2563eb,color:#fff
    style Decision fill:#eab308,stroke:#ca8a04,color:#000
    style Full fill:#ef4444,stroke:#dc2626,color:#fff
    style Smart fill:#22c55e,stroke:#16a34a,color:#fff
    style Deploy fill:#8b5cf6,stroke:#6d28d9,color:#fff
```

### Docker Build Strategy

```mermaid
graph LR
    subgraph Source ["Source"]
        S1[Source Code]
        S2[pnpm-lock.yaml]
    end

    subgraph Build ["Multi-Stage Build"]
        B1[1️⃣ Dependencies]
        B2[2️⃣ Build]
        B3[3️⃣ Production]
    end

    subgraph Images ["Container Images"]
        I1[🏠 Shell<br/>node:alpine<br/>~150MB]
        I2[⚛️ React<br/>nginx:alpine<br/>~25MB]
        I3[💚 Vue<br/>nginx:alpine<br/>~23MB]
    end

    subgraph Registry ["Registry"]
        R1[ghcr.io/org/shell:latest]
        R2[ghcr.io/org/react:latest]
        R3[ghcr.io/org/vue:latest]
    end

    S1 & S2 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> I1 & I2 & I3
    I1 --> R1
    I2 --> R2
    I3 --> R3

    style Build fill:#3b82f6,stroke:#2563eb,color:#fff
    style Images fill:#22c55e,stroke:#16a34a,color:#fff
```

---

## 🎯 Module Federation

### Runtime Loading

```mermaid
sequenceDiagram
    participant S as 🏠 Shell
    participant M as 📄 Manifest
    participant R as ⚛️ Remote MFE
    participant B as 🧩 Bundle

    Note over S: User navigates to /dashboard/react

    S->>M: Fetch manifest.json
    M-->>S: {url, scope, module}

    S->>R: Load remoteEntry.js
    R-->>S: Expose modules

    S->>B: Import ./App
    B-->>S: React component

    Note over S: Mount & render
```

### Shared Dependencies

```mermaid
graph TB
    subgraph Shell ["Shell"]
        S_React[React 18.2]
        S_Core["@repo/core"]
        S_UI["@repo/ui"]
    end

    subgraph MFE1 ["React MFE"]
        M1_React["React 18.2<br/>singleton"]
        M1_Core["@repo/core<br/>singleton"]
    end

    subgraph MFE2 ["Vue MFE"]
        M2_Vue[Vue 3.3]
        M2_Core["@repo/core<br/>singleton"]
    end

    S_React -.->|shared| M1_React
    S_Core -.->|shared| M1_Core & M2_Core
    S_UI -.->|not shared| MFE1 & MFE2

    style Shell fill:#22c55e,stroke:#16a34a,color:#fff
    style M1_React fill:#61dafb,stroke:#0088cc,color:#000
    style M2_Vue fill:#42b883,stroke:#35495e,color:#fff
```

---

## 🔐 Security Architecture

### Defense Layers

```mermaid
graph TB
    User[User Request] --> L1[Layer 1: WAF]
    L1 --> L2[Layer 2: HTTPS/TLS]
    L2 --> L3[Layer 3: Input Validation]
    L3 --> L4[Layer 4: Authentication]
    L4 --> L5[Layer 5: Authorization]
    L5 --> L6[Layer 6: Rate Limiting]
    L6 --> App[Application]
    App --> L7[Layer 7: Monitoring]

    style User fill:#3b82f6,stroke:#2563eb,color:#fff
    style App fill:#22c55e,stroke:#16a34a,color:#fff
    style L7 fill:#ec4899,stroke:#db2777,color:#fff
```

---

## 📈 Performance Optimization

### Bundle Size Journey

```mermaid
graph LR
    subgraph Before ["Before"]
        B1[850KB Bundle]:::bad
        B2[All frameworks]:::bad
        B3[No splitting]:::bad
    end

    subgraph Actions ["Optimizations"]
        A1[Tree shaking]:::action
        A2[Code splitting]:::action
        A3[Lazy loading]:::action
        A4[Framework-specific]:::action
    end

    subgraph After ["After"]
        AF1[245KB Bundle]:::good
        AF2[71% smaller]:::good
        AF3[Faster loads]:::good
    end

    Before --> Actions --> After

    classDef bad fill:#ef4444,stroke:#dc2626,color:#fff
    classDef action fill:#eab308,stroke:#ca8a04,color:#000
    classDef good fill:#22c55e,stroke:#16a34a,color:#fff
```

### Loading Strategy

```mermaid
graph TB
    Initial[Initial Load] --> Critical[Critical Resources]
    Critical --> Shell[Shell Bundle<br/>~180KB]
    Shell --> Render1[First Paint]

    Render1 --> Lazy[Lazy Load MFEs]
    Lazy --> MFE1[React MFE<br/>~120KB]
    Lazy --> MFE2[Vue MFE<br/>~110KB]

    MFE1 & MFE2 --> Interactive[Fully Interactive]

    style Initial fill:#3b82f6,stroke:#2563eb,color:#fff
    style Render1 fill:#eab308,stroke:#ca8a04,color:#000
    style Interactive fill:#22c55e,stroke:#16a34a,color:#fff
```

---

## 🧪 Testing Strategy

```mermaid
graph TB
    subgraph Local ["Local Development"]
        L1[Unit Tests<br/>Jest/Vitest]
        L2[Component Tests<br/>Testing Library]
        L3[E2E Tests<br/>Playwright]
    end

    subgraph CI ["CI Pipeline"]
        C1[Lint & Type Check]
        C2[Unit Tests]
        C3[Build Validation]
    end

    subgraph Staging ["Staging"]
        S1[Integration Tests]
        S2[Performance Tests]
        S3[Security Scan]
    end

    Local --> CI --> Staging --> Prod[🚀 Production]

    style Local fill:#3b82f6,stroke:#2563eb,color:#fff
    style CI fill:#eab308,stroke:#ca8a04,color:#000
    style Staging fill:#8b5cf6,stroke:#6d28d9,color:#fff
    style Prod fill:#22c55e,stroke:#16a34a,color:#fff
```

---

## 📱 Responsive Architecture

```mermaid
graph TB
    subgraph Desktop ["💻 Desktop"]
        D1[Shell renders full layout]
        D2[All MFEs load in parallel]
        D3[Rich interactions]
    end

    subgraph Tablet ["📱 Tablet"]
        T1[Adaptive layout]
        T2[Progressive MFE loading]
        T3[Touch optimized]
    end

    subgraph Mobile ["📱 Mobile"]
        M1[Mobile-first layout]
        M2[On-demand MFE loading]
        M3[Optimized bundle size]
    end

    User[🧑 User] --> Device{Device Type}
    Device -->|Desktop| Desktop
    Device -->|Tablet| Tablet
    Device -->|Mobile| Mobile

    style Desktop fill:#3b82f6,stroke:#2563eb,color:#fff
    style Tablet fill:#8b5cf6,stroke:#6d28d9,color:#fff
    style Mobile fill:#22c55e,stroke:#16a34a,color:#fff
```

---

## 🎨 Component Library Architecture

```mermaid
graph TB
    subgraph Variants ["Shared Variants (CVA)"]
        V1[buttonVariants]
        V2[cardVariants]
        V3[inputVariants]
    end

    subgraph React ["⚛️ React Components"]
        R1[Button.tsx]
        R2[Card.tsx]
        R3[Input.tsx]
    end

    subgraph Vue ["💚 Vue Components"]
        VU1[Button.vue]
        VU2[Card.vue]
        VU3[Input.vue]
    end

    subgraph Svelte ["🔥 Svelte Components"]
        S1[Button.svelte]
        S2[Card.svelte]
        S3[Input.svelte]
    end

    V1 --> R1 & VU1 & S1
    V2 --> R2 & VU2 & S2
    V3 --> R3 & VU3 & S3

    style Variants fill:#ec4899,stroke:#db2777,color:#fff
    style React fill:#61dafb,stroke:#0088cc,color:#000
    style Vue fill:#42b883,stroke:#35495e,color:#fff
    style Svelte fill:#ff3e00,stroke:#cc3200,color:#fff
```

---

## 📊 Monitoring & Observability

```mermaid
graph TB
    subgraph App ["Application"]
        A1[Shell]
        A2[MFEs]
    end

    subgraph Metrics ["📊 Metrics"]
        M1[Performance Vitals]
        M2[Bundle Sizes]
        M3[Load Times]
    end

    subgraph Logs ["📝 Logs"]
        L1[Application Logs]
        L2[Error Tracking]
        L3[Audit Logs]
    end

    subgraph Alerts ["🔔 Alerts"]
        AL1[Error Rate > 5%]
        AL2[Load Time > 3s]
        AL3[Build Failed]
    end

    A1 & A2 --> M1 & M2 & M3
    A1 & A2 --> L1 & L2 & L3
    M1 & M2 & M3 --> AL1 & AL2
    L1 & L2 --> AL3

    AL1 & AL2 & AL3 --> Team[👥 Dev Team]

    style App fill:#3b82f6,stroke:#2563eb,color:#fff
    style Metrics fill:#22c55e,stroke:#16a34a,color:#fff
    style Logs fill:#8b5cf6,stroke:#6d28d9,color:#fff
    style Alerts fill:#ef4444,stroke:#dc2626,color:#fff
```

---

## 🔄 State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> Loading: "User Action"
    Loading --> Success: "Data Received"
    Loading --> Error: "Request Failed"

    Success --> Idle: Reset
    Error --> Idle: Retry

    state Success {
        [*] --> UpdateStore
        UpdateStore --> EmitEvent
        EmitEvent --> NotifySubscribers
        NotifySubscribers --> [*]
    }
```

---

## 🎯 Quick Reference

| Concept                   | Diagram Location    | Purpose                     |
| ------------------------- | ------------------- | --------------------------- |
| **Complete Architecture** | System Overview     | Full system view            |
| **Request Flow**          | Data Flow           | Understand request handling |
| **Build Pipeline**        | Build System        | Build process               |
| **CI/CD**                 | Deployment Flow     | Automation pipeline         |
| **Module Federation**     | Runtime Loading     | MFE loading mechanism       |
| **Security**              | Defense Layers      | Security strategy           |
| **Performance**           | Bundle Optimization | Optimization journey        |
| **Components**            | Component Library   | UI architecture             |

---

**💡 Tip**: Use this guide alongside the main documentation for comprehensive understanding of the Orbit platform!
