import { render } from "solid-js/web";
import App from "./App";
import "@repo/ui/globals.css";
import { AppRegistry, type MicroApp, type MicroAppProps } from "@repo/core";
import { APP_IDS } from "@repo/config";

const mount = (container: HTMLElement, props: MicroAppProps) => {
  // @ts-ignore - SolidJS JSX types might conflict with React types in shared environment
  const dispose = render(() => <App {...props} />, container);
  (container as any)._solidDispose = dispose;
};

const unmount = (container: HTMLElement) => {
  const dispose = (container as any)._solidDispose;
  if (dispose) {
    dispose();
    delete (container as any)._solidDispose;
  }
};

const microApp: MicroApp = { mount, unmount };

AppRegistry.register(APP_IDS.SOLIDJS, microApp);

export { mount, unmount };
export default microApp;
