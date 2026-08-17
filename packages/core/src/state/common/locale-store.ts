import { createStore, type StoreApi } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";
import { createSingletonStore } from "../create-singleton-store";
import { syncStore } from "../sync-store";
import { EVENT_KEYS } from "../../constants/keys";

export type Locale = "en" | "vi";

export interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

// --- Store Creation ---

type LocaleStoreApi = StoreApi<LocaleState>;

const createLocaleStore = (): LocaleStoreApi => {
  const store = createStore<LocaleState>()(
    persist(
      (set): LocaleState => ({
        locale: "en",
        setLocale: (locale: Locale): void => {
          set({ locale });
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

  // Keep `locale` in sync with the same store in every other MFE via the
  // shared EventBus (both directions: broadcast local changes, and apply
  // changes broadcast by others). `setLocale` itself stays a plain
  // zustand action - it doesn't need to know about cross-MFE sync at all.
  syncStore(
    {
      getState: () => store.getState(),
      setState: (state) => store.setState(state),
      subscribe: (listener) => store.subscribe(listener),
    },
    { key: EVENT_KEYS.LOCALE_CHANGE },
  );

  return store;
};

// --- Exports ---

/**
 * The singleton vanilla Zustand store instance for locale.
 * Framework-agnostic - use with any framework.
 */
export const localeStore = createSingletonStore(
  "__LOCALE_STORE__",
  createLocaleStore,
);

/**
 * Available locales with labels
 */
export const LOCALES: Record<Locale, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇺🇸" },
  vi: { label: "Tiếng Việt", flag: "🇻🇳" },
};
