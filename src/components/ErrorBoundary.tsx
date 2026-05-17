"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-line bg-surface p-8">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-ink">
                            Something went wrong
                        </h2>
                        <p className="max-w-md text-muted">
                            We encountered an error while loading this content. Please try refreshing the page.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <button
                                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-strong"
                                onClick={() => window.location.reload()}
                                type="button"
                            >
                                Refresh page
                            </button>
                            <button
                                className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-soft"
                                onClick={() => this.setState({ hasError: false })}
                                type="button"
                            >
                                Try again
                            </button>
                        </div>
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <details className="mt-4 rounded-md border border-line bg-danger-soft p-4">
                                <summary className="cursor-pointer font-medium text-danger">
                                    Error details
                                </summary>
                                <pre className="mt-2 overflow-auto text-xs text-danger">
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
