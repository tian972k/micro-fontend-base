import type { MicroApp, MicroAppProps } from "../types";

/**
 * Factory for creating SolidJS-based MFE entry modules
 */
export function createSolidMfeEntry(options: {
  AppComponent: any;
  appId: string;
  registry: any;
  render: (app: () => any, container: HTMLElement) => () => void;
}) {
  const { AppComponent, appId, registry, render } = options;

  const mount = (container: HTMLElement, props: MicroAppProps) => {
    const dispose = render(() => <AppComponent {...props} />, container);
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

  // Only register if not already registered (prevents HMR duplicates in dev)
  if (!registry.isRegistered(appId)) {
    registry.register(appId, microApp);
  }

  return { mount, unmount, default: microApp };
}
