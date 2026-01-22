import { createStore, type StoreApi } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";
import { globalEventBus } from "../../events/event-bus";
import { EVENT_KEYS } from "../../constants/keys";

export type Locale = "en" | "vi";

export interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

// --- Store Creation ---

type LocaleStoreApi = StoreApi<LocaleState>;

interface GlobalWindow extends Window {
  __LOCALE_STORE__?: LocaleStoreApi;
}

const createLocaleStore = (): LocaleStoreApi => {
  const store = createStore<LocaleState>()(
    persist(
      (set): LocaleState => ({
        locale: "en",
        setLocale: (locale: Locale): void => {
          console.log("[LocaleStore] setLocale called:", locale);
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
                getItem: (): null => null,
                setItem: (): void => {},
                removeItem: (): void => {},
              },
        ),
      },
    ),
  );

  // Listen for cross-MFE sync
  globalEventBus.on(EVENT_KEYS.LOCALE_CHANGE, (data: unknown) => {
    const payload = data as { locale: Locale };
    console.log("[LocaleStore] EventBus received:", payload);
    if (
      payload &&
      payload.locale &&
      payload.locale !== store.getState().locale
    ) {
      console.log("[LocaleStore] Updating from EventBus:", payload.locale);
      store.setState({ locale: payload.locale });
    }
  });

  return store;
};

// --- Singleton Logic ---

let store$: LocaleStoreApi;

if (typeof window !== "undefined") {
  const win = window as GlobalWindow;
  if (!win.__LOCALE_STORE__) {
    win.__LOCALE_STORE__ = createLocaleStore();
  }
  store$ = win.__LOCALE_STORE__;
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
