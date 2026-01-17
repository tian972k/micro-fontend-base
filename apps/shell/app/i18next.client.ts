import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import i18n from "./i18n";
import en from "./locales/en.json";
import vi from "./locales/vi.json";

// Initialize i18next for the client
i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    ...i18n,
    resources: {
      en: { common: en },
      vi: { common: vi },
    },
    detection: {
      order: ["cookie", "navigator"],
      caches: ["cookie"],
    },
  });

export default i18next;
