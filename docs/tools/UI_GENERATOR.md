# UI Component Generator CLI

Generate UI components with Storybook stories for React, Vue, or Svelte frameworks.

## Usage

### From UI Package

```bash
cd packages/ui
pnpm generate
# or
pnpm g
```

### From Root

```bash
pnpm --filter @repo/ui generate
```

### Direct Execution

```bash
node packages/ui/cli/generate-component.js
```

## Features

- 🎨 **Multi-Framework Support**: Generate components for React, Vue, or Svelte
- 📖 **Automatic Storybook Stories**: Each component comes with pre-configured stories
- 🔄 **Auto-Export**: React components are automatically exported from index.ts
- 📝 **TypeScript Support**: All templates use TypeScript
- 🎯 **Best Practices**: Components follow framework best practices

## Interactive Prompts

1. **Select Framework**: Choose between React, Vue, or Svelte
2. **Component Name**: Enter your component name (supports both kebab-case and PascalCase)

## Examples

### React Component

```bash
pnpm g
# Select: 1 (React)
# Enter name: my-button
```

Generated files:

- `src/components/react/my-button/my-button.tsx`
- `src/components/react/my-button/my-button.stories.tsx`

### Vue Component

```bash
pnpm g
# Select: 2 (Vue)
# Enter name: MyCard
```

Generated files:

- `src/components/vue/my-card/MyCard.vue`
- `src/components/vue/my-card/MyCard.stories.ts`

### Svelte Component

```bash
pnpm g
# Select: 3 (Svelte)
# Enter name: Badge
```

Generated files:

- `src/components/svelte/badge/Badge.svelte`
- `src/components/svelte/badge/Badge.stories.ts`

## Component Template Features

All generated components include:

- ✅ TypeScript props interface
- ✅ Variant support (default, outline)
- ✅ Storybook stories with Controls
- ✅ Autodocs enabled
- ✅ Accessibility support
- ✅ Utility class integration (cn for React)

## Tips

- Use **kebab-case** for component names (e.g., `my-button`)
- Or use **PascalCase** (e.g., `MyButton`) - will be auto-converted
- Check Storybook after generation to see your new component
- Customize the generated templates in `cli/generate-component.js`
