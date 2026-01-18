import { DefaultStrategy } from "./base";

export class VueStrategy extends DefaultStrategy {
  // Can override mount/unmount to handle Vue-specific props or context
}

export class ReactStrategy extends DefaultStrategy {
  // Can override mount/unmount to handle React-specific context providers wrapper
}

export class SvelteStrategy extends DefaultStrategy {
  // Can override mount/unmount to handle Svelte-specific slot/store logic
}

export class SolidStrategy extends DefaultStrategy {
  // Can override mount/unmount to handle Solid-specific logic
}
