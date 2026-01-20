import { createStore, type StoreApi } from "zustand/vanilla";

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

type UserStoreApi = StoreApi<UserState>;

interface GlobalWindow extends Window {
  __USER_STORE__?: UserStoreApi;
}

const initialState = {
  isAuthenticated: false,
  user: null,
};

// Factory function to create the store
const createUserStore = (): UserStoreApi =>
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

let store$: UserStoreApi;

if (typeof window !== "undefined") {
  const win = window as GlobalWindow;
  if (!win.__USER_STORE__) {
    win.__USER_STORE__ = createUserStore();
  }
  store$ = win.__USER_STORE__;
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
