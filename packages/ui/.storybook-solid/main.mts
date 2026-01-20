/**
 * Storybook configuration for SolidJS components
 * Uses shared factory pattern for consistency
 */
import { dirname } from "path";
import { fileURLToPath } from "url";
import { createStorybookConfigFactory } from "../.storybook/shared.mts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const factory = createStorybookConfigFactory({
  dirname: __dirname,
  framework: "solid",
});

const config = factory.createMainConfig({
  // Add SolidJS-specific overrides here if needed
});

export default config;
