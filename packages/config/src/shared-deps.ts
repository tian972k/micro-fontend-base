/**
 * Shared dependencies configuration for Module Federation
 * Each app loads its own i18n instance to avoid conflicts
 */

// Framework-agnostic shared libraries (avoid i18n libs - each app manages own)
export const baseShared = [
  "dayjs",
  "@repo/utils",
  // NOTE: i18next NOT shared - each app manages own instance
  // This prevents conflicts when multiple MFEs mount
];

// React-specific shared libraries
export const reactShared = [
  "react",
  "react-dom",
  "@repo/core",
  "@repo/ui",
  // NOTE: react-i18next NOT shared - use app's own i18next instance
];

// Combined list for React apps (Shell, React MFE, Next.js)
export const federationShared = [...baseShared, ...reactShared];

// Non-React apps (SolidJS, Vue, Svelte) - only share base libs
export const nonReactShared = [
  ...baseShared,
  "@repo/core", // Core has framework-agnostic utilities
];
