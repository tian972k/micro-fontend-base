export interface MicroAppConfig {
    theme?: "light" | "dark" | "system";
    locale?: string;
    [key: string]: any;
}

export interface MicroAppProps extends MicroAppConfig {
    auth?: {
        user: any;
        token: string;
    };
    eventBus?: any;
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
    [key: string]: any;
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
        __MFE_EVENT_BUS__?: any;
    }
}
