import { useStore } from "zustand";
import { themeStore, type ThemeState } from "../common/theme-store";

/**
 * React hook for theme store
 * Usage:
 *   const theme = useThemeStore((state) => state.theme);
 *   // OR for all state:
 *   const { theme, setTheme } = useThemeStore();
 */
/* eslint-disable no-redeclare */
export function useThemeStore(): ThemeState;
export function useThemeStore<T>(selector: (state: ThemeState) => T): T;
export function useThemeStore<T = ThemeState>(
  selector?: (state: ThemeState) => T,
): T {
  return useStore(
    themeStore,
    selector ?? ((state: ThemeState) => state as unknown as T),
  );
}
/* eslint-enable no-redeclare */

// Re-export types and utilities
export {
  type Theme,
  type ThemeState,
  getResolvedTheme,
} from "../common/theme-store";
