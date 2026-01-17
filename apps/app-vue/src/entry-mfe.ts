import { createApp } from "vue";
import App from "./App.vue";
import { AppRegistry, type MicroApp, type MicroAppProps } from "@repo/core";
import { APP_IDS } from "@repo/config";
import "@repo/ui/globals.css";

const mount = (container: HTMLElement, props: MicroAppProps) => {
  const app = createApp(App, props);
  app.mount(container);
  (container as HTMLElement & { _vueApp?: typeof app })._vueApp = app;
};

const unmount = (container: HTMLElement) => {
  const app = (container as any)._vueApp;
  if (app) {
    app.unmount();
    delete (container as any)._vueApp;
  }
};

const microApp: MicroApp = { mount, unmount };

AppRegistry.register(APP_IDS.VUE, microApp);

export { mount, unmount };
