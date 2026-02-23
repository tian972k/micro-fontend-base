/**
 * MFE Context Props - Strict interface for all MFEs
 * This ensures type-safe communication between host and micro frontends
 */

import type { EventBus } from "../events/event-bus";
import type { StoreManager } from "../state/store-manager";

/**
 * User authentication information
 */
export interface MfeAuthContext {
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: Set<string>;
}

/**
 * Application theme configuration
 */
export type MfeTheme = "light" | "dark" | "system" | string;

/**
 * Application locale for i18n
 */
export interface MfeLocaleContext {
  locale: string;
  rtl: boolean;
  supported: string[];
}

/**
 * Navigation context
 */
export interface MfeNavigationContext {
  currentPath: string;
  navigate: (path: string, options?: NavigateOptions) => void;
  goBack: () => void;
  goForward: () => void;
}

export interface NavigateOptions {
  replace?: boolean;
  state?: Record<string, any>;
}

/**
 * Error handling context
 */
export interface MfeError {
  appId: string;
  code: string;
  message: string;
  severity: "info" | "warning" | "error" | "critical";
  timestamp: Date;
  stack?: string;
  context?: Record<string, any>;
  recoverable: boolean;
}

/**
 * Main MFE context props passed by host to MFE
 * All MFEs should receive this interface
 */
export interface MfeContextProps {
  // ========== CORE ==========
  /** Unique application identifier */
  appId: string;

  // ========== AUTHENTICATION & AUTHORIZATION ==========
  auth?: MfeAuthContext;

  // ========== APPEARANCE ==========
  theme?: MfeTheme;
  locale?: string;
  rtl?: boolean;

  // ========== COMMUNICATION ==========
  /** EventBus for inter-app communication */
  eventBus: EventBus;

  // ========== STATE MANAGEMENT ==========
  /** Isolated store manager for this app */
  storeManager: StoreManager;

  // ========== NAVIGATION ==========
  navigation?: MfeNavigationContext;

  // ========== CALLBACKS ==========
  /** Called when MFE encounters an error */
  onError?: (error: MfeError) => void;

  /** Called when theme changes */
  onThemeChange?: (theme: MfeTheme) => void;

  /** Called when locale changes */
  onLocaleChange?: (locale: string) => void;

  // ========== METADATA ==========
  /** Environment: 'development' | 'production' */
  environment?: "development" | "production";

  /** Build version of the MFE */
  version?: string;

  /** Custom metadata */
  metadata?: Record<string, any>;
}

/**
 * MFE lifecycle hooks
 */
export interface MfeLifecycleHooks {
  onBeforeMount?: (props: MfeContextProps) => Promise<void> | void;
  onAfterMount?: (props: MfeContextProps) => Promise<void> | void;
  onBeforeUnmount?: () => Promise<void> | void;
  onAfterUnmount?: () => void;
  onError?: (error: MfeError) => void;
  onContextChange?: (context: Partial<MfeContextProps>) => void;
}

/**
 * Validation helper - ensure required props are present
 */
export function validateMfeContextProps(props: any): props is MfeContextProps {
  return (
    typeof props === "object" &&
    props !== null &&
    typeof props.appId === "string" &&
    props.eventBus !== undefined &&
    props.storeManager !== undefined
  );
}
