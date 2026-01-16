import React from "react";
import ReactDOM from "react-dom/client";
import { MfeComponent } from "./mfe-component";
import "@repo/ui/globals.css";
import { AppRegistry, type MicroApp, type MicroAppProps } from "@repo/core";

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

AppRegistry.register("app-b", microApp);

export { mount, unmount };
