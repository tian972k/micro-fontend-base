# Script Migration to ESM

## Why ESM?

With **Storybook v10 requiring ESM-only**, we've migrated all scripts to use ES Modules for consistency and modern standards.

## Changes Made

### ✅ Migrated Scripts

| Old (CommonJS) | New (ESM) | Status |
| -------------- | --------- | ------ |
| `create-app.js` | `create-app.mjs` | ✅ Migrated |
| `generate-ui.js` | `generate-ui.mjs` | ✅ Migrated |
| `packages/ui/cli/generate-component.js` | Same file, converted to ESM | ✅ Migrated |

### 🔄 Key Changes

**Before (CommonJS):**

```javascript
const fs = require("fs");
const path = require("path");

module.exports = { ... };
```

**After (ESM):**

```javascript
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export { ... };
```

### 📝 Benefits

1. **Storybook v10 Compatibility** - Aligns with ESM-only requirement
2. **Modern Standards** - ES Modules are the JavaScript standard
3. **Better Tree Shaking** - Improved build optimization
4. **Async Support** - Top-level await available
5. **Explicit Imports** - Clearer dependency management

### ⚠️ Important Notes

- `.mjs` extension explicitly marks files as ES Modules
- `__dirname` and `__filename` require manual setup in ESM
- All scripts remain backward compatible in functionality
- Old `.js` files can be safely removed

### 🚀 Usage (No Change)

Scripts work exactly the same:

```bash
# Create new app
pnpm create-app

# Generate UI component  
pnpm generate-ui

# Generate component with framework choice
pnpm --filter @repo/ui generate
```

### 🔧 For Developers

When creating new scripts:

- Use `.mjs` extension for ESM
- Use `import/export` instead of `require/module.exports`
- Add `#!/usr/bin/env node` for CLI scripts
- Remember to set up `__dirname` if needed:

  ```javascript
  import { fileURLToPath } from "url";
  import { dirname } from "path";
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  ```
