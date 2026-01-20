/**
 * @repo/core/react - React-Specific Core Module
 *
 * Use this entry point in React applications.
 * Includes shared utilities + React MFE factory & components.
 *
 * @example
 * import { createReactMfeEntry, MfeHost, useUserStore } from "@repo/core/react";
 */

// Re-export all shared utilities (framework-agnostic)
export * from "./shared";

// React MFE Components
export * from "./mfe/react/mfe-host";

// React Hooks
export * from "./state/react/use-user-store";
export * from "./state/react/use-theme-store";
export * from "./state/react/use-locale-store";
export * from "./state/react/use-counter-store";

// React-specific factory
export { createReactMfeEntry } from "./mfe/react-factory";

// React Shared Features
export * from "./features/user-profile-feature";
