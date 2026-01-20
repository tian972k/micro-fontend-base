import { useStore } from "zustand";
import { localeStore, type LocaleState } from "../common/locale-store";

/**
 * React hook for locale store
 * Usage:
 *   const locale = useLocaleStore((state) => state.locale);
 *   // OR for all state:
 *   const { locale, setLocale } = useLocaleStore();
 */
export function useLocaleStore<T = LocaleState>(
  selector?: (state: LocaleState) => T,
): T {
  return useStore(localeStore, selector ?? ((state) => state as unknown as T));
}

// Re-export types and utilities
export { type Locale, type LocaleState, LOCALES } from "../common/locale-store";
