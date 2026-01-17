import { globalEventBus } from "../events/event-bus";

/**
 * Generic store interface that most state management libraries can adapt to.
 */
export interface SyncStoreAdapter<T> {
  getState: () => T;
  setState: (state: T) => void;
  subscribe: (listener: (state: T) => void) => () => void;
}

/**
 * Options for syncStore.
 */
export interface SyncStoreOptions<K extends string = string> {
  /**
   * Unique key for the event on the EventBus.
   * Multiple stores with the same key will be kept in sync.
   */
  key: K;
  /**
   * If true, this store will not emit changes to the EventBus.
   * Useful for stores that only need to consume state.
   */
  readOnly?: boolean;
}

/**
 * Synchronizes a local store with other stores across the micro-frontend environment
 * using the global EventBus.
 *
 * @param adapter - An object that adapts the local store's API to the SyncStoreAdapter interface.
 * @param options - Configuration options for synchronization.
 * @returns A cleanup function to stop synchronization.
 */
export function syncStore<T, K extends string = string>(
  adapter: SyncStoreAdapter<T>,
  options: SyncStoreOptions<K>,
) {
  const { key, readOnly = false } = options;
  let isInternalChange = false;

  // 1. Listen for changes from other apps
  const unsubscribeBus = globalEventBus.on(key, (newState: unknown) => {
    // Avoid circular updates: if we just emitted this state, don't set it back
    isInternalChange = true;
    adapter.setState(newState as T);
    isInternalChange = false;
  });

  // 2. Listen for local changes and broadcast to other apps
  let unsubscribeLocal: (() => void) | undefined;
  if (!readOnly) {
    unsubscribeLocal = adapter.subscribe((state: T) => {
      if (!isInternalChange) {
        globalEventBus.emit(key, state);
      }
    });

    // Initial broadcast to sync others if they are already listening
    globalEventBus.emit(key, adapter.getState());
  }

  // Return cleanup function
  return () => {
    unsubscribeBus();
    if (unsubscribeLocal) unsubscribeLocal();
  };
}
