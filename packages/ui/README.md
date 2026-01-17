# @repo/ui

The comprehensive Design System for the platform, built on top of **Radix UI** and **Tailwind CSS**.

## Overview

- **Headless Accessibility**: Uses Radix UI primitives for robust accessibility.
- **Tailwind Styled**: Fully customizable via Tailwind classes.
- **Dark Mode Ready**: All components support dark/light modes out of the box.
- **Tree Shakeable**: Exported individually to keep bundle sizes small.

## Usage

```tsx
import { Button, Card } from "@repo/ui";

export function MyComponent() {
  return (
    <Card className="p-4">
      <h1 className="text-xl font-bold">Hello World</h1>
      <Button variant="default" size="sm">
        Click Me
      </Button>
    </Card>
  );
}
```

## Available Components

- `Button`: Flexible button component with variants (default, destructive, outline, secondary, ghost, link).
- `Card`: Container component with Header, Title, Description, Content, and Footer sub-components.
- `Input`: Form input fields.
- `Select`: Dropdown selection menus.
- `Tabs`: Tabbed interface navigation.
- `Dialog`: Modal dialogs.
- `DropdownMenu`: Popover menus.
- `ScrollArea`: Custom scrollable value.
- `Avatar`: User profile images with fallbacks.

## Configuration

This package exports a shared Tailwind config preset used by the apps.

**In `tailwind.config.js`:**

```javascript
const sharedConfig = require("@repo/ui/tailwind.config");

module.exports = {
  presets: [sharedConfig],
  // ...
};
```
