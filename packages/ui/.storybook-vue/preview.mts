/**
 * Storybook preview configuration for Vue components
 * Uses shared factory pattern for consistency
 */
import type { Preview } from "@storybook/vue3";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { createStorybookConfigFactory } from "../.storybook/shared.mts";
import "../src/styles/globals.css";

const __dirname = dirname(fileURLToPath(import.meta.url));

const factory = createStorybookConfigFactory({
  dirname: __dirname,
  framework: "vue",
});

const preview: Preview = factory.createPreviewConfig({
  // Add Vue-specific preview overrides here if needed
});

export default preview;
