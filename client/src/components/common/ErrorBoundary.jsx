import { Component } from 'react';

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child component tree and shows
 * a fallback UI instead of crashing the entire app.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <MyComponent />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary fallback={<CustomError />}>
 *     <MyComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        // Log to error reporting service in production
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Recover from stale chunk/module failures after deploys (common with cached assets).
        const message = String(error?.message || error || '');
        const isChunkLoadFailure = /ChunkLoadError|Failed to fetch dynamically imported module|Importing a module script failed/i.test(message);

        if (isChunkLoadFailure && typeof window !== 'undefined') {
            const reloadGuardKey = 'upro:chunk-recovery-attempted';
            if (!sessionStorage.getItem(reloadGuardKey)) {
                sessionStorage.setItem(reloadGuardKey, '1');

                const forceReload = async () => {
                    try {
                        if ('serviceWorker' in navigator) {
                            const registrations = await navigator.serviceWorker.getRegistrations();
                            await Promise.allSettled(registrations.map((reg) => reg.unregister()));
                        }

                        if ('caches' in window) {
                            const keys = await caches.keys();
                            await Promise.allSettled(keys.map((key) => caches.delete(key)));
                        }
                    } catch (_err) {
                        // Ignore cleanup failures and still force reload.
                    }

                    const url = new URL(window.location.href);
                    url.searchParams.set('_cb', String(Date.now()));
                    window.location.replace(url.toString());
                };

                void forceReload();
            }
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleHardRefresh = async () => {
        try {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                await Promise.allSettled(registrations.map((reg) => reg.unregister()));
            }

            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.allSettled(keys.map((key) => caches.delete(key)));
            }
        } catch (_err) {
            // Ignore cleanup failures and force reload anyway.
        }

        const url = new URL(window.location.href);
        url.searchParams.set('_cb', String(Date.now()));
        window.location.replace(url.toString());
    };

    render() {
        if (this.state.hasError) {
            // Allow custom fallback
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center px-4 py-12">
                    <div className="max-w-md w-full text-center">
                        {/* Error Icon */}
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.502-1.32.712-2.098L13.632 4.73c-.79-.779-2.474-.779-3.264 0L3.306 16.902C2.516 17.68 2.964 19 4.018 19z"
                                />
                            </svg>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            An unexpected error occurred. Please try again.
                        </p>

                        {/* Error details in development */}
                        {import.meta.env.DEV && this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                    Error Details
                                </summary>
                                <pre className="mt-2 p-3 rounded-lg bg-gray-100 dark:bg-dark-800 text-xs text-red-600 dark:text-red-400 overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-6 py-2.5 bg-gradient-to-r from-brand-500 to-accent-500 text-white rounded-lg font-medium hover:from-brand-600 hover:to-accent-600 transition-all shadow-lg shadow-brand-500/25"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={this.handleHardRefresh}
                                className="px-6 py-2.5 rounded-lg font-medium border border-brand-300 dark:border-brand-700 text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                            >
                                Hard Refresh App
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2.5 rounded-lg font-medium border border-gray-200 dark:border-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
