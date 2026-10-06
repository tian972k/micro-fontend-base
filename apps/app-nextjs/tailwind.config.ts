import { createMfeTailwindConfig } from "@repo/config/tailwind.config";

// Utilities are scoped to [data-mfe="app-nextjs"] so they can't leak into the
// shell or other MFEs (see createMfeTailwindConfig).
export default createMfeTailwindConfig("app-nextjs", [
  "./src/**/*.{js,ts,jsx,tsx,mdx}",
  "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
]);
