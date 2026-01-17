import { useStore } from "zustand";
import { userStore, type UserState } from "../common/user-store";

/**
 * React hook to consume the user store.
 * Usage: const user = useUserStore((state) => state.user);
 */
export function useUserStore<T>(selector: (state: UserState) => T): T {
  return useStore(userStore, selector);
}
