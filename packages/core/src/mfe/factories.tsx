// Re-export framework-specific factories
// Each app only imports what it needs, avoiding unnecessary dependencies
export { createReactMfeEntry } from "./react-factory";
export { createVueMfeEntry } from "./vue-factory";
export { createSvelteMfeEntry } from "./svelte-factory";
export { createSolidMfeEntry } from "./solid-factory";
