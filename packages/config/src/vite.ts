// Build-time only exports - should NOT be imported by app runtime code
// Only import this in vite.config.mts files
export * from "./vite-plugins.js";
export * from "./vite-config-factory.js";
export * from "./env/ports.js";
export * from "./constants/apps.js";
export * from "./shared-deps.js";
