/**
 * MFE Mount Manager - Handles mounting and unmounting with proper lifecycle
 */

import { logger } from "../logger/logger";
import type { MfeContextProps, MfeLifecycleHooks } from "../types/mfe-context";

export interface MountOptions {
  timeout?: number; // ms to wait before timing out
  strict?: boolean; // Throw on mount failures
}

/**
 * Manages the mounting lifecycle of an MFE
 */
export class MountManager {
  private mounts = new Map<string, MountInfo>();

  /**
   * Execute mount with lifecycle hooks
   */
  async mount(
    appId: string,
    container: HTMLElement,
    props: MfeContextProps,
    hooks: MfeLifecycleHooks,
    mountFn: (container: HTMLElement, props: MfeContextProps) => void,
    options: MountOptions = {},
  ): Promise<void> {
    const { timeout = 10000, strict = false } = options;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    // A timer that rejects on its own once `timeout` elapses, so that a
    // hook (onBeforeMount/onAfterMount) that hangs forever can't keep this
    // promise pending indefinitely. Previously the timeout only logged an
    // error while the mount kept running in the background.
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(
          new Error(`Mount timeout for "${appId}" after ${timeout}ms`),
        );
      }, timeout);
    });

    const doMount = async (): Promise<void> => {
      logger.info(`[MountManager] Mounting "${appId}"`);

      // Before mount hook
      if (hooks.onBeforeMount) {
        await Promise.resolve(hooks.onBeforeMount(props));
      }

      // Perform actual mount
      mountFn(container, props);

      // After mount hook
      if (hooks.onAfterMount) {
        await Promise.resolve(hooks.onAfterMount(props));
      }

      // Record mount info
      this.mounts.set(appId, {
        appId,
        container,
        mountTime: new Date(),
        hooks,
      });

      logger.info(`[MountManager] Successfully mounted "${appId}"`);
    };

    try {
      await Promise.race([doMount(), timeoutPromise]);
    } catch (error) {
      logger.error(`[MountManager] Mount failed for "${appId}"`, error);

      if (hooks.onError && error instanceof Error) {
        hooks.onError({
          appId,
          code: "MOUNT_FAILED",
          message: error.message,
          severity: "error",
          timestamp: new Date(),
          stack: error.stack,
          recoverable: false,
        });
      }

      if (strict) {
        throw error;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Execute unmount with lifecycle hooks
   */
  async unmount(appId: string, unmountFn: () => void): Promise<void> {
    const mountInfo = this.mounts.get(appId);

    try {
      logger.info(`[MountManager] Unmounting "${appId}"`);

      // Before unmount hook
      if (mountInfo?.hooks.onBeforeUnmount) {
        await Promise.resolve(mountInfo.hooks.onBeforeUnmount());
      }

      // Perform actual unmount
      unmountFn();

      // After unmount hook
      if (mountInfo?.hooks.onAfterUnmount) {
        mountInfo.hooks.onAfterUnmount();
      }

      // Clear mount info
      this.mounts.delete(appId);

      logger.info(`[MountManager] Successfully unmounted "${appId}"`);
    } catch (error) {
      logger.error(`[MountManager] Unmount failed for "${appId}"`, error);

      if (mountInfo?.hooks.onError && error instanceof Error) {
        mountInfo.hooks.onError({
          appId,
          code: "UNMOUNT_FAILED",
          message: error.message,
          severity: "error",
          timestamp: new Date(),
          stack: error.stack,
          recoverable: true, // Can retry unmount
        });
      }
    }
  }

  /**
   * Get mount info for debugging
   */
  getMountInfo(appId?: string): MountInfo | MountInfo[] | undefined {
    if (appId) {
      return this.mounts.get(appId);
    }
    return Array.from(this.mounts.values());
  }

  /**
   * Get all mounted apps
   */
  getMountedApps(): string[] {
    return Array.from(this.mounts.keys());
  }

  /**
   * Check if app is mounted
   */
  isMounted(appId: string): boolean {
    return this.mounts.has(appId);
  }

  /**
   * Get mount duration
   */
  getMountDuration(appId: string): number | undefined {
    const info = this.mounts.get(appId);
    if (!info) return undefined;
    return Date.now() - info.mountTime.getTime();
  }
}

interface MountInfo {
  appId: string;
  container: HTMLElement;
  mountTime: Date;
  hooks: MfeLifecycleHooks;
}
