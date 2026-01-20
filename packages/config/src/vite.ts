// Build-time only exports - should NOT be imported by app runtime code
// Only import this in vite.config.mts files
export * from "./vite-plugins";
export * from "./vite-config-factory";
export * from "./env/ports";
export * from "./constants/apps";
export * from "./shared-deps";
