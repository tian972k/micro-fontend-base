import type { MicroApp } from "./types";

export interface MicroAppEntry {
    name: string;
    url: string;
}

export class AppRegistry {
    private static apps: Record<string, string> = {
        // Default fallback or read from initial injection
    };

    static register(name: string, app: MicroApp) {
        if (typeof window !== "undefined") {
            window.MFE = window.MFE || {};
            window.MFE[name] = app;
            console.log(`[AppRegistry] MicroApp "${name}" registered successfully.`);
        }
    }
}
