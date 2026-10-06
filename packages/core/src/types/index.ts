export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export enum MicroAppType {
  VUE = "vue",
  REACT = "react",
  SVELTE = "svelte",
  NEXTJS = "nextjs",
  SOLID = "solid",
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

export enum MfeStatus {
  IDLE = "idle",
  CHECKING = "checking",
  LOADING = "loading",
  MOUNTED = "mounted",
  ERROR = "error",
  MAINTENANCE = "maintenance",
}

export interface MfeManifest {
  "index.html": {
    file: string;
    css?: string[];
    assets?: string[];
  };
  [key: string]: unknown;
}

/**
 * The subset of AppRegistry the framework factories need. Typed
 * structurally so apps can pass `AppRegistry` or a test double.
 */
export interface MfeRegistry {
  register(name: string, app: MicroApp): void;
  isRegistered(name: string): boolean;
}

/** Entry shape of a Vite build manifest (manifest.json). */
export interface MfeManifestEntry {
  file: string;
  css?: string[];
  assets?: string[];
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
    /** Debug helpers exposed by the logger (dev tooling). */
    __MFE_DEBUG__?: Record<string, unknown>;
    /** Performance helpers exposed by the performance monitor. */
    __MFE_PERF__?: Record<string, unknown>;
    /** Present when the host app has initialised Sentry. */
    Sentry?: {
      captureException(error: unknown, context?: Record<string, unknown>): void;
    };
  }
}
