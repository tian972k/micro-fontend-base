#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const UI_PACKAGE_PATH = path.join(
  __dirname,
  "../packages/ui/src/components/react",
);
const UI_INDEX_PATH = path.join(__dirname, "../packages/ui/src/index.ts");

const toPascalCase = (str) => {
  return str
    .replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase())
    .replace(/-/g, "");
};

const createComponent = (componentName) => {
  const componentDir = path.join(UI_PACKAGE_PATH, componentName);
  const pascalName = toPascalCase(componentName);

  if (fs.existsSync(componentDir)) {
    console.error(`Component '${componentName}' already exists.`);
    process.exit(1);
  }

  fs.mkdirSync(componentDir, { recursive: true });

  // Component file
  const componentContent = `import * as React from "react"
import { cn } from "@repo/utils"

export interface ${pascalName}Props extends React.HTMLAttributes<HTMLDivElement> {}

const ${pascalName} = React.forwardRef<HTMLDivElement, ${pascalName}Props>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("bg-background", className)}
      {...props}
    />
  )
)
${pascalName}.displayName = "${pascalName}"

export { ${pascalName} }
`;

  fs.writeFileSync(
    path.join(componentDir, `${componentName}.tsx`),
    componentContent,
  );

  // Story file
  const storyContent = `import type { Meta, StoryObj } from "@storybook/react";
import { ${pascalName} } from "./${componentName}";

const meta: Meta<typeof ${pascalName}> = {
  title: "React/${pascalName}",
  component: ${pascalName},
  tags: ["autodocs", "react"],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof ${pascalName}>;

export const Default: Story = {
  args: {
    children: "${pascalName} Content",
  },
};
`;

  fs.writeFileSync(
    path.join(componentDir, `${componentName}.stories.tsx`),
    storyContent,
  );

  // Update index.ts
  const exportStatement = `export * from "./components/react/${componentName}/${componentName}";`;
  const indexContent = fs.readFileSync(UI_INDEX_PATH, "utf8");
  if (!indexContent.includes(exportStatement)) {
    fs.appendFileSync(UI_INDEX_PATH, `\n${exportStatement}`);
  }

  console.log(
    `Successfully created component '${componentName}' in ${componentDir}`,
  );
  console.log(`Updated exports in ${UI_INDEX_PATH}`);
};

const showHelp = () => {
  console.log(`
🎨 UI Component Generator
=========================
Usage: pnpm generate-ui [options]

Options:
  -h, --help    Show this help message

Description:
  Generates a new React component in '@repo/ui'.
  - Creates the component file (.tsx)
  - Creates a Storybook story (.stories.tsx)
  - Exports the component from the main UI package index.
  `);
  process.exit(0);
};

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  showHelp();
}

rl.question(
  "Enter component name (kebab-case, e.g., my-component): ",
  (name) => {
    if (!name) {
      console.error("Component name is required.");
      process.exit(1);
    }
    createComponent(name);
    rl.close();
  },
);
