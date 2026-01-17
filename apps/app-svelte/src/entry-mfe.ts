import App from "./App.svelte";
import { AppRegistry, type MicroApp, type MicroAppProps } from "@repo/core";
import { APP_IDS } from "@repo/config";
import "@repo/ui/globals.css";

const mount = (container: HTMLElement, props: MicroAppProps) => {
  const app = new App({
    target: container,
    props: {
      ...props,
    },
  });
  (container as any)._svelteApp = app;
};

const unmount = (container: HTMLElement) => {
  const app = (container as any)._svelteApp;
  if (app) {
    app.$destroy();
    delete (container as any)._svelteApp;
  }
};

const microApp: MicroApp = { mount, unmount };

AppRegistry.register(APP_IDS.SVELTE, microApp);

export { mount, unmount };
