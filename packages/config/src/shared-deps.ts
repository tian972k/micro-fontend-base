// Framework-agnostic shared libraries
export const baseShared = ["dayjs", "@repo/utils"];

// React-specific shared libraries
export const reactShared = ["react", "react-dom", "@repo/core", "@repo/ui"];

// Combined list for React apps (Shell, React MFE, Next.js)
export const federationShared = [...baseShared, ...reactShared];

// Non-React apps (SolidJS, Vue, Svelte) - only share base libs
export const nonReactShared = [
  ...baseShared,
  "@repo/core", // Core has some framework-agnostic utilities
];
