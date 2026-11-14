#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * UI component generator.
 *
 *   pnpm g ui <name> [--fw react,vue,svelte,solid | all] [--no-story]
 *   pnpm --filter @repo/ui generate            # interactive prompts
 *
 * Creates the component (+ Storybook story) and registers its export in
 * the framework's entry point, so it is importable right away from
 * "@repo/ui/react" | "@repo/ui/vue" | "@repo/ui/svelte" | "@repo/ui/solid".
 */

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
  solid: {
    name: "SolidJS",
    path: "components/solid",
    ext: "tsx",
  },
  svelte: {
    name: "Svelte",
    path: "components/svelte",
    ext: "svelte",
  },
};

const UI_PACKAGE_PATH = path.join(__dirname, "..", "src");
const UI_INDEX_PATH = path.join(__dirname, "..", "src", "index.ts");
const UI_REACT_PATH = path.join(__dirname, "..", "src", "react.ts");

const toKebabCase = (str) => {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
};

// my-button, MyButton and "my button" all become MyButton.
const toPascalCase = (str) => {
  return toKebabCase(str)
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
};

// Templates
const getReactTemplate = (
  pascalName,
  componentName,
) => `import * as React from "react"
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

const getReactStoryTemplate = (
  pascalName,
  componentName,
) => `import type { Meta, StoryObj } from "@storybook/react-vite";
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

const getVueStoryTemplate = (
  pascalName,
  componentName,
) => `import type { Meta, StoryObj } from "@storybook/vue3-vite";
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
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
};
`;

// SolidJS templates
const getSolidTemplate = (
  pascalName,
  componentName,
) => `import { splitProps, JSX, Component, mergeProps } from "solid-js";
import { cn } from "@repo/utils";

export interface ${pascalName}Props extends JSX.HTMLAttributes<HTMLDivElement> {
  /**
   * The variant of the component
   */
  variant?: "default" | "outline";
}

export const ${pascalName}: Component<${pascalName}Props> = (props) => {
  const merged = mergeProps({ variant: "default" as const }, props);
  const [local, others] = splitProps(merged, ["variant", "class", "children"]);

  return (
    <div
      class={cn("${componentName}", local.class)}
      data-variant={local.variant}
      {...others}
    >
      {local.children}
    </div>
  );
};
`;

const getSolidStoryTemplate = (
  pascalName,
  componentName,
) => `import type { Meta, StoryObj } from "storybook-solidjs";
import { ${pascalName} } from "./${componentName}";

const meta: Meta<typeof ${pascalName}> = {
  title: "Solid/${pascalName}",
  component: ${pascalName},
  tags: ["autodocs", "solid"],
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
    children: "${pascalName} Component",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "${pascalName} Component",
  },
};
`;

const getSvelteTemplate = (pascalName, componentName) => `<script lang="ts">
  import { cn } from "@repo/utils";

  export let variant: 'default' | 'outline' = 'default'
  let className = ''
  export { className as class }

  $: classes = cn("${componentName}", className);
</script>

<div 
  class={classes}
  data-variant={variant}
>
  <slot />
</div>
`;

const getSvelteStoryTemplate = (
  pascalName,
  componentName,
) => `import type { Meta, StoryObj } from "@storybook/svelte-vite";
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

const appendOnce = (file, line) => {
  const content = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  if (content.includes(line)) return;
  const separator = content === "" || content.endsWith("\n") ? "" : "\n";
  fs.writeFileSync(file, `${content}${separator}${line}\n`);
};

const createComponent = (componentName, framework, { story = true } = {}) => {
  const fw = FRAMEWORKS[framework];
  const pascalName = toPascalCase(componentName);
  const kebabName = toKebabCase(componentName);
  const componentDir = path.join(UI_PACKAGE_PATH, fw.path, kebabName);
  const frameworkIndex = path.join(UI_PACKAGE_PATH, fw.path, "index.ts");

  if (fs.existsSync(componentDir)) {
    console.error(`❌ Component '${kebabName}' already exists in ${fw.name}.`);
    return false;
  }

  fs.mkdirSync(componentDir, { recursive: true });

  let componentContent, storyContent, componentFile, storyFile;
  const updated = [];

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
    case "solid":
      componentContent = getSolidTemplate(pascalName, kebabName);
      storyContent = getSolidStoryTemplate(pascalName, kebabName);
      componentFile = `${kebabName}.${fw.ext}`;
      storyFile = `${kebabName}.stories.${fw.ext}`;
      break;
  }

  fs.writeFileSync(path.join(componentDir, componentFile), componentContent);
  if (story) {
    fs.writeFileSync(path.join(componentDir, storyFile), storyContent);
  }

  // Register the export in the framework's entry point.
  switch (framework) {
    case "react": {
      const line = `export * from "./${fw.path}/${kebabName}/${kebabName}";`;
      for (const entry of [UI_INDEX_PATH, UI_REACT_PATH]) {
        appendOnce(entry, line);
        updated.push(entry);
      }
      break;
    }
    case "vue":
      fs.writeFileSync(
        path.join(componentDir, "index.ts"),
        `export { default as ${pascalName} } from "./${pascalName}.vue";\n`,
      );
      appendOnce(frameworkIndex, `export * from "./${kebabName}";`);
      updated.push(frameworkIndex);
      break;
    case "svelte":
      appendOnce(
        frameworkIndex,
        `export { default as ${pascalName} } from "./${kebabName}/${pascalName}.svelte";`,
      );
      updated.push(frameworkIndex);
      break;
    case "solid":
      appendOnce(
        frameworkIndex,
        `export * from "./${kebabName}/${kebabName}";`,
      );
      updated.push(frameworkIndex);
      break;
  }

  const rel = (file) => path.relative(process.cwd(), file);
  console.log(`\n✅ Created ${fw.name} component '${pascalName}'`);
  console.log(`   ${rel(path.join(componentDir, componentFile))}`);
  if (story) console.log(`   ${rel(path.join(componentDir, storyFile))}`);
  for (const file of updated) console.log(`   updated ${rel(file)}`);
  console.log(`   import { ${pascalName} } from "@repo/ui/${framework}";`);
  return true;
};

const parseArgs = (argv) => {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      out._.push(arg);
      continue;
    }
    const [key, inline] = arg.slice(2).split("=");
    if (inline !== undefined) out[key] = inline;
    else if (argv[i + 1] && !argv[i + 1].startsWith("--")) out[key] = argv[++i];
    else out[key] = true;
  }
  return out;
};

const resolveFrameworks = (value) => {
  const aliases = { solidjs: "solid" };
  const list =
    value === "all"
      ? Object.keys(FRAMEWORKS)
      : String(value)
          .split(",")
          .map((name) => name.trim().toLowerCase())
          .map((name) => aliases[name] ?? name);
  const unknown = list.filter((name) => !FRAMEWORKS[name]);
  if (unknown.length > 0) {
    console.error(
      `❌ Unknown framework: ${unknown.join(", ")}. Use ${Object.keys(FRAMEWORKS).join(", ")} or all.`,
    );
    process.exit(1);
  }
  return list;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  let name = args._[0];
  let frameworks = args.fw ?? args.framework;

  // Anything missing is asked for, so `pnpm generate` alone still works.
  if (!name || !frameworks) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const ask = (question) =>
      new Promise((resolve) => rl.question(question, resolve));
    console.log("\n🚀 UI Component Generator");
    if (!frameworks) {
      frameworks =
        (
          await ask("Framework (react, vue, solid, svelte, all) [react]: ")
        ).trim() || "react";
    }
    if (!name) {
      name = (
        await ask("Component name (e.g. my-button or MyButton): ")
      ).trim();
    }
    rl.close();
  }

  if (!name || !/^[A-Za-z][A-Za-z0-9-_ ]*$/.test(name)) {
    console.error("❌ A component name is required (letters, digits, dashes).");
    process.exit(1);
  }

  const results = resolveFrameworks(frameworks).map((framework) =>
    createComponent(name, framework, { story: !args["no-story"] }),
  );
  if (results.includes(false)) process.exit(1);
  console.log("");
};

main();
