import React from "react";
import ReactDOM from "react-dom/client";
import MfeComponent from "./mfe-component";
import "@repo/ui/globals.css";
import { AppRegistry, type MicroApp, type MicroAppProps } from "@repo/core";
import { APP_IDS } from "@repo/config";

const mount = (container: HTMLElement, props: MicroAppProps) => {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <MfeComponent {...props} />
    </React.StrictMode>,
  );

  (container as any)._reactRoot = root;
};

const unmount = (container: HTMLElement) => {
  const root = (container as any)._reactRoot as ReactDOM.Root;
  if (root) {
    root.unmount();
    delete (container as any)._reactRoot;
  }
};

const microApp: MicroApp = { mount, unmount };

AppRegistry.register(APP_IDS.NEXTJS, microApp);

// Standalone mode: mount to #root when running independently (not as MFE)
const isStandalone = import.meta.env.VITE_STANDALONE === 'true';
const rootElement = document.getElementById("root");

if (isStandalone && rootElement) {
  mount(rootElement, { name: "app-nextjs" });
}

export { mount, unmount };
export default microApp;
