/**
 * @repo/core - Main Entry Point
 *
 * ⚠️ RECOMMENDATION: Use framework-specific entry points for better tree-shaking
 * and to avoid type conflicts:
 *
 * - @repo/core/vue    → Vue applications
 * - @repo/core/react  → React applications
 * - @repo/core/solid  → SolidJS applications
 * - @repo/core/svelte → Svelte applications
 * - @repo/core/shared → Framework-agnostic utilities only
 *
 * This main entry includes everything for backward compatibility,
 * but may cause type conflicts in non-React apps.
 */

// Re-export shared (framework-agnostic)
export * from "./shared";

// Logger and Performance Monitor
export { logger, mfeLogger, colors, createPrefixedLogger } from "./logger";
export type { LogLevel, LoggerOptions } from "./logger";
export { perfMonitor } from "./performance/monitor";

// React-specific exports (for backward compatibility)
export * from "./mfe/react/mfe-host";
export * from "./state/react/use-user-store";
export * from "./features/user-profile-feature";
export { MfeErrorBoundary, withErrorBoundary } from "./react/error-boundary";

// All MFE Factories
export * from "./mfe/factories";
