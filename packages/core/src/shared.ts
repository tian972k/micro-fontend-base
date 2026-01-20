/**
 * @repo/core/shared - Framework-Agnostic Core Utilities
 *
 * This module contains utilities that work with ANY framework.
 * No React, Vue, Solid, or Svelte dependencies.
 */

// Event System
export * from "./events/event-bus";

// Types
export * from "./types";

// Constants
export * from "./constants/keys";

// State Management (framework-agnostic vanilla stores)
export * from "./state/sync-store";
export * from "./state/common/user-store";
export * from "./state/common/theme-store";
export * from "./state/common/locale-store";
export * from "./state/common/counter-store";

// Internationalization
export * from "./i18n";

// Logging
export * from "./logger";

// MFE Registry & Strategy
export * from "./mfe/registry";
export * from "./mfe/strategy";
