/**
 * @repo/core/vue - Vue-Specific Core Module
 *
 * Use this entry point in Vue applications.
 * Includes shared utilities + Vue MFE factory.
 *
 * @example
 * import { createVueMfeEntry, AppRegistry, syncStore } from "@repo/core/vue";
 */

// Re-export all shared utilities (framework-agnostic)
export * from "./shared";

// Vue-specific factory
export { createVueMfeEntry } from "./mfe/vue-factory";
