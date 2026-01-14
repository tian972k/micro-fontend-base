import React, { Component, type ReactNode } from "react";
import { Button } from "@repo/ui";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class MfeErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(`[MfeErrorBoundary] Error in ${this.props.name || "MicroApp"}:`, error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="p-6 border-2 border-red-200 bg-red-50 rounded-lg flex flex-col items-center justify-center text-center gap-2 h-full min-h-[200px]">
                    <h3 className="text-lg font-bold text-red-800">Application Error</h3>
                    <p className="text-red-600 text-sm max-w-md">
                        {this.props.name || "This component"} encountered a problem and cannot be displayed.
                    </p>
                    {this.state.error && (
                        <div className="text-xs text-left bg-white p-2 border rounded w-full max-w-sm overflow-auto max-h-32 font-mono text-red-500 mt-2">
                            {this.state.error.message}
                        </div>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 border-red-200 hover:bg-red-100 text-red-700"
                        onClick={this.handleRetry}
                    >
                        Retry
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
