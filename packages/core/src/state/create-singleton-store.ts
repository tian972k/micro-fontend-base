/**
 * Creates (or reuses) a singleton store instance keyed by `globalKey` on
 * `window`. All of the common stores (counter, locale, theme, user) need
 * exactly this pattern so that every MFE sharing the page ends up with the
 * *same* store instance instead of one per bundle - this factors that out
 * instead of repeating the same window-singleton boilerplate in each file.
 *
 * On the server (no `window`), a fresh instance is created every call,
 * since there's no persistent global to stash it on and each request
 * should get its own state anyway.
 */
export function createSingletonStore<TStore>(
  globalKey: string,
  factory: () => TStore,
): TStore {
  if (typeof window === "undefined") {
    return factory();
  }

  const win = window as typeof window & Record<string, TStore | undefined>;

  if (!win[globalKey]) {
    win[globalKey] = factory();
  }

  return win[globalKey] as TStore;
}
