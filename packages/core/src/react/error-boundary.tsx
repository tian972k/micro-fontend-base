import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { mfeLogger } from "../logger";

interface Props {
  children: ReactNode;
  mfeId?: string;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * MFE Error Boundary
 * Isolates errors per MFE to prevent cascade failures
 */
export class MfeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { mfeId, onError } = this.props;

    // Log error
    mfeLogger.errorWithStack(mfeId ? `MFE:${mfeId}` : "ErrorBoundary", error);

    // Store error info
    this.setState({ errorInfo });

    // Call custom error handler
    onError?.(error, errorInfo);

    // Send to monitoring in production
    if (!import.meta.env?.DEV && typeof window !== "undefined") {
      this.sendToMonitoring(error, errorInfo);
    }
  }

  private sendToMonitoring(error: Error, errorInfo: ErrorInfo) {
    // Send to Sentry, Datadog, etc.
    if ((window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        tags: {
          mfe: this.props.mfeId || "unknown",
          component: "ErrorBoundary",
        },
        extra: {
          componentStack: errorInfo.componentStack,
        },
      });
    }

    // Log to custom endpoint
    fetch("/api/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mfeId: this.props.mfeId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, mfeId } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.handleReset);
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          mfeId={mfeId}
          onReset={this.handleReset}
        />
      );
    }

    return children;
  }
}

interface FallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  mfeId?: string;
  onReset: () => void;
}

function DefaultErrorFallback({
  error,
  errorInfo,
  mfeId,
  onReset,
}: FallbackProps) {
  const isDev = import.meta.env?.DEV;

  return (
    <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-start gap-3">
        <span className="text-2xl">❌</span>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 dark:text-red-100">
            {mfeId ? `MFE Error: ${mfeId}` : "Something went wrong"}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {error.message}
          </p>

          {isDev && errorInfo && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-red-800 dark:text-red-200">
                Error Details (Dev Mode)
              </summary>
              <pre className="mt-2 p-3 bg-red-100 dark:bg-red-900/50 rounded text-xs overflow-auto max-h-60">
                <code className="text-red-900 dark:text-red-100">
                  {error.stack}
                  {"\n\n"}
                  Component Stack:
                  {errorInfo.componentStack}
                </code>
              </pre>
            </details>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={onReset}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * HOC to wrap component with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  mfeId?: string,
) {
  return function WithErrorBoundary(props: P) {
    return (
      <MfeErrorBoundary mfeId={mfeId}>
        <Component {...props} />
      </MfeErrorBoundary>
    );
  };
}
