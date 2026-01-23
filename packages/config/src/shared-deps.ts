// Framework-agnostic shared libraries
export const baseShared = [
  "dayjs",
  "@repo/utils",
  "i18next",
  "i18next-browser-languagedetector",
  "i18next-http-backend",
];

// React-specific shared libraries
export const reactShared = [
  "react",
  "react-dom",
  "@repo/core",
  "@repo/ui",
  "react-i18next",
];

// Combined list for React apps (Shell, React MFE, Next.js)
export const federationShared = [...baseShared, ...reactShared];

// Non-React apps (SolidJS, Vue, Svelte) - only share base libs
export const nonReactShared = [
  ...baseShared,
  "@repo/core", // Core has some framework-agnostic utilities
];
