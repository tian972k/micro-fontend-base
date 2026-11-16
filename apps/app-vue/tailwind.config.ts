import { createMfeTailwindConfig } from "@repo/config/tailwind.config";

// Utilities are scoped to [data-mfe="app-vue"] so they can't leak into the
// shell or other MFEs (see createMfeTailwindConfig).
export default createMfeTailwindConfig("app-vue", [
  "./index.html",
  "./src/**/*.{vue,js,ts}",
  "../../packages/ui/src/components/vue/**/*.{vue,ts}",
  "../../packages/ui/src/shared/**/*.ts",
]);
