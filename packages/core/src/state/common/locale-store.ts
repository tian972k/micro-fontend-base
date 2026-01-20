import { createStore } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";
import { globalEventBus } from "../../events/event-bus";
import { EVENT_KEYS } from "../../constants/keys";

export type Locale = "en" | "vi";

export interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

// --- Store Creation ---

const GLOBAL_STORE_SYMBOL = Symbol.for("@repo/core/locale-store");

const createLocaleStore = () =>
  createStore<LocaleState>()(
    persist(
      (set) => ({
        locale: "en",
        setLocale: (locale) => {
          set({ locale });
          globalEventBus.emit(EVENT_KEYS.LOCALE_CHANGE, { locale });
        },
      }),
      {
        name: "mfe-locale",
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

let store$: ReturnType<typeof createLocaleStore>;

if (typeof window !== "undefined") {
  const win = window as unknown as Window & {
    [GLOBAL_STORE_SYMBOL]?: ReturnType<typeof createLocaleStore>;
  };
  if (!win[GLOBAL_STORE_SYMBOL]) {
    const newStore = createLocaleStore();
    Object.defineProperty(win, GLOBAL_STORE_SYMBOL, {
      value: newStore,
      enumerable: false,
      writable: false,
      configurable: false,
    });
  }
  store$ = win[GLOBAL_STORE_SYMBOL]!;
} else {
  store$ = createLocaleStore();
}

// --- Exports ---

/**
 * The singleton vanilla Zustand store instance for locale.
 * Framework-agnostic - use with any framework.
 */
export const localeStore = store$;

/**
 * Available locales with labels
 */
export const LOCALES: Record<Locale, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇺🇸" },
  vi: { label: "Tiếng Việt", flag: "🇻🇳" },
};
