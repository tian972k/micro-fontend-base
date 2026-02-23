/**
 * Global runtime event contracts.
 * These types act as a public API boundary for MFEs.
 */

export type RuntimeEventMap = {
  "nav:navigate": {
    to: string;
    replace?: boolean;
    state?: Record<string, unknown>;
  };
  "user:login": { userId: string; token?: string };
  "user:logout": { reason?: string };
  "theme:set": { theme: "light" | "dark" | "system" };
  "locale:set": { locale: string };
  "notification:show": {
    title: string;
    message?: string;
    variant?: "info" | "success" | "warning" | "error";
  };
};

export type RuntimeEventName = keyof RuntimeEventMap;
export type RuntimeEventPayload<E extends RuntimeEventName> =
  RuntimeEventMap[E];
