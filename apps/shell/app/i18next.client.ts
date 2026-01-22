import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { localeStore } from "@repo/core/react";
import i18n from "./i18n";
import en from "./locales/en.json";
import vi from "./locales/vi.json";

// Get initial locale from shared store
const initialLocale = localeStore.getState().locale;

// Initialize i18next for the client
i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    ...i18n,
    lng: initialLocale, // Use locale from shared store
    resources: {
      en: { common: en },
      vi: { common: vi },
    },
    detection: {
      order: ["cookie", "navigator"],
      caches: ["cookie"],
    },
  });

// Subscribe to locale store changes from other MFEs
localeStore.subscribe((state) => {
  if (state.locale !== i18next.language) {
    i18next.changeLanguage(state.locale);
  }
});

// Also sync back: when i18next changes (e.g., from LanguageDetector), update store
i18next.on("languageChanged", (lng) => {
  const currentStoreLocale = localeStore.getState().locale;
  if (lng !== currentStoreLocale && (lng === "en" || lng === "vi")) {
    localeStore.getState().setLocale(lng);
  }
});

export default i18next;
