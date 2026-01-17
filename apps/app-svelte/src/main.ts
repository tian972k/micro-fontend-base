import { writable, get } from "svelte/store";
import { syncStore, type CounterState } from "@repo/core";
import { EVENT_KEYS } from "@repo/config";

// 1. Define Svelte store
export const count = writable(0);

// 2. Synchronize with other apps
syncStore<CounterState>(
  {
    getState: (): CounterState => ({ count: get(count) }),
    setState: (newState: CounterState) => {
      count.set(newState.count);
    },
    subscribe: (listener: (state: CounterState) => void) => {
      const unsubscribe = count.subscribe((val) => {
        listener({ count: val });
      });
      return unsubscribe;
    },
  },
  { key: EVENT_KEYS.APP_COUNTER },
);
