import type { MicroApp, MicroAppProps, MfeRegistry } from "../types";

/** A Svelte 4 component instance (the part this factory uses). */
export interface SvelteComponentLike {
  $destroy(): void;
}

/** A Svelte 4 component constructor. */
export type SvelteComponentConstructor = new (options: {
  target: HTMLElement;
  props?: MicroAppProps;
}) => SvelteComponentLike;

/**
 * Factory for creating Svelte-based MFE entry modules
 */
export function createSvelteMfeEntry(options: {
  AppComponent: SvelteComponentConstructor;
  appId: string;
  registry: MfeRegistry;
}) {
  const { AppComponent, appId, registry } = options;
  const instances = new WeakMap<HTMLElement, SvelteComponentLike>();

  const mount = (container: HTMLElement, props: MicroAppProps) => {
    const app = new AppComponent({
      target: container,
      props: {
        ...props,
      },
    });
    instances.set(container, app);
  };

  const unmount = (container: HTMLElement) => {
    const app = instances.get(container);
    if (app) {
      app.$destroy();
      instances.delete(container);
    }
  };

  const microApp: MicroApp = { mount, unmount };

  // Only register if not already registered (prevents HMR duplicates in dev)
  if (!registry.isRegistered(appId)) {
    registry.register(appId, microApp);
  }

  return { mount, unmount, default: microApp };
}
