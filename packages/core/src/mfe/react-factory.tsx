import React from "react";
import type { MicroApp, MicroAppProps } from "../types";

/**
 * Factory for creating React-based MFE entry modules
 * Handles React.createRoot mounting pattern
 */
export function createReactMfeEntry(options: {
  AppComponent: React.ComponentType<any>;
  appId: string;
  registry: any;
  StrictMode?: React.ComponentType<{ children: React.ReactNode }>;
  createRoot: (container: HTMLElement) => any;
}) {
  const { AppComponent, appId, registry, StrictMode, createRoot } = options;

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
    (container as any)._reactRoot = root;
  };

  const unmount = (container: HTMLElement) => {
    const root = (container as any)._reactRoot;
    if (root) {
      root.unmount();
      delete (container as any)._reactRoot;
    }
  };

  const microApp: MicroApp = { mount, unmount };
  
  // Only register if not already registered (prevents HMR duplicates in dev)
  if (!registry.isRegistered(appId)) {
    registry.register(appId, microApp);
  }

  return { mount, unmount, default: microApp };
}
