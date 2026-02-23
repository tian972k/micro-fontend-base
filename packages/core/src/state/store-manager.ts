/**
 * Store Manager - Provides isolated state management for each MFE
 * Prevents state leaking between applications
 */

import { logger } from "../logger/logger";

/**
 * Individual app store with get/set/watch pattern
 */
export class AppStore {
  private state = new Map<string, any>();
  private watchers = new Map<string, Set<Function>>();
  private appId: string;

  constructor(appId: string) {
    this.appId = appId;
  }

  /**
   * Get value from store
   */
  get<T = any>(key: string, defaultValue?: T): T | undefined {
    return (this.state.get(key) ?? defaultValue) as T | undefined;
  }

  /**
   * Set value in store and notify watchers
   */
  set<T = any>(key: string, value: T): void {
    const oldValue = this.state.get(key);

    if (oldValue === value) return; // No change

    this.state.set(key, value);
    this.notifyWatchers(key, value, oldValue);
    logger.debug(`[AppStore:${this.appId}] Set "${key}"`, value);
  }

  /**
   * Watch for changes to a key
   */
  watch<T = any>(
    key: string,
    callback: (newValue: T, oldValue?: T) => void,
  ): () => void {
    if (!this.watchers.has(key)) {
      this.watchers.set(key, new Set());
    }

    this.watchers.get(key)!.add(callback);

    // Return unwatch function
    return () => {
      this.watchers.get(key)?.delete(callback);
    };
  }

  /**
   * Delete a key from store
   */
  delete(key: string): boolean {
    const result = this.state.delete(key);
    if (result) {
      this.notifyWatchers(key, undefined, undefined);
      logger.debug(`[AppStore:${this.appId}] Deleted "${key}"`);
    }
    return result;
  }

  /**
   * Clear all store data
   */
  clear(): void {
    this.state.clear();
    logger.debug(`[AppStore:${this.appId}] Cleared`);
  }

  /**
   * Get all store data
   */
  getAll(): Record<string, any> {
    return Object.fromEntries(this.state);
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.state.has(key);
  }

  // ========== PRIVATE ==========

  private notifyWatchers<T>(key: string, newValue: T, oldValue?: T): void {
    const callbacks = this.watchers.get(key);
    if (!callbacks) return;

    callbacks.forEach((callback) => {
      try {
        (callback as Function)(newValue, oldValue);
      } catch (error) {
        logger.error(
          `[AppStore:${this.appId}] Watcher error for "${key}":`,
          error,
        );
      }
    });
  }
}

/**
 * Store Manager - Manages isolated stores for each MFE
 * Ensures state doesn't leak between apps
 */
export class StoreManager {
  private appStores = new Map<string, AppStore>();

  /**
   * Create or get store for an app
   */
  createStoreForApp(appId: string): AppStore {
    if (!this.appStores.has(appId)) {
      this.appStores.set(appId, new AppStore(appId));
      logger.debug(`[StoreManager] Created store for "${appId}"`);
    }
    return this.appStores.get(appId)!;
  }

  /**
   * Get store for an app (if exists)
   */
  getStoreForApp(appId: string): AppStore | undefined {
    return this.appStores.get(appId);
  }

  /**
   * Destroy store for an app
   * Called during MFE unmount to clean up memory
   */
  destroyAppStore(appId: string): boolean {
    const store = this.appStores.get(appId);
    if (!store) return false;

    store.clear();
    this.appStores.delete(appId);
    logger.debug(`[StoreManager] Destroyed store for "${appId}"`);

    return true;
  }

  /**
   * Share data between apps (with caution!)
   * Use sparingly - prefer EventBus for communication
   */
  shareState(sourceAppId: string, targetAppId: string, key: string): void {
    const sourceStore = this.appStores.get(sourceAppId);
    const targetStore = this.appStores.get(targetAppId);

    if (!sourceStore || !targetStore) {
      logger.warn(
        `[StoreManager] Cannot share state: source or target not found`,
      );
      return;
    }

    const value = sourceStore.get(key);
    if (value !== undefined) {
      targetStore.set(key, value);
      logger.debug(
        `[StoreManager] Shared "${key}" from "${sourceAppId}" to "${targetAppId}"`,
      );
    }
  }

  /**
   * Get all app stores (for debugging)
   */
  getAllStores(): Map<string, AppStore> {
    return new Map(this.appStores);
  }

  /**
   * Get list of app IDs with active stores
   */
  getActiveApps(): string[] {
    return Array.from(this.appStores.keys());
  }
}

/**
 * Simple in-memory store implementation using Map
 * Can be replaced with Zustand, Pinia, etc. per app
 */
export interface IStore {
  get<T = any>(key: string): T | undefined;
  set<T = any>(key: string, value: T): void;
  watch<T = any>(
    key: string,
    callback: (newValue: T, oldValue?: T) => void,
  ): () => void;
  delete(key: string): boolean;
  clear(): void;
}
