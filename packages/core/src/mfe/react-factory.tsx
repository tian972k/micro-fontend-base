import React from "react";
import type { MicroApp, MicroAppProps, MfeRegistry } from "../types";

/** The part of a React root (`react-dom/client`) this factory uses. */
export interface ReactRootLike {
  render(node: React.ReactNode): void;
  unmount(): void;
}

/**
 * Factory for creating React-based MFE entry modules
 * Handles React.createRoot mounting pattern
 */
export function createReactMfeEntry(options: {
  AppComponent: React.ComponentType<MicroAppProps>;
  appId: string;
  registry: MfeRegistry;
  StrictMode?: React.ComponentType<{ children: React.ReactNode }>;
  createRoot: (container: HTMLElement) => ReactRootLike;
}) {
  const { AppComponent, appId, registry, StrictMode, createRoot } = options;
  // One root per container; a WeakMap avoids tagging DOM nodes with
  // ad-hoc properties and lets roots be collected with their container.
  const roots = new WeakMap<HTMLElement, ReactRootLike>();

  const mount = (container: HTMLElement, props: MicroAppProps) => {
    const root = createRoot(container);
    const app = StrictMode ? (
      <StrictMode>
        <AppComponent {...props} />
      </StrictMode>
    ) : (
      <AppComponent {...props} />
    );
    root.render(app);
    roots.set(container, root);
  };

  const unmount = (container: HTMLElement) => {
    const root = roots.get(container);
    if (root) {
      root.unmount();
      roots.delete(container);
    }
  };

  const microApp: MicroApp = { mount, unmount };

  // Only register if not already registered (prevents HMR duplicates in dev)
  if (!registry.isRegistered(appId)) {
    registry.register(appId, microApp);
  }

  return { mount, unmount, default: microApp };
}
