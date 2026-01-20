/**
 * Storybook configuration for React components
 * Uses shared factory pattern for consistency
 */
import type { StorybookConfig } from "@storybook/react-vite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { createStorybookConfigFactory } from "../.storybook/shared.mts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const factory = createStorybookConfigFactory({
  dirname: __dirname,
  framework: "react",
});

const config: StorybookConfig = factory.createMainConfig({
  // Add React-specific overrides here if needed
  // stories: ['./custom-stories/**/*.stories.tsx'],
  // addons: [getAbsolutePath('@storybook/addon-docs')],
});

export default config;
