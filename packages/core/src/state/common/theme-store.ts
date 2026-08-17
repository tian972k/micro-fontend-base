import { createStore, type StoreApi } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";
import { createSingletonStore } from "../create-singleton-store";

export type Theme = "light" | "dark" | "system";

export interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// --- Store Creation ---

type ThemeStoreApi = StoreApi<ThemeState>;

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

// --- Exports ---

/**
 * The singleton vanilla Zustand store instance for theme.
 * Framework-agnostic - use with any framework.
 */
export const themeStore = createSingletonStore(
  "__THEME_STORE__",
  createThemeStore,
);

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
