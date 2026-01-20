/**
 * Storybook preview configuration for Svelte components
 * Uses shared factory pattern for consistency
 */
import type { Preview } from "@storybook/svelte";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { createStorybookConfigFactory } from "../.storybook/shared.mts";
import "../src/styles/globals.css";

const __dirname = dirname(fileURLToPath(import.meta.url));

const factory = createStorybookConfigFactory({
  dirname: __dirname,
  framework: "svelte",
});

const preview: Preview = factory.createPreviewConfig({
  // Add Svelte-specific preview overrides here if needed
});

export default preview;
