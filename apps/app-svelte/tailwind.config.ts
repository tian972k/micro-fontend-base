import { createMfeTailwindConfig } from "@repo/config/tailwind.config";

// Utilities are scoped to [data-mfe="app-svelte"] so they can't leak into the
// shell or other MFEs (see createMfeTailwindConfig).
export default createMfeTailwindConfig("app-svelte", [
  "./index.html",
  "./src/**/*.{svelte,js,ts}",
  "../../packages/ui/src/components/svelte/**/*.{svelte,ts}",
  "../../packages/ui/src/shared/**/*.ts",
]);
