import i18next, { type Resource, type i18n as I18nInstance } from "i18next";
import { localeStore, type LocaleState } from "../state/common/locale-store";

import commonEn from "./locales/en/common.json";
import commonVi from "./locales/vi/common.json";

// Shared i18n configuration for all frameworks
export const i18nConfig = {
  supportedLngs: ["en", "vi"] as const,
  fallbackLng: "en" as const,
  defaultNS: "common",
  interpolation: {
    escapeValue: false, // React/Vue/Svelte already escape by default
  },
};

// Shared translations - can be extended by each MFE
export const sharedTranslations: Resource = {
  en: {
    common: commonEn,
  },
  vi: {
    common: commonVi,
  },
};

// Create a shared i18next instance (for non-React usage or direct access)
export const i18n: I18nInstance = i18next.createInstance();

// Initialize function - call this from each framework's entry
export async function initI18n(
  resources: Resource = {},
  defaultNamespace = "common",
): Promise<I18nInstance> {
  if (i18n.isInitialized) {
    // If already initialized, just add the new resources
    Object.keys(resources).forEach((lng) => {
      Object.keys(resources[lng]).forEach((ns) => {
        i18n.addResourceBundle(lng, ns, resources[lng][ns], true, true);
      });
    });
    return i18n;
  }

  // Get initial locale from store
  const currentLocale = localeStore.getState().locale;

  // Merge shared translations with app-specific resources
  const mergedResources: Resource = { ...sharedTranslations };

  // deeply merge or just standard merge? i18next handles resources structure
  // We'll simplisticly merge/add provided resources.
  // Actually, we should iterate provided resources and merge them in.
  Object.keys(resources).forEach((lng) => {
    if (!mergedResources[lng]) {
      mergedResources[lng] = {};
    }
    Object.assign(mergedResources[lng], resources[lng]);
  });

  await i18n.init({
    ...i18nConfig,
    lng: currentLocale,
    resources: mergedResources,
    defaultNS: defaultNamespace,
    fallbackNS: "common", // Always fallback to common
  });

  // Subscribe to locale store changes to sync i18n
  localeStore.subscribe((state: LocaleState) => {
    if (state.locale !== i18n.language) {
      i18n.changeLanguage(state.locale);
    }
  });

  return i18n;
}

// Helper to get current language
export function getCurrentLanguage(): string {
  return i18n.language || i18nConfig.fallbackLng;
}

// Helper to change language (triggers event for all frameworks)
export function changeLanguage(lng: string): Promise<void> {
  return i18n.changeLanguage(lng).then(() => {
    // Emit event for frameworks that don't auto-detect changes
    window.dispatchEvent(
      new CustomEvent("languagechange", { detail: { lng } }),
    );
  });
}

export type SupportedLocale = (typeof i18nConfig.supportedLngs)[number];
