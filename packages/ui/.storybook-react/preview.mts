/**
 * Storybook preview configuration for React components
 * Uses shared factory pattern for consistency
 */
import type { Preview } from "@storybook/react-vite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { createStorybookConfigFactory } from "../.storybook/shared.mts";
import "../src/styles/globals.css";

const __dirname = dirname(fileURLToPath(import.meta.url));

const factory = createStorybookConfigFactory({
  dirname: __dirname,
  framework: "react",
});

const preview: Preview = factory.createPreviewConfig({
  // Add React-specific preview overrides here if needed
  // layout: 'fullscreen',
  // backgrounds: { default: 'light' },
});

export default preview;
