import { createCookie } from "@remix-run/node";
import { RemixI18Next } from "remix-i18next/server";
import i18n from "./i18n";
import en from "./locales/en.json";
import vi from "./locales/vi.json";

export const i18nCookie = createCookie("i18n", {
  sameSite: "lax",
  path: "/",
});

export default new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
    cookie: i18nCookie,
  },
  i18next: {
    ...i18n,
    resources: {
      en: { common: en },
      vi: { common: vi },
    },
  },
});
