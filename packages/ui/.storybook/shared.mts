/**
 * Shared Storybook configuration utilities - Factory Pattern
 * Used across all framework-specific Storybook configs
 * 
 * @example
 * // In .storybook-react/main.mts
 * const factory = createStorybookConfigFactory({ dirname: __dirname, framework: 'react' });
 * export default factory.createMainConfig();
 */
import { dirname as pathDirname, join, resolve } from "path";
import { createRequire } from "node:module";
import type { UserConfig as ViteConfig, AliasOptions } from "vite";
import merge from "lodash/merge.js";
import cloneDeep from "lodash/cloneDeep.js";

const require = createRequire(import.meta.url);

// ============================================================================
// Types & Interfaces
// ============================================================================

export type Framework = "react" | "vue" | "solid" | "svelte";

export interface StorybookFactoryOptions {
  /** Directory path of the storybook config (use __dirname) */
  dirname: string;
  /** Framework type */
  framework: Framework;
}

export interface MainConfigOverrides {
  /** Additional stories patterns */
  stories?: string[];
  /** Additional addons */
  addons?: string[];
  /** Additional Vite aliases */
  viteAliases?: AliasOptions;
  /** Override docs config */
  docs?: Record<string, unknown>;
  /** Additional TypeScript options */
  typescript?: Record<string, unknown>;
}

export interface PreviewConfigOverrides {
  /** Override or extend parameters */
  parameters?: Record<string, unknown>;
  /** Override backgrounds */
  backgrounds?: {
    default?: string;
    values?: Array<{ name: string; value: string }>;
  };
  /** Override viewports */
  viewports?: Record<string, { name: string; styles: { width: string; height: string } }>;
  /** Override layout */
  layout?: "centered" | "fullscreen" | "padded";
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get absolute path for Storybook addons/packages
 */
export function getAbsolutePath(value: string): string {
  return pathDirname(require.resolve(join(value, "package.json")));
}

// ============================================================================
// Default Configurations
// ============================================================================

const DEFAULT_ADDONS = [
  "@storybook/addon-links",
  "@storybook/addon-a11y",
];

const DEFAULT_BACKGROUNDS = {
  default: "dark",
  values: [
    { name: "dark", value: "#0F172A" },
    { name: "light", value: "#F8FAFC" },
  ],
};

const DEFAULT_VIEWPORTS = {
  mobile: { name: "Mobile (iPhone 14)", styles: { width: "390px", height: "844px" } },
  tablet: { name: "Tablet (iPad Pro)", styles: { width: "1024px", height: "1366px" } },
  desktop: { name: "Desktop (1440p)", styles: { width: "1440px", height: "900px" } },
};

const DEFAULT_PARAMETERS = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/i,
    },
    expanded: true,
    sort: "requiredFirst",
  },
  backgrounds: DEFAULT_BACKGROUNDS,
  viewport: {
    viewports: DEFAULT_VIEWPORTS,
    defaultViewport: "responsive",
  },
  layout: "centered" as const,
};

const FRAMEWORK_CONFIG: Record<Framework, {
  name: string;
  typescript?: Record<string, unknown>;
}> = {
  react: {
    name: "@storybook/react-vite",
    typescript: { reactDocgen: "react-docgen-typescript" },
  },
  vue: {
    name: "@storybook/vue3-vite",
  },
  solid: {
    name: "storybook-solidjs-vite",
  },
  svelte: {
    name: "@storybook/svelte-vite",
  },
};

// ============================================================================
// Factory Class
// ============================================================================

export class StorybookConfigFactory {
  private readonly dirname: string;
  private readonly framework: Framework;

  constructor(options: StorybookFactoryOptions) {
    this.dirname = options.dirname;
    this.framework = options.framework;
  }

  /**
   * Create main.mts configuration
   */
  createMainConfig(overrides: MainConfigOverrides = {}) {
    const frameworkConfig = FRAMEWORK_CONFIG[this.framework];
    const frameworkName = frameworkConfig.name;
    const isCustomFramework = this.framework === "solid";

    const baseStories = [
      `../src/components/${this.framework}/**/*.mdx`,
      `../src/components/${this.framework}/**/*.stories.@(js|jsx|mjs|ts|tsx)`,
    ];

    const baseAddons = DEFAULT_ADDONS.map(getAbsolutePath);

    const config = {
      stories: [...baseStories, ...(overrides.stories || [])],
      addons: [...baseAddons, ...(overrides.addons || [])],
      framework: {
        name: isCustomFramework ? (frameworkName as "storybook-solidjs-vite") : getAbsolutePath(frameworkName),
        options: {},
      },
      docs: overrides.docs || {},
      ...(frameworkConfig.typescript && {
        typescript: { ...frameworkConfig.typescript, ...overrides.typescript },
      }),
      viteFinal: this.createViteFinal(overrides.viteAliases),
    };

    return config;
  }

  /**
   * Create preview.mts configuration
   */
  createPreviewConfig(overrides: PreviewConfigOverrides = {}) {
    let parameters = cloneDeep(DEFAULT_PARAMETERS);

    if (overrides.backgrounds) {
      parameters.backgrounds = merge({}, DEFAULT_BACKGROUNDS, overrides.backgrounds);
    }

    if (overrides.viewports) {
      parameters.viewport = {
        viewports: merge({}, DEFAULT_VIEWPORTS, overrides.viewports),
        defaultViewport: "responsive",
      };
    }

    if (overrides.layout) {
      parameters.layout = overrides.layout;
    }

    if (overrides.parameters) {
      parameters = merge(parameters, overrides.parameters);
    }

    return { parameters };
  }

  /**
   * Create viteFinal function with aliases
   */
  private createViteFinal(additionalAliases?: AliasOptions) {
    const dirname = this.dirname;
    return async (config: ViteConfig): Promise<ViteConfig> => {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        "#variants": resolve(dirname, "../src/shared/variants"),
        "#shared": resolve(dirname, "../src/shared"),
        "#components": resolve(dirname, "../src/components"),
        ...additionalAliases,
      };
      return config;
    };
  }
}

// ============================================================================
// Factory Function (Convenience)
// ============================================================================

/**
 * Create a Storybook configuration factory
 * 
 * @example
 * const factory = createStorybookConfigFactory({ dirname: __dirname, framework: 'react' });
 * 
 * // main.mts
 * export default factory.createMainConfig();
 * 
 * // preview.mts  
 * export default { parameters: factory.createPreviewConfig().parameters };
 */
export function createStorybookConfigFactory(options: StorybookFactoryOptions): StorybookConfigFactory {
  return new StorybookConfigFactory(options);
}

// ============================================================================
// Legacy Exports (Backward Compatibility)
// ============================================================================

/** @deprecated Use createStorybookConfigFactory instead */
export const commonAddons = DEFAULT_ADDONS.map(getAbsolutePath);

/** @deprecated Use createStorybookConfigFactory instead */
export const commonParameters = DEFAULT_PARAMETERS;
