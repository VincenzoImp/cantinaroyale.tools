'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@heroui/react';

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
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-theme-surface rounded-lg border border-theme-border">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-theme-text">
                            Something went wrong
                        </h2>
                        <p className="text-theme-muted max-w-md">
                            We encountered an error while loading this content. Please try refreshing the page.
                        </p>
                        <div className="flex gap-4">
                            <Button
                                color="primary"
                                onClick={() => window.location.reload()}
                            >
                                Refresh Page
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => this.setState({ hasError: false })}
                            >
                                Try Again
                            </Button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                <summary className="cursor-pointer text-red-800 dark:text-red-200 font-medium">
                                    Error Details (Development)
                                </summary>
                                <pre className="mt-2 text-xs text-red-700 dark:text-red-300 overflow-auto">
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
