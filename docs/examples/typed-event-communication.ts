/**
 * Example: Type-Safe Cross-MFE Communication
 *
 * This demonstrates the Orbit framework's contract-based event system,
 * inspired by Google Chrome and TikTok's internal architectures.
 *
 * Real-world use cases:
 * - Navigation between MFEs (Shell initiates, other MFEs listen)
 * - User authentication events (User MFE broadcasts, others update UI)
 * - Theme/locale changes (Config MFE broadcasts, others adapt)
 * - Cross-MFE notifications (Analytics, alerts, etc.)
 */

import {
  RuntimeEventMap,
  RuntimeEventName,
  RuntimeEventPayload,
} from "@repo/core/contracts";
import { EventBus } from "@repo/core/shared";

// ============================================================================
// SCENARIO 1: Navigate Between MFEs (Shell Orchestration)
// ============================================================================

/**
 * Shell app orchestrates navigation.
 *
 * When user clicks "Analytics" in sidebar:
 * 1. Shell emits typed navigation event
 * 2. Current MFE unmounts
 * 3. New MFE mounts in same container
 */
export const navigateToAnalytics = () => {
  // Fully typed—TypeScript catches errors at compile time
  EventBus.emit("nav:navigate", {
    to: "/analytics",
    replace: false,
  });
  // ✅ Works: Matches RuntimeEventMap["nav:navigate"]
  // ❌ Won't compile: EventBus.emit("nav:navigate", { to: "/analytics", unknown: true })
};

// ============================================================================
// SCENARIO 2: User Login (Cross-MFE Authentication)
// ============================================================================

/**
 * User MFE broadcasts login event.
 * Other MFEs listen and update their local state.
 */

// In user-mfe/src/auth.ts
export const handleLogin = async (email: string, password: string) => {
  const response = await fetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const { userId, token } = await response.json();

  // Broadcast to all MFEs
  EventBus.emit("user:login", {
    userId,
    token,
  });
};

// In analytics-mfe/src/app.tsx
import { useEffect } from "react";

export const Analytics = () => {
  useEffect(() => {
    const unsubscribe = EventBus.subscribe("user:login", (payload) => {
      // payload is fully typed: { userId: string; token?: string }
      console.log("User logged in:", payload.userId);
      // Update analytics context, fetch user-specific dashboards, etc.
    });

    return unsubscribe;
  }, []);

  return "Analytics Dashboard";
};

// ============================================================================
// SCENARIO 3: Theme Changes (Cascading Updates)
// ============================================================================

/**
 * Config MFE updates theme.
 * All MFEs listen and apply CSS/Tailwind theme classes.
 */

export const setTheme = (theme: "light" | "dark" | "system") => {
  EventBus.emit("theme:set", { theme });

  // Every MFE that subscribed updates:
  // - Tailwind class on <html>
  // - Rerender components that use useTheme()
};

// In any MFE hook:
import { userStore } from "@repo/core/shared";

export const useTheme = () => {
  const { theme } = userStore.getState();

  // Listen for theme changes
  useEffect(() => {
    const unsubscribe = EventBus.subscribe("theme:set", (payload) => {
      // payload: { theme: "light" | "dark" | "system" }
      applyTheme(payload.theme);
    });

    return unsubscribe;
  }, []);

  return theme;
};

// ============================================================================
// SCENARIO 4: Adding a Custom Event (Extension Pattern)
// ============================================================================

/**
 * Want to add cross-MFE feature flags?
 *
 * Step 1: Extend RuntimeEventMap in @repo/core/contracts/runtime-events.ts
 *
 *   export type RuntimeEventMap = {
 *     // existing events...
 *     "feature:changed": { featureKey: string; enabled: boolean; rolloutPercent?: number };
 *   };
 *
 * Step 2: Use in your MFE (TypeScript ensures type safety):
 */

export const enableFeature = (featureKey: string, enabled: boolean) => {
  EventBus.emit("feature:changed", {
    featureKey,
    enabled,
    rolloutPercent: 50,
  });
};

// Step 3: Other MFEs listen:
export const useFeatureFlag = (featureKey: string) => {
  const [enabled, setEnabled] = React.useState(false);

  useEffect(() => {
    const unsubscribe = EventBus.subscribe("feature:changed", (payload) => {
      if (payload.featureKey === featureKey) {
        setEnabled(payload.enabled);
      }
    });

    return unsubscribe;
  }, [featureKey]);

  return enabled;
};

// ============================================================================
// SCENARIO 5: Analytics Event Tracking (Pattern for Observability)
// ============================================================================

/**
 * Every MFE can track user behavior without coupling to analytics vendor.
 *
 * Step 1: Add event to RuntimeEventMap
 *   "analytics:track": { event: string; properties: Record<string, unknown> };
 *
 * Step 2: Track in your MFE
 */

export const trackUserAction = (
  action: string,
  properties: Record<string, unknown>,
) => {
  EventBus.emit("analytics:track", {
    event: action,
    properties,
  });
};

// Step 3: Analytics MFE (or Shell) listens and forwards to vendor
export const setupAnalyticsListener = () => {
  EventBus.subscribe("analytics:track", (payload) => {
    // Send to Mixpanel, Segment, etc.
    mixpanel.track(payload.event, payload.properties);
  });
};

// ============================================================================
// BEST PRACTICES
// ============================================================================

/**
 * ✅ DO:
 * - Emit events for cross-MFE concerns (navigation, auth, theme)
 * - Subscribe in useEffect + clean up on unmount
 * - Type-check event payloads (TypeScript will help)
 * - Document new events you add to RuntimeEventMap
 *
 * ❌ DON'T:
 * - Emit 100+ events per second (use stores for high-frequency updates)
 * - Break event API contracts (SemVer rules apply)
 * - Store MFE state outside of Zustand stores + EventBus
 * - Create event cycles (A emits X → B emits X → A listens)
 */

// ============================================================================
// TYPE SAFETY SHOWCASE (Why Contracts Matter)
// ============================================================================

// ✅ Correct: TypeScript knows the shape
const goodExample = () => {
  EventBus.emit("user:login", { userId: "123", token: "secret" });
};

// ❌ Won't compile: Property 'username' does not exist
const badExample = () => {
  // @ts-expect-error: Property 'username' does not exist
  EventBus.emit("user:login", { username: "alice" });
};

// ✅ Correct: Accessing payload properties is type-safe
EventBus.subscribe("user:login", (payload) => {
  const userId = payload.userId; // ✅ Type: string
  // const token = payload.nonExistent; // ❌ Type error
});

// ============================================================================
// PRODUCTION EXAMPLE: Login Flow with Error Handling
// ============================================================================

export const RealWorldLoginExample = async () => {
  try {
    // 1. User logs in
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@example.com", password: "..." }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const { userId, token } = await response.json();

    // 2. Emit typed event—all listening MFEs update instantly
    EventBus.emit("user:login", { userId, token });

    // 3. Navigate to dashboard
    EventBus.emit("nav:navigate", { to: "/dashboard" });

    // 4. Show success notification
    EventBus.emit("notification:show", {
      title: "Welcome",
      message: `Logged in as ${email}`,
      variant: "success",
    });
  } catch (error) {
    EventBus.emit("notification:show", {
      title: "Login failed",
      message: error.message,
      variant: "error",
    });
  }
};

// ============================================================================
// Comparison: Without Contracts (Brittle)
// ============================================================================

/**
 * ❌ Before (untyped event system):
 *
 * EventBus.emit("login", { userId: "123" }); // Missing 'token'?
 * EventBus.subscribe("login", (data: any) => { // 'any' kills type safety
 *   console.log(data.userId);     // Works
 *   console.log(data.nonExistent); // Silent error in production
 * });
 *
 * ✅ After (with contracts):
 *
 * EventBus.emit("user:login", { userId: "123" });
 * // @ts-error: Object literal may only specify known properties
 * EventBus.emit("user:login", { username: "alice" }); // ✅ Caught at compile time
 */
