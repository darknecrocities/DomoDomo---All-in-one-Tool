import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  toolName?: string;
  onNavigateHome?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ToolErrorBoundary extends Component<Props, State> {
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
    console.error(`[DomoDomo ToolErrorBoundary] Caught error in ${this.props.toolName || 'tool'}:`, error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleCopy = () => {
    const text = `Tool: ${this.props.toolName || 'Unknown'}\nError: ${this.state.error?.message || 'Unknown error'}\n\nStack:\n${this.state.error?.stack || ''}`;
    navigator.clipboard?.writeText(text).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }).catch(() => {});
  };

  public render() {
    if (this.state.hasError) {
      const toolName = this.props.toolName || 'This Tool';
      const errorMessage = this.state.error?.message || 'An unexpected error occurred while executing this tool.';

      return (
        <div className="w-full my-6 p-6 sm:p-8 bg-[#18191B] border border-amber-500/30 rounded-2xl shadow-xl flex flex-col gap-5 text-left">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl shrink-0 mt-0.5">
              <AlertCircle size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Tool Execution Contained
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#ECEBE9] mt-1.5 font-heading">
                {toolName} Encountered a Problem
              </h3>
              <p className="text-xs text-[#A3A09B] mt-0.5 leading-relaxed">
                An isolated error occurred in this tool module. The rest of DomoDomo remains operational and unaffected.
              </p>
            </div>
          </div>

          <div className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-[#72706C] font-mono">
              <span>Failure Diagnosis</span>
              <button
                onClick={this.handleCopy}
                className="hover:text-white flex items-center gap-1 transition-colors text-[11px] cursor-pointer"
              >
                {this.state.copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{this.state.copied ? 'Copied' : 'Copy Diagnosis'}</span>
              </button>
            </div>
            <p className="text-xs font-mono text-amber-300 break-words leading-relaxed">
              {errorMessage}
            </p>
            {this.state.error?.stack && (
              <details className="mt-1 text-[11px] font-mono text-[#72706C]">
                <summary className="cursor-pointer hover:text-[#A3A09B] transition-colors py-0.5">
                  View Technical Stack Trace
                </summary>
                <pre className="mt-2 p-2 bg-black/40 rounded border border-white/5 overflow-x-auto text-[10px] text-[#A3A09B] max-h-36 leading-snug whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-md active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Reset Tool</span>
            </button>

            {this.props.onNavigateHome ? (
              <button
                onClick={this.props.onNavigateHome}
                className="py-2.5 px-4 rounded-xl bg-[#202225] hover:bg-[#2A2D30] text-[#ECEBE9] text-xs font-semibold border border-[#2A2D30] transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
              >
                <Home size={13} />
                <span>Return to Dashboard</span>
              </button>
            ) : (
              <a
                href="#/"
                className="py-2.5 px-4 rounded-xl bg-[#202225] hover:bg-[#2A2D30] text-[#ECEBE9] text-xs font-semibold border border-[#2A2D30] transition-all active:scale-[0.98] flex items-center gap-2"
              >
                <Home size={13} />
                <span>Return to Dashboard</span>
              </a>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ToolErrorBoundary;
