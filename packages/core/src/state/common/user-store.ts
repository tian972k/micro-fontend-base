import { createStore, type StoreApi } from "zustand/vanilla";
import { createSingletonStore } from "../create-singleton-store";

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

// --- Exports ---

/**
 * The singleton vanilla Zustand store instance.
 * Useful for usage outside of React components or in other vanilla JS contexts.
 */
export const userStore = createSingletonStore(
  "__USER_STORE__",
  createUserStore,
);

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
