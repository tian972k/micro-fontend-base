import type { MicroApp, MicroAppProps } from "../types";

/**
 * Factory for creating Vue-based MFE entry modules
 */
export function createVueMfeEntry(options: {
  AppComponent: any;
  appId: string;
  registry: any;
  createApp: (component: any, props?: any) => any;
}) {
  const { AppComponent, appId, registry, createApp } = options;

  const mount = (container: HTMLElement, props: MicroAppProps) => {
    const app = createApp(AppComponent, props);
    app.mount(container);
    (container as any)._vueApp = app;
  };

  const unmount = (container: HTMLElement) => {
    const app = (container as any)._vueApp;
    if (app) {
      app.unmount();
      delete (container as any)._vueApp;
    }
  };

  const microApp: MicroApp = { mount, unmount };

  // Only register if not already registered (prevents HMR duplicates in dev)
  if (!registry.isRegistered(appId)) {
    registry.register(appId, microApp);
  }

  return { mount, unmount, default: microApp };
}
