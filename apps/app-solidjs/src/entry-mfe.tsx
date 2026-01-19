import { render } from "solid-js/web";
import App from "./App";
import "./index.css";
import { AppRegistry, createSolidMfeEntry } from "@repo/core";
import { APP_IDS } from "@repo/config";

const { mount, unmount, default: microApp } = createSolidMfeEntry({
  AppComponent: App,
  appId: APP_IDS.SOLIDJS,
  registry: AppRegistry,
  render,
});

export { mount, unmount };
export default microApp;
