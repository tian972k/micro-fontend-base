import { useStore } from "zustand";
import { localeStore, type LocaleState } from "../common/locale-store";

/**
 * React hook for locale store
 * Usage:
 *   const locale = useLocaleStore((state) => state.locale);
 *   // OR for all state:
 *   const { locale, setLocale } = useLocaleStore();
 */
/* eslint-disable no-redeclare */
export function useLocaleStore(): LocaleState;
export function useLocaleStore<T>(selector: (state: LocaleState) => T): T;
export function useLocaleStore<T = LocaleState>(
  selector?: (state: LocaleState) => T,
): T {
  return useStore(
    localeStore,
    selector ?? ((state: LocaleState) => state as unknown as T),
  );
}
/* eslint-enable no-redeclare */

// Re-export types and utilities
export { type Locale, type LocaleState, LOCALES } from "../common/locale-store";
