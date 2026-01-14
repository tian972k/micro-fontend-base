# Guardrails & Anti-Patterns

Strict rules to ensure the long-term maintainability of the Micro-Frontend Platform.

## 🟢 DOs (Guardrails)

1. **DO** use the Event Bus for all cross-app communication.
2. **DO** keep Micro-Apps strictly client-side.
3. **DO** version Micro-Apps independently.
4. **DO** use `packages/ui` for all UI primitives.
5. **DO** fail gracefully. If an MFE is down, the Shell MUST remain usable.

## 🔴 DON'Ts (Anti-Patterns)

1. **DON'T Import Shell Code in MFEs**
   - * Why?* It creates a circular dependency and breaks isolation.
   - *Detection:* Imports starting with `@/` inside `apps/app-*` that resolve to `apps/shell`.

2. **DON'T Share Global State (Directly)**
   - *Why?* Import `store` from Shell creates tight coupling. Shell update breaks App Con.
   - *Allowed:*
     - **Event Bus**: Reactive updates.
     - **LocalStorage**: Hydrate/Persist state (e.g. Redux Persist) independently.
     - **Props**: Pass data when mounting.

3. **DON'T SSR Micro-Apps (Inside Shell)**
   - *Why?* Shell cannot render remote code it doesn't have. Complexity explosion (Hydration mismatches).
   - *Context:* This architecture is for **Auth-walled Dashboards/Portals**.
   - *Better Way:* If you need SEO (Landing Pages, Blogs), use `Next.js` running **Standalone** or routed via Gateway/Proxy, don't mount it inside the Shell.

4. **DON'T Bypass the Registry**
   - *Why?* Hardcoding URLs in components leads to deployment nightmares.
   - *Rule:* Always use `MicroFrontendHost` which uses `config.server.ts`.

5. **DON'T Custom Style**
   - *Why?* Inconsistent UI.
   - *Rule:* If it's not in `@repo/ui`, add it there or use Tailwind utilities.

6. **DON'T Conditionally Render MFE Containers**
   - *Why?* Causes "Container Not Found" errors. The container `div` must exist *before* the remote script executes and tries to mount.
   - *Anti-Pattern:* `if (loading) return <Spinner />;` (The div is missing!)
   - *Rule:* Always render the `<div ref={container} />` and use a loading *overlay* instead.

7.  **DON'T Forget Base URL for Assets**
    - *Why?* Images/Fonts will 404 because they try to load from Shell's host.
    - *Rule:* Set `base: "http://localhost:800x"` in Vite Config so chunks import correctly.

8.  **DON'T Skip Error Boundaries**
    - *Why?* One crashed MFE shouldn't kill the whole Shell.
    - *Rule:* Wrap your MFE root component in an Error Boundary.

## ⚠️ Common Failure Modes


- **CORS Errors**: The Shell cannot load `main.js` from the MFE host.
  - *Fix:* Configure Access-Control-Allow-Origin on the MFE CDN.
- **Version Drift**: Shell expects Prop X, MFE expects Prop Y.
  - *Fix:* Contract testing or rigid prop types in `@repo/core`.
- **CSS Conflicts**: MFE A styles leak into Shell.
  - *Fix:* Tailwind prefixing or Shadow DOM (optional, but increased complexity). We rely on specific selector usage in this architecture.
