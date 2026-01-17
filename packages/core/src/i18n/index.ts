import i18next from "i18next";

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
export const sharedTranslations = {
  en: {
    common: {
      increment: "Increment",
      decrement: "Decrement",
      count: "Count",
      loading: "Loading...",
      error: "Error",
      retry: "Retry",
    },
  },
  vi: {
    common: {
      increment: "Tăng",
      decrement: "Giảm",
      count: "Số đếm",
      loading: "Đang tải...",
      error: "Lỗi",
      retry: "Thử lại",
    },
  },
};

// Create a shared i18next instance (for non-React usage or direct access)
export const i18n = i18next.createInstance();

// Initialize function - call this from each framework's entry
export async function initI18n(
  resources?: Record<string, Record<string, unknown>>,
  lng?: string,
) {
  if (i18n.isInitialized) return i18n;

  await i18n.init({
    ...i18nConfig,
    lng: lng || i18nConfig.fallbackLng,
    resources: resources || sharedTranslations,
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
