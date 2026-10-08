import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Trash2, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DomoDomo RootErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReturnHome = () => {
    try {
      if (window.location.hash) {
        window.location.hash = '#/';
      }
    } catch (_) {}
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (_) {}
    this.handleReturnHome();
  };

  private handleCopyDetails = () => {
    const details = `Error: ${this.state.error?.message || 'Unknown error'}\n\nStack:\n${this.state.error?.stack || 'No stack trace'}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack || 'No component stack'}`;
    navigator.clipboard?.writeText(details).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }).catch(() => {});
  };

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'An unexpected rendering error occurred';
      const stack = this.state.error?.stack;

      return (
        <div className="min-h-screen w-full bg-[#111213] text-[#ECEBE9] flex items-center justify-center p-4 sm:p-6 select-none font-sans">
          <div className="w-full max-w-xl bg-[#18191B] border border-[#2A2D30] rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl shrink-0 mt-0.5">
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    Safe Boundary Active
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#ECEBE9] mt-2 font-heading">
                  {this.props.fallbackTitle || 'Application Encountered an Error'}
                </h1>
                <p className="text-xs sm:text-sm text-[#A3A09B] mt-1 leading-relaxed">
                  DomoDomo prevented a system crash and kept your workspace secure. Your local data remains safe.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="bg-[#111213] border border-[#2A2D30] rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-[#72706C] font-mono">
                <span>Error Diagnostic</span>
                <button
                  onClick={this.handleCopyDetails}
                  className="hover:text-white flex items-center gap-1 transition-colors text-[11px] cursor-pointer"
                  title="Copy error details"
                >
                  {this.state.copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{this.state.copied ? 'Copied' : 'Copy Details'}</span>
                </button>
              </div>
              <p className="text-xs font-mono text-rose-300 break-words leading-relaxed">
                {errorMessage}
              </p>
              {stack && (
                <details className="mt-2 text-[11px] font-mono text-[#72706C]">
                  <summary className="cursor-pointer hover:text-[#A3A09B] transition-colors py-1">
                    View Call Stack
                  </summary>
                  <pre className="mt-2 p-2 bg-black/40 rounded border border-white/5 overflow-x-auto text-[10px] text-[#A3A09B] max-h-40 leading-snug whitespace-pre-wrap">
                    {stack}
                  </pre>
                </details>
              )}
            </div>

            {/* Recovery Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-[#2A2D30]">
              <button
                onClick={this.handleReload}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleReturnHome}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#202225] hover:bg-[#2A2D30] text-[#ECEBE9] text-xs font-semibold border border-[#2A2D30] transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home size={14} />
                <span>Return to Dashboard</span>
              </button>

              <button
                onClick={this.handleResetCache}
                className="w-full sm:w-auto py-2.5 px-3 rounded-xl bg-transparent hover:bg-rose-500/10 text-[#72706C] hover:text-rose-400 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Clear local storage cache and reload"
              >
                <Trash2 size={13} />
                <span className="sm:hidden">Reset Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RootErrorBoundary;
