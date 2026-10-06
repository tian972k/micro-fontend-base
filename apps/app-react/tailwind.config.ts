import { createMfeTailwindConfig } from "@repo/config/tailwind.config";

// Utilities are scoped to [data-mfe="app-react"] so they can't leak into the
// shell or other MFEs (see createMfeTailwindConfig).
export default createMfeTailwindConfig("app-react", [
  "./src/**/*.{js,jsx,ts,tsx}",
  "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
]);
