import type { MicroApp, MicroAppProps } from "../types";

/**
 * Factory for creating SolidJS-based MFE entry modules
 *
 * Note: This factory does NOT use SolidJS JSX directly to avoid
 * requiring solid-js as a dependency of @repo/core.
 * The app provides the render function and component creator.
 */
export function createSolidMfeEntry(options: {
  appId: string;
  registry: any;
  /**
   * Function that creates and renders the app to a container.
   * Returns a dispose function to cleanup.
   *
   * Example:
   * ```ts
   * renderApp: (container, props) => render(() => <App {...props} />, container)
   * ```
   */
  renderApp: (container: HTMLElement, props: MicroAppProps) => () => void;
}) {
  const { appId, registry, renderApp } = options;

  const mount = (container: HTMLElement, props: MicroAppProps) => {
    const dispose = renderApp(container, props);
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
