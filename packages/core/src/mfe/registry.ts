import type { MicroApp } from "../types";

/**
 * Name of the DOM event dispatched on `window` whenever a Micro-App
 * finishes registering. Consumers (e.g. MfeHost) can listen for this
 * instead of polling `window.MFE` on an interval.
 */
export const MFE_REGISTERED_EVENT = "mfe:registered";

export interface MfeRegisteredEventDetail {
  name: string;
}

/**
 * Central registry for managing Micro-App instances.
 * Acts as a wrapper around the global `window.MFE` object.
 */
export class AppRegistry {
  /**
   * Registers a Micro-App instance globally.
   * @warn If an app with the same name is already registered, it will be overwritten.
   */
  static register(name: string, app: MicroApp): void {
    if (typeof window !== "undefined") {
      window.MFE = window.MFE || {};

      // Warn if overwriting an existing registration
      if (window.MFE[name]) {
        console.warn(
          `[AppRegistry] ⚠️ WARNING: MicroApp "${name}" is already registered and will be OVERWRITTEN.\n` +
            `This may cause unexpected behavior. Ensure each app has a unique APP_ID in @repo/config.`,
        );
      }

      window.MFE[name] = app;
      console.debug(`[AppRegistry] MicroApp "${name}" registered.`);

      // Notify any listeners (e.g. MfeHost) that this app is ready,
      // so they don't have to poll window.MFE on an interval.
      window.dispatchEvent(
        new CustomEvent<MfeRegisteredEventDetail>(MFE_REGISTERED_EVENT, {
          detail: { name },
        }),
      );
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
