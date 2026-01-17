import { reactive, watch } from "vue";
import { syncStore, type CounterState } from "@repo/core";
import { EVENT_KEYS } from "@repo/config";

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
