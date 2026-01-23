import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@repo/ui/globals.css";
import {
  AppRegistry,
  createReactMfeEntry,
  i18n,
  initI18n,
} from "@repo/core/react";
import { APP_IDS } from "@repo/config";
import { initReactI18next } from "react-i18next";

import dashboardEn from "./locales/en/dashboard.json";
import dashboardVi from "./locales/vi/dashboard.json";

// Initialize i18n
i18n.use(initReactI18next);
const initPromise = initI18n({
  en: { dashboard: dashboardEn },
  vi: { dashboard: dashboardVi },
});

const {
  mount: originalMount,
  unmount,
  default: microApp,
} = createReactMfeEntry({
  AppComponent: App,
  appId: APP_IDS.REACT,
  registry: AppRegistry,
  StrictMode: React.StrictMode,
  createRoot: ReactDOM.createRoot,
});

const mount = async (container: HTMLElement, props: any) => {
  await initPromise;
  originalMount(container, props);
};

export { mount, unmount };
export default { ...microApp, mount };
