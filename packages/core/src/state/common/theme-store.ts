import { createStore, type StoreApi } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

export interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// --- Store Creation ---

type ThemeStoreApi = StoreApi<ThemeState>;

interface GlobalWindow extends Window {
  __THEME_STORE__?: ThemeStoreApi;
}

const createThemeStore = (): ThemeStoreApi =>
  createStore<ThemeState>()(
    persist(
      (set) => ({
        theme: "system",
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: "mfe-theme",
        storage: createJSONStorage(() =>
          typeof window !== "undefined"
            ? localStorage
            : {
                getItem: () => null,
                setItem: () => {},
                removeItem: () => {},
              },
        ),
      },
    ),
  );

// --- Singleton Logic ---

let store$: ThemeStoreApi;

if (typeof window !== "undefined") {
  const win = window as GlobalWindow;
  if (!win.__THEME_STORE__) {
    win.__THEME_STORE__ = createThemeStore();
  }
  store$ = win.__THEME_STORE__;
} else {
  store$ = createThemeStore();
}

// --- Exports ---

/**
 * The singleton vanilla Zustand store instance for theme.
 * Framework-agnostic - use with any framework.
 */
export const themeStore = store$;

/**
 * Helper to get the resolved theme (handles "system")
 */
export function getResolvedTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  }
  return theme;
}
