import { writable, get } from "svelte/store";
import { syncStore, type CounterState } from "@repo/core";
import { EVENT_KEYS } from "@repo/config";
import App from "./App.svelte";
import "@repo/ui/globals.css";

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

// Standalone mode: mount when running independently (not as MFE)
const isStandalone = import.meta.env.VITE_STANDALONE === 'true';
const target = document.getElementById("app");

if (isStandalone && target) {
  new App({ target });
}
