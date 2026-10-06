import { createMfeTailwindConfig } from "@repo/config/tailwind.config";

// Utilities are scoped to [data-mfe="app-solidjs"] so they can't leak into the
// shell or other MFEs (see createMfeTailwindConfig).
export default createMfeTailwindConfig("app-solidjs", [
  "./src/**/*.{js,jsx,ts,tsx}",
  "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
]);
