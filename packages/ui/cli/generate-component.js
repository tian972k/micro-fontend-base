#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const FRAMEWORKS = {
  react: {
    name: "React",
    path: "components/react",
    ext: "tsx",
  },
  vue: {
    name: "Vue",
    path: "components/vue",
    ext: "vue",
  },
  svelte: {
    name: "Svelte",
    path: "components/svelte",
    ext: "svelte",
  },
};

const UI_PACKAGE_PATH = path.join(__dirname, "..", "src");
const UI_INDEX_PATH = path.join(__dirname, "..", "src", "index.ts");

const toPascalCase = (str) => {
  return str
    .replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase())
    .replace(/-/g, "");
};

const toKebabCase = (str) => {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
};

// Templates
const getReactTemplate = (pascalName, componentName) => `import * as React from "react"
import { cn } from "@repo/utils"

export interface ${pascalName}Props extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The variant of the component
   */
  variant?: "default" | "outline"
}

const ${pascalName} = React.forwardRef<HTMLDivElement, ${pascalName}Props>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn("${componentName}", className)}
      data-variant={variant}
      {...props}
    />
  )
)
${pascalName}.displayName = "${pascalName}"

export { ${pascalName} }
`;

const getReactStoryTemplate = (pascalName, componentName) => `import type { Meta, StoryObj } from "@storybook/react";
import { ${pascalName} } from "./${componentName}";

const meta: Meta<typeof ${pascalName}> = {
  title: "React/${pascalName}",
  component: ${pascalName},
  tags: ["autodocs", "react"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
      description: "The variant of the component",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ${pascalName}>;

export const Default: Story = {
  args: {
    children: "${pascalName} Component",
    variant: "default",
  },
};

export const Outline: Story = {
  args: {
    children: "${pascalName} Component",
    variant: "outline",
  },
};
`;

const getVueTemplate = (pascalName, componentName) => `<script setup lang="ts">
import { computed } from 'vue'

interface ${pascalName}Props {
  /**
   * The variant of the component
   */
  variant?: 'default' | 'outline'
  class?: string
}

const props = withDefaults(defineProps<${pascalName}Props>(), {
  variant: 'default'
})

const classes = computed(() => {
  return [
    '${componentName}',
    props.class
  ].filter(Boolean).join(' ')
})
</script>

<template>
  <div :class="classes" :data-variant="variant">
    <slot />
  </div>
</template>

<style scoped>
/* Add your styles here */
</style>
`;

const getVueStoryTemplate = (pascalName, componentName) => `import type { Meta, StoryObj } from "@storybook/vue3";
import ${pascalName} from "./${pascalName}.vue";

const meta: Meta<typeof ${pascalName}> = {
  title: "Vue/${pascalName}",
  component: ${pascalName},
  tags: ["autodocs", "vue"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
      description: "The variant of the component",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ${pascalName}>;

export const Default: Story = {
  args: {
    variant: "default",
    default: "${pascalName} Component",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    default: "${pascalName} Component",
  },
};
`;

const getSvelteTemplate = (pascalName, componentName) => `<script lang="ts">
  export let variant: 'default' | 'outline' = 'default'
  let className = ''
  export { className as class }
</script>

<div 
  class="${componentName} {className}" 
  data-variant={variant}
>
  <slot />
</div>

<style>
  /* Add your styles here */
</style>
`;

const getSvelteStoryTemplate = (pascalName, componentName) => `import type { Meta, StoryObj } from "@storybook/svelte";
import ${pascalName} from "./${pascalName}.svelte";

const meta: Meta<typeof ${pascalName}> = {
  title: "Svelte/${pascalName}",
  component: ${pascalName},
  tags: ["autodocs", "svelte"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
      description: "The variant of the component",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ${pascalName}>;

export const Default: Story = {
  args: {
    variant: "default",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
};
`;

const createComponent = (componentName, framework) => {
  const fw = FRAMEWORKS[framework];
  const componentDir = path.join(UI_PACKAGE_PATH, fw.path, componentName);
  const pascalName = toPascalCase(componentName);
  const kebabName = toKebabCase(componentName);

  if (fs.existsSync(componentDir)) {
    console.error(`❌ Component '${componentName}' already exists in ${fw.name}.`);
    process.exit(1);
  }

  fs.mkdirSync(componentDir, { recursive: true });

  let componentContent, storyContent, componentFile, storyFile;

  switch (framework) {
    case "react":
      componentContent = getReactTemplate(pascalName, kebabName);
      storyContent = getReactStoryTemplate(pascalName, kebabName);
      componentFile = `${kebabName}.${fw.ext}`;
      storyFile = `${kebabName}.stories.${fw.ext}`;
      break;
    case "vue":
      componentContent = getVueTemplate(pascalName, kebabName);
      storyContent = getVueStoryTemplate(pascalName, pascalName);
      componentFile = `${pascalName}.${fw.ext}`;
      storyFile = `${pascalName}.stories.ts`;
      break;
    case "svelte":
      componentContent = getSvelteTemplate(pascalName, kebabName);
      storyContent = getSvelteStoryTemplate(pascalName, pascalName);
      componentFile = `${pascalName}.${fw.ext}`;
      storyFile = `${pascalName}.stories.ts`;
      break;
  }

  // Write component file
  fs.writeFileSync(path.join(componentDir, componentFile), componentContent);

  // Write story file
  fs.writeFileSync(path.join(componentDir, storyFile), storyContent);

  // Update index.ts for React
  if (framework === "react") {
    const exportStatement = `export * from "./${fw.path}/${kebabName}/${kebabName}";`;
    const indexContent = fs.readFileSync(UI_INDEX_PATH, "utf8");
    if (!indexContent.includes(exportStatement)) {
      fs.appendFileSync(UI_INDEX_PATH, `\n${exportStatement}`);
    }
  }

  console.log(`\n✅ Successfully created ${fw.name} component '${componentName}'!`);
  console.log(`📁 Location: ${componentDir}`);
  console.log(`📄 Files created:`);
  console.log(`   - ${componentFile}`);
  console.log(`   - ${storyFile}`);
  if (framework === "react") {
    console.log(`📝 Updated: ${UI_INDEX_PATH}\n`);
  }
};

const askFramework = (callback) => {
  console.log("\n🎨 Select a framework:");
  console.log("1. React");
  console.log("2. Vue");
  console.log("3. Svelte");

  rl.question("\nEnter your choice (1-3): ", (choice) => {
    const frameworks = ["react", "vue", "svelte"];
    const selectedFramework = frameworks[parseInt(choice) - 1];

    if (!selectedFramework) {
      console.error("❌ Invalid choice. Please select 1, 2, or 3.");
      process.exit(1);
    }

    callback(selectedFramework);
  });
};

const askComponentName = (framework, callback) => {
  rl.question(
    `\n📝 Enter component name (e.g., my-button or MyButton): `,
    (name) => {
      if (!name) {
        console.error("❌ Component name is required.");
        process.exit(1);
      }
      callback(name.trim());
    }
  );
};

// Main execution
console.log("\n🚀 UI Component Generator");
console.log("========================\n");

askFramework((framework) => {
  askComponentName(framework, (name) => {
    createComponent(name, framework);
    rl.close();
  });
});
