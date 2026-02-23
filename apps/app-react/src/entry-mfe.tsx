import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@repo/ui/globals.css";
import {
  AppRegistry,
  createReactMfeEntry,
  MfeErrorBoundary,
} from "@repo/core/react";
import { mfeLogger } from "@repo/core/logger";
import { perfMonitor } from "@repo/core/performance/monitor";
import { APP_IDS } from "@repo/config";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

import dashboardEn from "./locales/en/dashboard.json";
import dashboardVi from "./locales/vi/dashboard.json";

// Initialize i18n - isolated per app to avoid conflicts
i18next
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(
    {
      fallbackLng: "en",
      ns: ["dashboard"],
      defaultNS: "dashboard",
      resources: {
        en: { dashboard: dashboardEn },
        vi: { dashboard: dashboardVi },
      },
      interpolation: {
        escapeValue: false,
      },
    },
    (err) => {
      if (err) mfeLogger.errorWithStack("app-react:i18n", err);
      else mfeLogger.i18n("initialized", i18next.language);
    },
  );

// Wrap App with Error Boundary
const AppWithErrorBoundary = () => (
  <MfeErrorBoundary mfeId={APP_IDS.REACT}>
    <App />
  </MfeErrorBoundary>
);

const {
  mount: baseMoun,
  unmount: baseUnmount,
  default: microApp,
} = createReactMfeEntry({
  AppComponent: AppWithErrorBoundary,
  appId: APP_IDS.REACT,
  registry: AppRegistry,
  StrictMode: React.StrictMode,
  createRoot: ReactDOM.createRoot,
});

// Wrap mount to ensure i18n is ready + track performance
const mount = async (container: HTMLElement, props: any) => {
  perfMonitor.startMfeLoad(APP_IDS.REACT);
  mfeLogger.lifecycle(APP_IDS.REACT, "mount", props);

  try {
    // Ensure i18n namespace is loaded
    if (!i18next.hasResourceBundle(i18next.language, "dashboard")) {
      await i18next.loadNamespaces("dashboard");
    }

    await perfMonitor.measureMount(APP_IDS.REACT, () => {
      baseMoun(container, props);
    });

    perfMonitor.endMfeLoad(APP_IDS.REACT);
  } catch (error) {
    mfeLogger.lifecycle(APP_IDS.REACT, "error", error);
    throw error;
  }
};

const unmount = (container: HTMLElement) => {
  mfeLogger.lifecycle(APP_IDS.REACT, "unmount");
  return baseUnmount(container);
};

export { mount, unmount };
export default microApp;
