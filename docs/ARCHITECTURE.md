# Architecture Overview

## Mental Model
This platform treats Micro-Frontends (MFEs) as **Composition**, not Routing.
1. **The Shell is the Browser's entry point.** It handles the URL, SSR, Layout, and Authentication.
2. **Micro-Apps are Widgets/Islands.** They are mounted into specific "slots" (DOM nodes) within the Shell's pages.

## Responsibilities

### App Shell (Remix)
- **Routing**: Defines all URL paths (`/`, `/app-a`, `/dashboard`).
- **Data Fetching**: Handles server-side data (user session, feature flags) via Loader functions.
- **Rendering**: Renders the HTML skeleton. If a page needs an MFE, it renders a `<div id="mfe-root">` and triggers the Loader.
- **Resilience**: Fetches `health.json` from the MFE. if `status !== available`, it renders a Fallback UI immediately, protecting the user from MFE crashes.

### Micro Apps (Vite React)
- **Deployment**: Deployed as static assets (JS/CSS/JSON) to a CDN or static host.
- **Runtime**: Client-side only. They take over a DOM element and render their own React tree.
- **Isolation**: They bundle their own logic. They DO NOT share Global State with the Shell.
- **Communication**: They emit events via `EventBus` (e.g., `APP_A:ACTION`) which the Shell listens to.

## Data Flow

1. **User requests `/app-a`**
2. **Shell Loader**:
   - Checks User Session.
   - Reads `MFE_APP_A_URL` from Environment.
   - Returns config to Client.
3. **Shell Component (`MicroFrontendHost`)**:
   - Fetches `$MFE_APP_A_URL/health.json`.
   - if **Healthy**:
     - Fetches `manifest.json`.
     - Injects Script Tag (`entry-mfe.js`).
     - Calls `window.MFE["app-a"].mount(ref, props)`.
   - if **Unhealthy**:
     - Renders Error/Maintenance UI.

## Scaling
- **Adding an App**: Clone `apps/app-a`, rename, update `.env` in shell.
- **Versioning**: MFEs are versioned independently. The Shell always loads the "current" version pointed to by the MFE's host URL.
