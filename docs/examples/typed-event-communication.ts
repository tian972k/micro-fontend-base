/**
 * Example: Cross-MFE Communication via the shared EventBus
 *
 * This reflects the *actual* runtime API in this repo today
 * (packages/core/src/events/event-bus.ts), not an aspirational one.
 *
 * Key facts about the real implementation:
 * - `EventBus` is a class with a singleton accessor `EventBus.getInstance()`.
 *   You almost always want the pre-built singleton export instead:
 *   `import { globalEventBus } from "@repo/core/shared"`.
 * - `emit`/`on`/`off` are *instance* methods (not static) - there is no
 *   `EventBus.emit(...)`, only `globalEventBus.emit(...)`.
 * - Event names today are the small set of string constants in
 *   `EVENT_KEYS` (packages/core/src/constants/keys.ts) - currently just
 *   `APP_COUNTER` and `LOCALE_CHANGE`. Payloads are `unknown` at the
 *   EventBus level; each listener narrows the type itself (see
 *   packages/core/src/state/common/counter-store.ts and locale-store.ts
 *   for the real pattern).
 * - There *is* a `RuntimeEventMap` type (packages/core/src/contracts/
 *   runtime-events.ts) sketching a more strongly-typed event contract
 *   (`nav:navigate`, `user:login`, `theme:set`, etc.), but as of this
 *   writing it isn't wired into EventBus - nothing in the codebase emits
 *   or listens for those event names. Treat it as a design sketch for a
 *   possible future improvement, not a currently-working API.
 */

import { globalEventBus, EVENT_KEYS } from "@repo/core/shared";

// ============================================================================
// SCENARIO 1: Broadcast a local state change to every other MFE
// ============================================================================

/**
 * This is the real pattern used by counter-store.ts: update local state,
 * then broadcast it under a shared key so every other MFE's copy of the
 * same store (or any other listener) picks it up.
 */
export function broadcastCounter(count: number) {
  globalEventBus.emit(EVENT_KEYS.APP_COUNTER, { count });
}

// ============================================================================
// SCENARIO 2: Listen for changes broadcast by other MFEs
// ============================================================================

export function listenForCounterChanges(
  onChange: (count: number) => void,
): () => void {
  // `on` returns an unsubscribe function - always call it on cleanup
  // (e.g. in a React useEffect's return, or on MFE unmount).
  return globalEventBus.on(EVENT_KEYS.APP_COUNTER, (data: unknown) => {
    const payload = data as { count?: number };
    if (typeof payload?.count === "number") {
      onChange(payload.count);
    }
  });
}

// React usage:
//
//   useEffect(() => listenForCounterChanges(setLocalCount), []);

// ============================================================================
// SCENARIO 3: The recommended pattern for a *new* synced store
// ============================================================================

/**
 * Rather than hand-rolling emit/on calls like the scenarios above (which
 * is what counter-store.ts/locale-store.ts did before being refactored),
 * new stores should use the `syncStore` helper
 * (packages/core/src/state/sync-store.ts). It wires up both directions
 * (broadcast local changes, apply remote changes) and guards against the
 * store re-broadcasting a change it just received from the bus:
 *
 *   import { createStore } from "zustand/vanilla";
 *   import { syncStore } from "@repo/core/shared";
 *
 *   const store = createStore<{ value: string }>(() => ({ value: "" }));
 *
 *   syncStore(
 *     {
 *       getState: () => store.getState(),
 *       setState: (state) => store.setState(state),
 *       subscribe: (listener) => store.subscribe(listener),
 *     },
 *     { key: "MY_NEW_EVENT_KEY" },
 *   );
 *
 * See packages/core/src/state/common/counter-store.ts for a complete,
 * working example of this pattern.
 */

// ============================================================================
// ADDING A NEW EVENT KEY
// ============================================================================

/**
 * 1. Add the key to EVENT_KEYS in packages/core/src/constants/keys.ts:
 *
 *      export const EVENT_KEYS = {
 *        APP_COUNTER: "APP_COUNTER",
 *        LOCALE_CHANGE: "LOCALE_CHANGE",
 *        MY_NEW_EVENT: "MY_NEW_EVENT",
 *      } as const;
 *
 * 2. Emit it: globalEventBus.emit(EVENT_KEYS.MY_NEW_EVENT, myPayload);
 * 3. Listen: globalEventBus.on(EVENT_KEYS.MY_NEW_EVENT, (data) => { ... });
 *
 * There's currently no compile-time enforcement of the payload shape for
 * a given key (see the note about RuntimeEventMap above) - callers agree
 * on the shape by convention. Keep payloads small, and document the
 * shape next to the EVENT_KEYS entry.
 */

// ============================================================================
// BEST PRACTICES
// ============================================================================

/**
 * DO:
 * - Always store and call the unsubscribe function `on()` returns.
 * - Narrow `unknown` payloads defensively before using them (see
 *   listenForCounterChanges above) - nothing validates the payload shape
 *   at runtime.
 * - Prefer `syncStore` over hand-rolled emit/on pairs for new synced state.
 *
 * DON'T:
 * - Reference `EventBus.emit(...)` / `EventBus.subscribe(...)` directly -
 *   those methods don't exist on the class; use the `globalEventBus`
 *   instance and its `emit`/`on`/`off` methods.
 * - Assume payloads are typed by key - they're `unknown` until you narrow
 *   them yourself.
 * - Emit very high-frequency events (dozens+/sec) through the bus; prefer
 *   a store subscription for that kind of update volume.
 */
