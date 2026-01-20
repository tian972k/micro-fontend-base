import React from "react";
import ReactDOM from "react-dom/client";
import MfeComponent from "./mfe-component";
import "@repo/ui/globals.css";
import { AppRegistry, createReactMfeEntry } from "@repo/core";
import { APP_IDS } from "@repo/config";

const {
  mount,
  unmount,
  default: microApp,
} = createReactMfeEntry({
  AppComponent: MfeComponent,
  appId: APP_IDS.NEXTJS,
  registry: AppRegistry,
  StrictMode: React.StrictMode,
  createRoot: ReactDOM.createRoot,
});

// Standalone mode: mount to #root when running independently (not as MFE)
// Auto-mount if there's a #root element (dev/preview mode)
const rootElement = document.getElementById("root");

if (rootElement) {
  mount(rootElement, { name: "app-nextjs" });
}

export { mount, unmount };
export default microApp;
