import { useStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";

/**
 * Builds a typed React hook for a vanilla Zustand store, supporting both
 * "give me the whole state" and "give me a selected slice" call shapes:
 *
 *   const useCounterStore = createStoreHook(counterStore);
 *   const state = useCounterStore();
 *   const count = useCounterStore((state) => state.count);
 *
 * All of the common-store hooks (counter/locale/theme/user) previously
 * duplicated this exact overload + implementation with only the store name
 * changed - this factors that out into one place.
 */
export function createStoreHook<TState>(store: StoreApi<TState>) {
  /* eslint-disable no-redeclare */
  function useBoundStore(): TState;
  function useBoundStore<TSelected>(
    selector: (state: TState) => TSelected,
  ): TSelected;
  function useBoundStore<TSelected = TState>(
    selector?: (state: TState) => TSelected,
  ): TSelected {
    return useStore(
      store,
      selector ?? ((state: TState) => state as unknown as TSelected),
    );
  }
  /* eslint-enable no-redeclare */

  return useBoundStore;
}
