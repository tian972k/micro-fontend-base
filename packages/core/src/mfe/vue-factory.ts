import type { MicroApp, MicroAppProps, MfeRegistry } from "../types";

/** The part of a Vue app instance (`createApp(...)`) this factory uses. */
export interface VueAppLike {
  mount(container: HTMLElement): unknown;
  unmount(): void;
}

/**
 * Factory for creating Vue-based MFE entry modules
 */
export function createVueMfeEntry<TComponent>(options: {
  AppComponent: TComponent;
  appId: string;
  registry: MfeRegistry;
  createApp: (component: TComponent, props?: MicroAppProps) => VueAppLike;
}) {
  const { AppComponent, appId, registry, createApp } = options;
  const apps = new WeakMap<HTMLElement, VueAppLike>();

  const mount = (container: HTMLElement, props: MicroAppProps) => {
    const app = createApp(AppComponent, props);
    app.mount(container);
    apps.set(container, app);
  };

  const unmount = (container: HTMLElement) => {
    const app = apps.get(container);
    if (app) {
      app.unmount();
      apps.delete(container);
    }
  };

  const microApp: MicroApp = { mount, unmount };

  // Only register if not already registered (prevents HMR duplicates in dev)
  if (!registry.isRegistered(appId)) {
    registry.register(appId, microApp);
  }

  return { mount, unmount, default: microApp };
}
