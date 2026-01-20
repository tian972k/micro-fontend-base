import { createStore, type StoreApi } from "zustand/vanilla";
import { globalEventBus } from "../../events/event-bus";
import { EVENT_KEYS } from "../../constants/keys";
import type { CounterState } from "../../types";

// --- Store Creation ---

type CounterStoreApi = StoreApi<CounterState>;

interface GlobalWindow extends Window {
  __COUNTER_STORE__?: CounterStoreApi;
}

const createCounterStore = (): CounterStoreApi => {
  const store = createStore<CounterState>(() => ({
    count: 0,
  }));

  // Listen for cross-MFE sync
  globalEventBus.on(EVENT_KEYS.APP_COUNTER, (data: unknown) => {
    const newState = data as CounterState;
    if (newState && typeof newState.count === "number") {
      store.setState(newState);
    }
  });

  return store;
};

// --- Singleton Logic ---

let store$: CounterStoreApi;

if (typeof window !== "undefined") {
  const win = window as GlobalWindow;
  if (!win.__COUNTER_STORE__) {
    win.__COUNTER_STORE__ = createCounterStore();
  }
  store$ = win.__COUNTER_STORE__;
} else {
  store$ = createCounterStore();
}

// --- Exports ---

/**
 * The singleton vanilla Zustand store instance for counter.
 * Framework-agnostic - use with any framework.
 * Automatically syncs across all MFEs via EventBus.
 */
export const counterStore = store$;

/**
 * Increment counter and broadcast to all MFEs
 */
export function incrementCounter() {
  const newCount = counterStore.getState().count + 1;
  counterStore.setState({ count: newCount });
  globalEventBus.emit(EVENT_KEYS.APP_COUNTER, { count: newCount });
}

/**
 * Decrement counter and broadcast to all MFEs
 */
export function decrementCounter() {
  const newCount = counterStore.getState().count - 1;
  counterStore.setState({ count: newCount });
  globalEventBus.emit(EVENT_KEYS.APP_COUNTER, { count: newCount });
}

/**
 * Set counter value and broadcast to all MFEs
 */
export function setCounter(count: number) {
  counterStore.setState({ count });
  globalEventBus.emit(EVENT_KEYS.APP_COUNTER, { count });
}
