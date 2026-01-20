import { createApp } from "vue";
import App from "./App.vue";
import { AppRegistry, createVueMfeEntry } from "@repo/core";
import { APP_IDS } from "@repo/config";
import "@repo/ui/globals.css";

const {
  mount,
  unmount,
  default: microApp,
} = createVueMfeEntry({
  AppComponent: App,
  appId: APP_IDS.VUE,
  registry: AppRegistry,
  createApp,
});

export { mount, unmount };
export default microApp;
