import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@repo/ui/globals.css";
import { i18n, initI18n } from "@repo/core/react";
import { initReactI18next } from "react-i18next";

import dashboardEn from "./locales/en/dashboard.json";
import dashboardVi from "./locales/vi/dashboard.json";

// Initialize i18n for standalone mode
i18n.use(initReactI18next);
initI18n({
  en: { dashboard: dashboardEn },
  vi: { dashboard: dashboardVi },
});

// Standalone mode: mount when running independently (not as MFE)
// Auto-mount if there's a #root element (dev/preview mode)
const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App name="app-a" />
    </React.StrictMode>,
  );
}
