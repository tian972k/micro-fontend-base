import type { MetaDescriptor, MetaFunction } from "@remix-run/node";

/**
 * Remix v2 replaces (not merges) parent meta with a route's meta, so every
 * page lost the root description (an SEO/Lighthouse failure). Use this to
 * keep the parent tags and override only what the page sets:
 *
 *   export const meta = mergeMeta(() => [{ title: "Login" }]);
 */
export function mergeMeta(
  overrides: (...args: Parameters<MetaFunction>) => MetaDescriptor[],
): MetaFunction {
  return (args) => {
    const parent = args.matches.flatMap((match) => match.meta ?? []);
    const own = overrides(args);
    const key = (d: MetaDescriptor) =>
      "title" in d
        ? "title"
        : "name" in d
          ? `name:${String(d.name)}`
          : "property" in d
            ? `property:${String(d.property)}`
            : null;
    const ownKeys = new Set(own.map(key).filter(Boolean));
    return [...parent.filter((d) => !ownKeys.has(key(d))), ...own];
  };
}
