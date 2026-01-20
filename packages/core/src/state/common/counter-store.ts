import { createStore } from "zustand/vanilla";
import { globalEventBus } from "../../events/event-bus";
import { EVENT_KEYS } from "../../constants/keys";
import type { CounterState } from "../../types";

// --- Store Creation ---

const GLOBAL_STORE_SYMBOL = Symbol.for("@repo/core/counter-store");

const createCounterStore = () => {
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

let store$: ReturnType<typeof createCounterStore>;

if (typeof window !== "undefined") {
  const win = window as unknown as Window & {
    [GLOBAL_STORE_SYMBOL]?: ReturnType<typeof createCounterStore>;
  };
  if (!win[GLOBAL_STORE_SYMBOL]) {
    const newStore = createCounterStore();
    Object.defineProperty(win, GLOBAL_STORE_SYMBOL, {
      value: newStore,
      enumerable: false,
      writable: false,
      configurable: false,
    });
  }
  store$ = win[GLOBAL_STORE_SYMBOL]!;
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
