import { createStore } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

export interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// --- Store Creation ---

const GLOBAL_STORE_SYMBOL = Symbol.for("@repo/core/theme-store");

const createThemeStore = () =>
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

let store$: ReturnType<typeof createThemeStore>;

if (typeof window !== "undefined") {
  const win = window as unknown as Window & {
    [GLOBAL_STORE_SYMBOL]?: ReturnType<typeof createThemeStore>;
  };
  if (!win[GLOBAL_STORE_SYMBOL]) {
    const newStore = createThemeStore();
    Object.defineProperty(win, GLOBAL_STORE_SYMBOL, {
      value: newStore,
      enumerable: false,
      writable: false,
      configurable: false,
    });
  }
  store$ = win[GLOBAL_STORE_SYMBOL]!;
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
