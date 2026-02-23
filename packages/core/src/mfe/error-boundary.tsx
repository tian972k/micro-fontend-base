/**
 * MFE Error Boundary - Catches and handles errors in React MFEs
 * Prevents one MFE crash from taking down the entire host
 */

import React from "react";
import type { MfeError } from "../types/mfe-context";
import { logger } from "../logger/logger";

interface ErrorBoundaryProps {
  appId: string;
  children: React.ReactNode;
  onError?: (error: MfeError) => void;
  fallback?: React.ComponentType<{ appId: string; error: Error }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary for catching MFE errors
 * Use this to wrap MFE components in the host
 */
export class MfeErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const { appId, onError } = this.props;

    logger.error(`[MfeErrorBoundary] Caught error in "${appId}"`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Notify parent about error
    if (onError) {
      onError({
        appId,
        code: "COMPONENT_ERROR",
        message: error.message,
        severity: "error",
        timestamp: new Date(),
        stack: error.stack,
        context: {
          componentStack: errorInfo.componentStack,
        },
        recoverable: true,
      });
    }
  }

  render(): React.ReactNode {
    const { hasError, error } = this.state;
    const { appId, children, fallback: FallbackComponent } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (FallbackComponent) {
        return <FallbackComponent appId={appId} error={error} />;
      }

      // Default fallback UI
      return (
        <div
          style={{
            padding: "20px",
            margin: "10px",
            border: "2px solid #ff6b6b",
            borderRadius: "4px",
            backgroundColor: "#ffe0e0",
            color: "#c92a2a",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0" }}>⚠️ {appId} Error</h3>
          <p style={{ margin: "0 0 10px 0", fontSize: "12px" }}>
            {error.message}
          </p>
          <details style={{ fontSize: "11px" }}>
            <summary style={{ cursor: "pointer", marginBottom: "5px" }}>
              Stack trace
            </summary>
            <pre
              style={{
                margin: "0",
                padding: "5px",
                backgroundColor: "#fff0f0",
                overflow: "auto",
                maxHeight: "200px",
                fontSize: "10px",
              }}
            >
              {error.stack}
            </pre>
          </details>
        </div>
      );
    }

    return children;
  }
}

/**
 * Default error fallback component
 */
export const DefaultMfeFallback: React.FC<{
  appId: string;
  error: Error;
}> = ({ appId, error }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "200px",
      backgroundColor: "#f5f5f5",
      borderRadius: "4px",
      border: "1px solid #ddd",
      color: "#666",
      fontFamily: "system-ui, -apple-system, sans-serif",
      textAlign: "center",
      padding: "20px",
    }}
  >
    <div>
      <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "bold" }}>
        {appId} failed to load
      </p>
      <p style={{ margin: "0", fontSize: "12px", color: "#999" }}>
        {error.message}
      </p>
    </div>
  </div>
);

/**
 * Hook for error handling in function components
 */
export function useErrorHandler(
  appId: string,
  onError?: (error: MfeError) => void,
) {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    logger.error(`[useErrorHandler] Error in "${appId}"`, error);

    if (onError) {
      onError({
        appId,
        code: "COMPONENT_ERROR",
        message: error.message,
        severity: "error",
        timestamp: new Date(),
        stack: error.stack,
        context: errorInfo,
        recoverable: true,
      });
    }

    throw error; // Re-throw to let error boundary catch it
  };
}
