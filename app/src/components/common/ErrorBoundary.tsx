import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  hasError: boolean;
}

// Keeps one broken component from blanking the whole site.
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("UI error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="mx-auto max-w-xl px-6 pt-36 pb-24 text-center">
        <h1 className="font-display text-3xl text-forest-800 mb-3">Something went off the trail</h1>
        <p className="text-forest-700/70 mb-6">An unexpected error happened. Reloading usually fixes it.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-terra-400 text-white font-medium rounded-full hover:bg-terra-600 transition-colors"
        >
          Reload the page
        </button>
      </div>
    );
  }
}
