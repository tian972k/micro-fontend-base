/**
 * Storybook configuration for Vue components
 * Uses shared factory pattern for consistency
 */
import type { StorybookConfig } from "@storybook/vue3-vite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { createStorybookConfigFactory } from "../.storybook/shared.mts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const factory = createStorybookConfigFactory({
  dirname: __dirname,
  framework: "vue",
});

const config: StorybookConfig = factory.createMainConfig({
  // Add Vue-specific overrides here if needed
});

export default config;
