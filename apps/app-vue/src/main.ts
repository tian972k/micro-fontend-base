import { createApp, reactive, watch } from "vue";
import { syncStore, type CounterState } from "@repo/core";
import { EVENT_KEYS } from "@repo/config";
import App from "./App.vue";
import "@repo/ui/globals.css";

// 1. Define reactive state
export const state = reactive({
  count: 0,
});

// 2. Synchronize with other apps
syncStore<CounterState>(
  {
    getState: (): CounterState => ({ count: state.count }),
    setState: (newState: CounterState) => {
      state.count = newState.count;
    },
    subscribe: (listener: (state: CounterState) => void) => {
      // Watch for changes in state
      const unwatch = watch(
        () => state.count,
        (newVal: number) => {
          listener({ count: newVal });
        },
      );
      return unwatch;
    },
  },
  { key: EVENT_KEYS.APP_COUNTER },
);

// Standalone mode: mount when running independently (not as MFE)
// Auto-mount if there's an #app element (dev/preview mode)
const appElement = document.getElementById("app");

if (appElement) {
  createApp(App).mount("#app");
}
