import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { localeStore } from "@repo/core/react";
import i18n from "./i18n";
import en from "./locales/en.json";
import vi from "./locales/vi.json";

// Start in the language the server rendered (<html lang>, from the `i18n`
// cookie) so hydration matches and a reload keeps the user's choice; fall
// back to the shared store. Then align the store with it.
function getInitialLocale(): "en" | "vi" {
  const rendered = document.documentElement.lang;
  if (rendered === "en" || rendered === "vi") return rendered;
  return localeStore.getState().locale;
}
const initialLocale = getInitialLocale();
if (localeStore.getState().locale !== initialLocale) {
  localeStore.getState().setLocale(initialLocale);
}

// Fix for Module Federation: i18next might be imported as a Module Namespace
const i18nInstance = (i18next as any).default || i18next;

// Initialize i18next for the client
i18nInstance
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
      // The language is persisted below in the cookie the server reads.
      caches: [],
    },
  });

// Subscribe to locale store changes from other MFEs
localeStore.subscribe((state) => {
  if (state.locale !== i18nInstance.language) {
    i18nInstance.changeLanguage(state.locale);
  }
});

/**
 * Remember the language in the `i18n` cookie that i18next.server.ts reads,
 * so the next server render uses it. Remix cookies hold base64-encoded
 * JSON, hence the encoding.
 */
function persistLocaleCookie(lng: string) {
  const value = encodeURIComponent(btoa(JSON.stringify(lng)));
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `i18n=${value}; Path=/; Max-Age=${oneYear}; SameSite=Lax`;
}

// Also sync back: when i18next changes (e.g., from LanguageDetector), update store
i18nInstance.on("languageChanged", (lng: string) => {
  if (lng === "en" || lng === "vi") persistLocaleCookie(lng);
  const currentStoreLocale = localeStore.getState().locale;
  if (lng !== currentStoreLocale && (lng === "en" || lng === "vi")) {
    localeStore.getState().setLocale(lng);
  }
});

export default i18nInstance;
