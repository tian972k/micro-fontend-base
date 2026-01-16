import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

// --- Types ---

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
}

export interface UserState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  // Actions
  login: (user: UserProfile) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

// --- Store Creation ---

const GLOBAL_STORE_SYMBOL = Symbol.for("@repo/core/user-store");
const initialState = {
  isAuthenticated: false,
  user: null,
};

// Factory function to create the store
const createUserStore = () =>
  createStore<UserState>((set) => ({
    ...initialState,
    login: (user) => set({ isAuthenticated: true, user }),
    logout: () => set({ isAuthenticated: false, user: null }),
    updateProfile: (profile) =>
      set((state) => ({
        user: state.user ? { ...state.user, ...profile } : null,
      })),
  }));

// --- Singleton Logic ---

let store$: ReturnType<typeof createUserStore>;

if (typeof window !== "undefined") {
  const win = window as any;
  if (!win[GLOBAL_STORE_SYMBOL]) {
    const newStore = createUserStore();
    // Use Object.defineProperty to hide it from iteration but keep it accessible via Symbol
    Object.defineProperty(win, GLOBAL_STORE_SYMBOL, {
      value: newStore,
      enumerable: false, // Hidden from for...in / Object.keys
      writable: false, // Read-only reference (store internal state is mutable)
      configurable: false,
    });
  }
  store$ = win[GLOBAL_STORE_SYMBOL];
} else {
  // Server-side: Create a fresh store per request context (conceptually)
  store$ = createUserStore();
}

// --- Exports ---

/**
 * The singleton vanilla Zustand store instance.
 * Useful for usage outside of React components or in other vanilla JS contexts.
 */
export const userStore = store$;

/**
 * React hook to consume the user store.
 * Usage: const user = useUserStore((state) => state.user);
 */
export function useUserStore<T>(selector: (state: UserState) => T): T {
  return useStore(userStore, selector);
}

// Re-export actions for backward compatibility if needed,
// OR prefer using the store's methods directly.
// The previous implementation exposed `userActions`.
// We can simulate that for easier migration:
export const userActions = {
  login: (user: UserProfile) => userStore.getState().login(user),
  logout: () => userStore.getState().logout(),
  updateProfile: (profile: Partial<UserProfile>) =>
    userStore.getState().updateProfile(profile),
};
