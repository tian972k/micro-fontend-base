import type { MicroApp } from "../types";

/**
 * Central registry for managing Micro-App instances.
 * Acts as a wrapper around the global `window.MFE` object.
 */
export class AppRegistry {
  /**
   * Registers a Micro-App instance globally.
   */
  static register(name: string, app: MicroApp): void {
    if (typeof window !== "undefined") {
      window.MFE = window.MFE || {};
      window.MFE[name] = app;
      console.debug(`[AppRegistry] MicroApp "${name}" registered.`);
    }
  }

  /**
   * Retrieves a registered Micro-App instance.
   */
  static get(name: string): MicroApp | undefined {
    if (typeof window !== "undefined") {
      return window.MFE?.[name];
    }
    return undefined;
  }

  /**
   * Checks if a Micro-App is already registered.
   */
  static isRegistered(name: string): boolean {
    return !!this.get(name);
  }
}
