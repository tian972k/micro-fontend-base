import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@repo/ui/globals.css";
import { AppRegistry, createReactMfeEntry } from "@repo/core";
import { APP_IDS } from "@repo/config";

const {
  mount,
  unmount,
  default: microApp,
} = createReactMfeEntry({
  AppComponent: App,
  appId: APP_IDS.REACT,
  registry: AppRegistry,
  StrictMode: React.StrictMode,
  createRoot: ReactDOM.createRoot,
});

export { mount, unmount };
export default microApp;
