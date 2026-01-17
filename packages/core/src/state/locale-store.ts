import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Locale = "en" | "vi";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "mfe-locale",
    },
  ),
);

// Available locales with labels
export const LOCALES: Record<Locale, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇺🇸" },
  vi: { label: "Tiếng Việt", flag: "🇻🇳" },
};
