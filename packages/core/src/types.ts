export interface MicroAppProps {
    auth?: {
        user: any;
        token: string;
    };
    theme?: "light" | "dark" | "system";
    locale?: string;
    eventBus?: any;
    [key: string]: any; // Allow for extensibility
}

export interface MicroApp {
    mount: (container: HTMLElement, props: MicroAppProps) => void;
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
        MFE: Record<string, MicroApp>;
    }
}
