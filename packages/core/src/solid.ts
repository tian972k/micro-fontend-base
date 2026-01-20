/**
 * @repo/core/solid - SolidJS-Specific Core Module
 *
 * Use this entry point in SolidJS applications.
 * Includes shared utilities + SolidJS MFE factory.
 *
 * @example
 * import { createSolidMfeEntry, AppRegistry, syncStore } from "@repo/core/solid";
 */

// Re-export all shared utilities (framework-agnostic)
export * from "./shared";

// SolidJS-specific factory
export { createSolidMfeEntry } from "./mfe/solid-factory";
