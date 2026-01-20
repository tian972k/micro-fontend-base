import { useStore } from "zustand";
import { userStore, type UserState } from "../common/user-store";

/**
 * React hook to consume the user store.
 * Usage: const user = useUserStore((state) => state.user);
 */
/* eslint-disable no-redeclare */
export function useUserStore(): UserState;
export function useUserStore<T>(selector: (state: UserState) => T): T;
export function useUserStore<T = UserState>(
  selector?: (state: UserState) => T,
): T {
  return useStore(
    userStore,
    selector ?? ((state: UserState) => state as unknown as T),
  );
}
/* eslint-enable no-redeclare */

// Re-export types and utilities
export {
  type UserState,
  type UserProfile,
  userActions,
} from "../common/user-store";
