import { create } from "zustand";
import { syncStore, type CounterState } from "@repo/core/react";
import { EVENT_KEYS } from "@repo/config";

interface ShellState {
  globalCount: number;
  increment: () => void;
  setGlobalCount: (count: number) => void;
}

export const useShellStore = create<ShellState>((set) => ({
  globalCount: 0,
  increment: () =>
    set((state: ShellState) => ({ globalCount: state.globalCount + 1 })),
  setGlobalCount: (count: number) => set({ globalCount: count }),
}));

// Initialize synchronization
if (typeof window !== "undefined") {
  syncStore<CounterState>(
    {
      getState: (): CounterState => ({
        count: useShellStore.getState().globalCount,
      }),
      setState: (state: CounterState) => {
        useShellStore.getState().setGlobalCount(state.count);
      },
      subscribe: (listener: (state: CounterState) => void) => {
        return useShellStore.subscribe((state: ShellState) =>
          listener({ count: state.globalCount }),
        );
      },
    },
    { key: EVENT_KEYS.APP_COUNTER },
  );
}
