// Framework-agnostic shared libraries
export const baseShared = [
  "lodash",
  "dayjs",
  "@repo/utils", // Ensure non-React apps install this if they use it
];

// React-specific shared libraries (includes UI and Core which may depend on React)
export const reactShared = ["react", "react-dom", "@repo/core", "@repo/ui"];

// Combined list for React apps
export const federationShared = [...baseShared, ...reactShared];
