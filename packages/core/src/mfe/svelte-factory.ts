import type { MicroApp, MicroAppProps } from "../types";

/**
 * Factory for creating Svelte-based MFE entry modules
 */
export function createSvelteMfeEntry(options: {
  AppComponent: any;
  appId: string;
  registry: any;
}) {
  const { AppComponent, appId, registry } = options;

  const mount = (container: HTMLElement, props: MicroAppProps) => {
    const app = new AppComponent({
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
  
  // Only register if not already registered (prevents HMR duplicates in dev)
  if (!registry.isRegistered(appId)) {
    registry.register(appId, microApp);
  }

  return { mount, unmount, default: microApp };
}
