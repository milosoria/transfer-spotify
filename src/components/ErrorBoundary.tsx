'use client';

import React from 'react';
import Link from 'next/link';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-300 mb-8">
              An unexpected error occurred. Please try refreshing the page or starting over.
            </p>
            <div className="space-y-4">
              <button
                onClick={this.resetError}
                className="bg-spotify-green hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 w-full"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="block text-gray-400 hover:text-white transition-colors duration-200"
              >
                ← Back to Home
              </Link>
            </div>
            {this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-gray-400 cursor-pointer">Technical Details</summary>
                <pre className="text-xs text-gray-500 mt-2 overflow-auto">
                  {this.state.error.message}
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
