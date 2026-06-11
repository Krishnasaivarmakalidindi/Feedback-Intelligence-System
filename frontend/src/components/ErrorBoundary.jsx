import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-6 font-sans">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="p-3.5 bg-rose-500/10 text-rose-400 rounded-full w-fit mx-auto border border-rose-500/20">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-zinc-200">Something went wrong</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              An unexpected error occurred in the dashboard rendering pipeline.
            </p>
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded text-left text-[10px] font-mono text-zinc-500 overflow-x-auto max-h-36">
              {this.state.error?.toString() || 'Unknown rendering error'}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95"
            >
              Reload Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
