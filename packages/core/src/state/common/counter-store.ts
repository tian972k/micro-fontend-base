import { createStore, type StoreApi } from "zustand/vanilla";
import { createSingletonStore } from "../create-singleton-store";
import { syncStore } from "../sync-store";
import { EVENT_KEYS } from "../../constants/keys";
import type { CounterState } from "../../types";

// --- Store Creation ---

type CounterStoreApi = StoreApi<CounterState>;

const createCounterStore = (): CounterStoreApi => {
  const store = createStore<CounterState>(() => ({
    count: 0,
  }));

  // Keep this store in sync with the same store in every other MFE via
  // the shared EventBus (both directions: broadcast local changes, and
  // apply changes broadcast by others).
  syncStore(
    {
      getState: () => store.getState(),
      setState: (state) => store.setState(state),
      subscribe: (listener) => store.subscribe(listener),
    },
    { key: EVENT_KEYS.APP_COUNTER },
  );

  return store;
};

// --- Exports ---

/**
 * The singleton vanilla Zustand store instance for counter.
 * Framework-agnostic - use with any framework.
 * Automatically syncs across all MFEs via EventBus.
 */
export const counterStore = createSingletonStore(
  "__COUNTER_STORE__",
  createCounterStore,
);

/**
 * Increment counter and broadcast to all MFEs
 */
export function incrementCounter() {
  counterStore.setState({ count: counterStore.getState().count + 1 });
}

/**
 * Decrement counter and broadcast to all MFEs
 */
export function decrementCounter() {
  counterStore.setState({ count: counterStore.getState().count - 1 });
}

/**
 * Set counter value and broadcast to all MFEs
 */
export function setCounter(count: number) {
  counterStore.setState({ count });
}
