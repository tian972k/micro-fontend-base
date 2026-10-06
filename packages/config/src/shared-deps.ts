/**
 * Module Federation shared singletons.
 *
 * Only framework runtimes are shared: they hold global state (React's
 * dispatcher, Vue's reactivity, ...) and must exist once per page. The
 * shell provides React; Vue/Svelte/Solid remotes share theirs with each
 * other. Platform state (stores, EventBus, registry, telemetry) does NOT
 * need sharing - @repo/core keeps those singletons on `window`.
 */
export const reactShared = ["react", "react-dom"] as const;
export const vueShared = ["vue"] as const;
export const svelteShared = ["svelte"] as const;
export const solidShared = ["solid-js"] as const;

/** @deprecated use reactShared - kept for older app configs. */
export const federationShared = reactShared;
/** @deprecated non-React remotes now share only their own framework. */
export const nonReactShared = [] as const;
