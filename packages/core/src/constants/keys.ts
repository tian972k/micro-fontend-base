/**
 * Centralized keys for cross-app communication and state synchronization.
 * This prevents typos and provides a single source of truth for all MFEs.
 */

export const EVENT_KEYS = {
  APP_COUNTER: "APP_COUNTER",
  // Add more global event keys here
} as const;

export type EventKey = keyof typeof EVENT_KEYS;

export const STORAGE_KEYS = {
  THEME: "mfe-theme-preference",
  // Add more storage keys here
} as const;
