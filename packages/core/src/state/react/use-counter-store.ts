import { useStore } from "zustand";
import { counterStore } from "../common/counter-store";
import type { CounterState } from "../../types";

/**
 * React hook for counter store
 * Usage: const count = useCounterStore((state) => state.count);
 */
/* eslint-disable no-redeclare */
export function useCounterStore(): CounterState;
export function useCounterStore<T>(selector: (state: CounterState) => T): T;
export function useCounterStore<T = CounterState>(
  selector?: (state: CounterState) => T,
): T {
  return useStore(
    counterStore,
    selector ?? ((state: CounterState) => state as unknown as T),
  );
}
/* eslint-enable no-redeclare */

// Re-export utilities
export {
  incrementCounter,
  decrementCounter,
  setCounter,
} from "../common/counter-store";
