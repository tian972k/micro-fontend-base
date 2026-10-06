/**
 * Cross-MFE communication patterns, using the real @repo/core API.
 *
 * Preference order:
 *   1. Shared stores      - app-wide state (user, theme, locale, your own)
 *   2. Typed event buses  - fire-and-forget messages, namespaced + versioned
 *   3. Mount props        - host -> MFE configuration
 */

import { createStore } from "zustand/vanilla";
import {
  createSingletonStore,
  createTypedEventBus,
  runtimeEvents,
  themeStore,
  userStore,
} from "@repo/core/shared";

// ---------------------------------------------------------------------------
// 1. Shared stores
// ---------------------------------------------------------------------------

/** Read the server-verified user the shell published. */
export function currentUserName(): string | null {
  return userStore.getState().user?.name ?? null;
}

/** React to theme changes from any MFE (remember to unsubscribe on unmount). */
export function followTheme(apply: (theme: string) => void): () => void {
  apply(themeStore.getState().theme);
  return themeStore.subscribe((state) => apply(state.theme));
}

/**
 * Your own shared store: one instance per page, even though each MFE bundles
 * its own copy of @repo/core (the instance lives on window.__CART_STORE__).
 */
interface CartState {
  items: { sku: string; qty: number }[];
  add(sku: string, qty?: number): void;
}

export const cartStore = createSingletonStore("__CART_STORE__", () =>
  createStore<CartState>()((set) => ({
    items: [],
    add: (sku, qty = 1) =>
      set((state) => ({ items: [...state.items, { sku, qty }] })),
  })),
);

// ---------------------------------------------------------------------------
// 2. Typed, versioned events
// ---------------------------------------------------------------------------

/** Platform events (navigation, auth, theme, locale, notifications). */
export function notifySaved() {
  runtimeEvents.emit("notification:show", {
    title: "Saved",
    variant: "success",
  });
}

/** Domain events owned by one team: give them their own namespace. */
type CheckoutEventsV1 = {
  "order:placed": { orderId: string; total: number };
  "order:failed": { reason: string };
};

export const checkoutEvents =
  createTypedEventBus<CheckoutEventsV1>("checkout:v1");

export function listenForOrders(onPlaced: (orderId: string) => void) {
  // Payload is fully typed: { orderId: string; total: number }
  return checkoutEvents.on("order:placed", ({ orderId }) => onPlaced(orderId));
}

/**
 * Breaking change (e.g. total becomes { amount, currency }): publish a v2
 * namespace and emit on both until every consumer has moved to v2.
 */
type CheckoutEventsV2 = {
  "order:placed": {
    orderId: string;
    total: { amount: number; currency: string };
  };
};
const checkoutEventsV2 = createTypedEventBus<CheckoutEventsV2>("checkout:v2");

export function placeOrder(orderId: string, amount: number, currency: string) {
  checkoutEventsV2.emit("order:placed", {
    orderId,
    total: { amount, currency },
  });
  checkoutEvents.emit("order:placed", { orderId, total: amount }); // legacy
}
