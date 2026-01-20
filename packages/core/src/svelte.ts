/**
 * @repo/core/svelte - Svelte-Specific Core Module
 *
 * Use this entry point in Svelte applications.
 * Includes shared utilities + Svelte MFE factory.
 *
 * @example
 * import { createSvelteMfeEntry, AppRegistry, syncStore } from "@repo/core/svelte";
 */

// Re-export all shared utilities (framework-agnostic)
export * from "./shared";

// Svelte-specific factory
export { createSvelteMfeEntry } from "./mfe/svelte-factory";
