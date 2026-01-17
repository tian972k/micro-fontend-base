export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface MicroAppConfig {
  theme?: "light" | "dark" | "system";
  locale?: string;
  [key: string]: unknown;
}

export interface MicroAppProps extends MicroAppConfig {
  auth?: {
    user: User | null;
    token: string;
  };
  eventBus?: unknown;
}

export interface CounterState {
  count: number;
}

/**
 * Standard contract for any Micro-Frontend integrated into the platform.
 */
export interface MicroApp {
  /**
   * Mount the micro-app into the provided DOM container.
   */
  mount: (container: HTMLElement, props: MicroAppProps) => void;
  /**
   * Unmount the micro-app from the container and perform cleanup.
   */
  unmount: (container: HTMLElement) => void;
}

export type HealthStatus = "available" | "maintenance" | "unavailable";

export interface HealthCheckResponse {
  status: HealthStatus;
  message?: string;
  version?: string;
}

export interface MfeManifest {
  "index.html": {
    file: string;
    css?: string[];
    assets?: string[];
  };
  [key: string]: unknown;
}

declare global {
  interface Window {
    /**
     * The global registry for loaded Micro-Frontends.
     */
    MFE: Record<string, MicroApp>;
    /**
     * Shared event bus instance across MFEs.
     */
    __MFE_EVENT_BUS__?: unknown;
  }
}
