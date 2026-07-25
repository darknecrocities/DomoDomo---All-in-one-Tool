import React, { useEffect, useState } from 'react';
import { ShieldAlert, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { aiService } from '../utils/aiService';

interface LocalAISetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName?: string;
  categoryName?: string;
}

export const LocalAISetupModal: React.FC<LocalAISetupModalProps> = ({
  isOpen,
  onClose,
  toolName,
  categoryName = 'Investigative Research & Local AI',
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [detectedModels, setDetectedModels] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '';

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const res = await aiService.checkOllama();
      setIsOnline(res.status);
      if (res.status) {
        setDetectedModels(res.models);
        // Auto close after 1.5s if connected
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (e) {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl max-w-2xl w-full p-6 flex flex-col gap-6 text-left shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#2A2D30] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#E29E2D]/10 border border-[#E29E2D]/20 text-[#E29E2D] rounded-xl shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#E29E2D]/10 text-[#E29E2D] border border-[#E29E2D]/20">
                  Local LLM Required
                </span>
                {categoryName && (
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20">
                    {categoryName}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-[#ECEBE9] mt-1">
                {toolName ? `Unlock "${toolName}"` : 'Local AI Engine Offline'}
              </h2>
              <p className="text-xs text-[#A3A09B] mt-0.5">
                This tool requires a local Ollama LLM running on your machine to preserve 100% data privacy.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#25282B] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Status indicator */}
        <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-[#3C6B4D] animate-pulse' : 'bg-rose-500'}`} />
            <div>
              <span className="text-xs font-bold text-[#ECEBE9] block">
                Status: {isOnline ? 'Connected to Local Ollama' : 'Ollama Offline / Not Detected'}
              </span>
              <span className="text-[10px] text-[#72706C]">
                {isOnline
                  ? `${detectedModels.length} models ready (${detectedModels.join(', ')})`
                  : 'http://localhost:11434/api/tags ping failed'}
              </span>
            </div>
          </div>

          <button
            onClick={checkConnection}
            disabled={isChecking}
            className="btn-secondary py-1.5 px-3 text-xs font-semibold shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={isChecking ? 'animate-spin' : ''} />
            <span>{isChecking ? 'Checking...' : 'Retry Connection'}</span>
          </button>
        </div>

        {isOnline ? (
          <div className="bg-[#3C6B4D]/10 border border-[#3C6B4D]/30 p-4 rounded-xl text-center flex flex-col items-center gap-2">
            <CheckCircle2 size={28} className="text-[#3C6B4D]" />
            <h4 className="text-sm font-bold text-[#ECEBE9]">Local AI Connection Active!</h4>
            <p className="text-xs text-[#A3A09B]">Closing setup window and unlocking tool...</p>
          </div>
        ) : (
          /* Step-by-step Setup instructions */
          <div className="flex flex-col gap-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#A3A09B]">
              Follow these 3 quick steps to enable Local AI:
            </h3>

            {/* Step 1 */}
            <div className="flex flex-col gap-2 bg-[#111213] border border-[#2A2D30] p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#ECEBE9] flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#3C6B4D]/20 text-[#3C6B4D] flex items-center justify-center text-xs font-mono">
                    1
                  </span>
                  Run DomoDomo Locally
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isLocal ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'bg-rose-500/20 text-rose-400'}`}>
                  {isLocal ? '✓ Passed (Localhost)' : '⚠️ Hosted Online'}
                </span>
              </div>
              <p className="text-xs text-[#A3A09B]">
                Due to browser CORS & mixed content rules, websites on <code className="text-[#3C6B4D]">https://</code> cannot reach your local machine ports directly. Run DomoDomo locally:
              </p>
              <div className="bg-[#18191B] p-3 rounded-lg border border-[#2A2D30] font-mono text-[11px] text-[#ECEBE9] relative group">
                <pre className="overflow-x-auto whitespace-pre-wrap">
{`git clone https://github.com/darknecrocities/DomoDomo---All-in-one-Tool.git
cd DomoDomo---All-in-one-Tool
npm install
npm run dev`}
                </pre>
                <button
                  onClick={() => copyToClipboard('git clone https://github.com/darknecrocities/DomoDomo---All-in-one-Tool.git && cd DomoDomo---All-in-one-Tool && npm install && npm run dev', 'step1')}
                  className="absolute top-2 right-2 px-2 py-1 bg-[#25282B] text-[10px] text-[#A3A09B] hover:text-[#ECEBE9] rounded border border-[#2A2D30]"
                >
                  {copySuccess === 'step1' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-2 bg-[#111213] border border-[#2A2D30] p-4 rounded-xl">
              <span className="text-xs font-bold text-[#ECEBE9] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#3C6B4D]/20 text-[#3C6B4D] flex items-center justify-center text-xs font-mono">
                  2
                </span>
                Install Ollama & Download Model
              </span>
              <p className="text-xs text-[#A3A09B]">
                Download Ollama from <a href="https://ollama.com" target="_blank" rel="noreferrer" className="text-[#3C6B4D] underline font-semibold">ollama.com</a> and start your preferred model:
              </p>
              <div className="bg-[#18191B] p-3 rounded-lg border border-[#2A2D30] font-mono text-[11px] text-[#ECEBE9] relative group">
                <pre className="overflow-x-auto">ollama run llama3.2</pre>
                <button
                  onClick={() => copyToClipboard('ollama run llama3.2', 'step2')}
                  className="absolute top-2 right-2 px-2 py-1 bg-[#25282B] text-[10px] text-[#A3A09B] hover:text-[#ECEBE9] rounded border border-[#2A2D30]"
                >
                  {copySuccess === 'step2' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-2 bg-[#111213] border border-[#2A2D30] p-4 rounded-xl">
              <span className="text-xs font-bold text-[#ECEBE9] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#3C6B4D]/20 text-[#3C6B4D] flex items-center justify-center text-xs font-mono">
                  3
                </span>
                Enable Browser CORS Access
              </span>
              <p className="text-xs text-[#A3A09B]">
                Set <code className="text-[#3C6B4D] font-mono">OLLAMA_ORIGINS="*"</code> environment variable before starting Ollama:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                <div className="bg-[#18191B] p-2.5 rounded border border-[#2A2D30]">
                  <span className="text-[#E29E2D] font-bold block mb-1">Windows (PowerShell/CMD):</span>
                  <code className="text-[#A3A09B] font-mono block">set OLLAMA_ORIGINS="*"</code>
                </div>
                <div className="bg-[#18191B] p-2.5 rounded border border-[#2A2D30]">
                  <span className="text-[#E29E2D] font-bold block mb-1">macOS / Linux:</span>
                  <code className="text-[#A3A09B] font-mono block">OLLAMA_ORIGINS="*" ollama serve</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-[#2A2D30]">
          <button
            onClick={onClose}
            className="btn-secondary py-2 px-4 text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={checkConnection}
            disabled={isChecking}
            className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw size={14} className={isChecking ? 'animate-spin' : ''} />
            <span>Check & Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
