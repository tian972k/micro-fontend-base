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
console.log("[app-react] Initializing i18n...");
const initPromise = initI18n({
  en: { dashboard: dashboardEn },
  vi: { dashboard: dashboardVi },
})
  .then(() => console.log("[app-react] i18n initialized"))
  .catch((err) => console.error("[app-react] i18n init error:", err));

console.log("[app-react] Creating MFE Entry...");
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
console.log(
  "[app-react] MFE Entry Created. Registry status:",
  AppRegistry.isRegistered(APP_IDS.REACT),
);

const mount = async (container: HTMLElement, props: any) => {
  console.log("[app-react] Mount called");
  try {
    await initPromise;
    console.log("[app-react] i18n ready, mounting...");
    originalMount(container, props);
    console.log("[app-react] Mounted successfully");
  } catch (err) {
    console.error("[app-react] Mount error:", err);
    throw err;
  }
};

export { mount, unmount };
export default { ...microApp, mount };
