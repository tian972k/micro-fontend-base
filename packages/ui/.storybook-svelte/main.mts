/**
 * Storybook configuration for Svelte components
 * Uses shared factory pattern for consistency
 */
import type { StorybookConfig } from "@storybook/svelte-vite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { createStorybookConfigFactory } from "../.storybook/shared.mts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const factory = createStorybookConfigFactory({
  dirname: __dirname,
  framework: "svelte",
});

const config: StorybookConfig = factory.createMainConfig({
  // Add Svelte-specific overrides here if needed
});

export default config;
