import { useStore } from "zustand";
import { counterStore } from "../common/counter-store";
import type { CounterState } from "../../types";

/**
 * React hook for counter store
 * Usage: const count = useCounterStore((state) => state.count);
 */
export function useCounterStore<T = CounterState>(
  selector?: (state: CounterState) => T,
): T {
  return useStore(counterStore, selector ?? ((state) => state as unknown as T));
}

// Re-export utilities
export {
  incrementCounter,
  decrementCounter,
  setCounter,
} from "../common/counter-store";
