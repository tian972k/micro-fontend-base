// Runtime exports - safe for browser bundles
export * from "./env/ports";
export * from "./constants/keys";
export * from "./constants/apps";
export * from "./constants/routes";
export {
  baseShared,
  reactShared,
  federationShared,
  nonReactShared,
} from "./shared-deps";

// Build-time exports are in separate entry point
// Import from "@repo/config/vite" in vite.config files
