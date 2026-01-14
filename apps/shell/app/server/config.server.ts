// This file is strictly for server-side usage in Remix loaders
export function getAppConfig() {
    return {
        apps: {
            "app-a": process.env.MFE_APP_A_URL || "http://localhost:8001",
            "app-b": process.env.MFE_APP_B_URL || "http://localhost:8002",
        },
    };
}
