import { useState, useEffect } from 'react';
import {
  Download,
  Cpu,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sliders,
  Sparkles
} from 'lucide-react';
import { aiService } from '../../utils/aiService';

interface ModelMeta {
  id: string;
  name: string;
  size: string;
  ramRequired: string;
  description: string;
  tag: string;
}

const POPULAR_MODELS: ModelMeta[] = [
  {
    id: 'qwen-tiny',
    name: 'Qwen 2.5 (0.5B)',
    tag: 'qwen2.5:0.5b',
    size: '397 MB',
    ramRequired: '4 GB+',
    description: 'Ultra-lightweight and extremely fast model. Ideal for low-spec computers or testing.'
  },
  {
    id: 'llama-1b',
    name: 'Llama 3.2 (1B)',
    tag: 'llama3.2:1b',
    size: '1.3 GB',
    ramRequired: '8 GB+',
    description: 'Meta\'s ultra-compact model. Highly responsive, balanced reasoning, low resource footprint.'
  },
  {
    id: 'llama-3b',
    name: 'Llama 3.2 (3B)',
    tag: 'llama3.2:3b',
    size: '2.0 GB',
    ramRequired: '8 GB - 12 GB',
    description: 'Excellent multi-lingual understanding, creative writing, and summarization capabilities.'
  },
  {
    id: 'gemma-2b',
    name: 'Gemma 2 (2B)',
    tag: 'gemma2:2b',
    size: '1.6 GB',
    ramRequired: '8 GB+',
    description: 'Google\'s highly capable lightweight model. Extremely strong general knowledge.'
  },
  {
    id: 'phi3-latest',
    name: 'Phi-3 (3.8B)',
    tag: 'phi3:latest',
    size: '2.2 GB',
    ramRequired: '12 GB+',
    description: 'Microsoft\'s logic-heavy compact model. Exceptional coding syntax and math reasoning.'
  },
  {
    id: 'llama3-latest',
    name: 'Llama 3 (8B)',
    tag: 'llama3:latest',
    size: '4.7 GB',
    ramRequired: '16 GB+',
    description: 'The standard benchmark for open-source AI. Advanced logical reasoning, complex workflows.'
  }
];

export const AIOpenClawHub = () => {
  const [activeTab, setActiveTab] = useState<'hub' | 'setup'>('hub');
  const [osTab, setOsTab] = useState<'mac' | 'win' | 'linux'>('mac');
  const [isChecking, setIsChecking] = useState(false);
  const [ollamaActive, setOllamaActive] = useState(false);
  const [downloadedModels, setDownloadedModels] = useState<string[]>([]);
  
  // Model Pull Queue State
  const [pullingModel, setPullingModel] = useState<string | null>(null);
  const [pullStatus, setPullStatus] = useState<string>('');
  const [pullProgress, setPullProgress] = useState<number>(0);
  const [customModel, setCustomModel] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hardware telemetry
  const hardware = aiService.getHardwareRecommendation();

  const checkStatus = async () => {
    setIsChecking(true);
    setErrorMsg(null);
    try {
      const res = await aiService.checkOllama();
      setOllamaActive(res.status);
      setDownloadedModels(res.models);
    } catch (err) {
      setOllamaActive(false);
      setDownloadedModels([]);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handlePullModel = async (modelTag: string) => {
    if (pullingModel) return; // one pull at a time
    setErrorMsg(null);
    setPullingModel(modelTag);
    setPullStatus('Initializing download...');
    setPullProgress(0);

    try {
      await aiService.pullOllamaModel(modelTag, (status, progress) => {
        setPullStatus(status);
        setPullProgress(progress);
      });
      setPullStatus('Finished successfully!');
      setPullProgress(100);
      setTimeout(() => {
        setPullingModel(null);
        checkStatus();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to pull model. Make sure Ollama is running and OLLAMA_ORIGINS="*" is set.');
      setPullingModel(null);
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18191B] to-[#1E2022] border border-[#2A2D30] p-8 md:p-10 shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3C6B4D]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/25 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={13} />
            <span>OpenClaw Offline Engine</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#ECEBE9] tracking-tight">
            OpenClaw Model Library
          </h1>
          <p className="text-[#A3A09B] text-sm md:text-base leading-relaxed">
            Manage your local language models, pull open-weights directly from the official Ollama registry, and run high-performance AI engines offline on your hardware.
          </p>
        </div>
      </div>

      {/* Connection & Telemetry Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ollama Connection */}
        <div className="glass-card p-6 flex flex-col justify-between gap-4 bg-[#18191B]">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-[#72706C] tracking-wider">Local Ollama Status</h3>
            <div className="flex items-center gap-2.5 mt-1">
              {ollamaActive ? (
                <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-xl">
                  <CheckCircle size={14} />
                  <span>Detected (Port 11434)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-500 text-sm font-bold bg-rose-500/10 border border-rose-500/25 px-3 py-1 rounded-xl">
                  <AlertCircle size={14} />
                  <span>Offline / Not Configured</span>
                </div>
              )}
            </div>
            <p className="text-xs text-[#A3A09B] leading-relaxed">
              Ollama serves as the local server runner. Run it in the background to access local models.
            </p>
          </div>
          <button
            onClick={checkStatus}
            disabled={isChecking}
            className="btn-secondary text-xs py-2 w-full flex items-center justify-center gap-2"
          >
            <RefreshCw size={12} className={isChecking ? 'animate-spin' : ''} />
            <span>{isChecking ? 'Checking...' : 'Re-Check Connection'}</span>
          </button>
        </div>

        {/* System Diagnostics */}
        <div className="glass-card p-6 space-y-3 bg-[#18191B]">
          <h3 className="text-xs font-bold uppercase text-[#72706C] tracking-wider">Device System Diagnostics</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-[#2A2D30] pb-1.5">
              <span className="text-[#A3A09B]">Detected RAM:</span>
              <span className="font-bold text-[#ECEBE9]">{hardware.ram}</span>
            </div>
            <div className="flex justify-between border-b border-[#2A2D30] pb-1.5">
              <span className="text-[#A3A09B]">CPU Logic Cores:</span>
              <span className="font-bold text-[#ECEBE9]">{hardware.cores} threads</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A3A09B]">WebGPU Engine:</span>
              <span className={`font-bold ${hardware.hasWebGPU ? 'text-emerald-500' : 'text-[#72706C]'}`}>
                {hardware.hasWebGPU ? 'Supported' : 'Not Supported'}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-[#72706C] leading-normal pt-1">
            System memory is the primary constraint when choosing LLM parameter sizes (e.g., 1B, 3B, 7B).
          </p>
        </div>

        {/* Recommendation */}
        <div className="glass-card p-6 space-y-3 bg-[#18191B] border-[#3C6B4D]/25 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#3C6B4D]/5 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-xs font-bold uppercase text-[#72706C] tracking-wider flex items-center gap-1.5">
            <Cpu size={12} className="text-[#3C6B4D]" />
            <span>Recommended Model Setup</span>
          </h3>
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#A3A09B] block">Recommended Model:</span>
            <span className="text-sm font-bold text-emerald-500 font-mono">ollama run {hardware.recommendedModel}</span>
          </div>
          <p className="text-xs text-[#A3A09B] leading-relaxed">
            {hardware.explanation}
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-[#2A2D30] gap-4">
        <button
          onClick={() => setActiveTab('hub')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'hub'
              ? 'border-[#3C6B4D] text-[#ECEBE9]'
              : 'border-transparent text-[#72706C] hover:text-[#A3A09B]'
          }`}
        >
          Model Hub Catalog
        </button>
        <button
          onClick={() => setActiveTab('setup')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'setup'
              ? 'border-[#3C6B4D] text-[#ECEBE9]'
              : 'border-transparent text-[#72706C] hover:text-[#A3A09B]'
          }`}
        >
          Ollama Setup Guide
        </button>
      </div>

      {/* Error Message banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs flex items-start gap-2.5">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Error:</span> {errorMsg}
          </div>
        </div>
      )}

      {/* Pull Progress indicator */}
      {pullingModel && (
        <div className="glass-card p-6 space-y-4 bg-[#18191B] border-[#3C6B4D]/30 animate-pulse">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <Download size={14} className="text-[#3C6B4D] animate-bounce" />
              <span className="font-semibold">Downloading model <code className="font-mono text-[#3C6B4D]">{pullingModel}</code></span>
            </div>
            <span className="font-mono font-bold text-[#ECEBE9]">{pullProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#111213] overflow-hidden border border-[#2A2D30]">
            <div
              className="h-full bg-gradient-to-r from-[#3C6B4D] to-emerald-500 transition-all duration-300"
              style={{ width: `${pullProgress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-[#72706C]">
            <span>Status: {pullStatus}</span>
            <span>Do not close this tab during download</span>
          </div>
        </div>
      )}

      {activeTab === 'hub' ? (
        <div className="space-y-6">
          {/* Custom Model puller */}
          <div className="glass-card p-5 bg-[#18191B] flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="space-y-1 text-left">
              <h3 className="text-sm font-bold text-[#ECEBE9]">Download Custom Ollama Model</h3>
              <p className="text-xs text-[#A3A09B]">
                Enter any official model tag from the Ollama library (e.g., <code>codegemma</code>, <code>mistral:7b-instruct</code>).
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="e.g. codegemma"
                className="w-full md:w-60 px-4 py-2 text-xs rounded-xl bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] placeholder-[#72706C] focus:outline-none focus:border-[#3C6B4D]/50"
              />
              <button
                onClick={() => customModel && handlePullModel(customModel.trim())}
                disabled={!customModel || !!pullingModel}
                className="btn-primary py-2 px-4 text-xs whitespace-nowrap"
              >
                <Download size={13} />
                <span>Pull Model</span>
              </button>
            </div>
          </div>

          {/* Model Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {POPULAR_MODELS.map((model) => {
              const isDownloaded = downloadedModels.includes(model.tag);
              return (
                <div
                  key={model.id}
                  className={`glass-card p-6 flex flex-col justify-between gap-5 bg-[#18191B] border transition-all ${
                    isDownloaded ? 'border-[#3C6B4D]/20 bg-[#18191B]/80' : 'border-[#2A2D30]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#111213] px-2 py-0.5 border border-[#2A2D30] rounded-md text-[#72706C]">
                          {model.tag}
                        </span>
                        <h3 className="text-base font-extrabold text-[#ECEBE9] mt-2">{model.name}</h3>
                      </div>
                      
                      {isDownloaded ? (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle size={10} />
                          <span>Downloaded</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#A3A09B]">Size: {model.size}</span>
                      )}
                    </div>
                    
                    <p className="text-xs text-[#A3A09B] leading-relaxed">
                      {model.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#2A2D30]/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#72706C]">
                      <span>RAM Required:</span>
                      <span className="font-bold text-[#A3A09B]">{model.ramRequired}</span>
                    </div>

                    <button
                      onClick={() => handlePullModel(model.tag)}
                      disabled={isDownloaded || !!pullingModel || !ollamaActive}
                      className={`text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 border transition-all ${
                        isDownloaded
                          ? 'bg-[#1E2022] text-[#72706C] border-[#2A2D30] cursor-default'
                          : !ollamaActive
                          ? 'bg-[#1E2022] text-[#72706C] border-[#2A2D30] cursor-not-allowed opacity-55'
                          : 'bg-[#3C6B4D] hover:bg-[#2E533B] text-[#ECEBE9] border-[#4a845f]/20 shadow-sm active:scale-95'
                      }`}
                    >
                      <Download size={12} />
                      <span>{isDownloaded ? 'Installed' : 'Download Offline'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Setup Guide Tab */
        <div className="space-y-6 max-w-4xl">
          {/* OS Selector Tabs */}
          <div className="flex border-b border-[#2A2D30] gap-3">
            {(['mac', 'win', 'linux'] as const).map((os) => (
              <button
                key={os}
                onClick={() => setOsTab(os)}
                className={`pb-2.5 text-xs font-bold uppercase transition-all border-b-2 ${
                  osTab === os
                    ? 'border-[#3C6B4D] text-[#ECEBE9]'
                    : 'border-transparent text-[#72706C] hover:text-[#A3A09B]'
                }`}
              >
                {os === 'mac' ? 'macOS' : os === 'win' ? 'Windows' : 'Linux'}
              </button>
            ))}
          </div>

          <div className="space-y-6 text-xs text-[#A3A09B] leading-relaxed">
            {/* Step 1 */}
            <div className="flex gap-4 items-start bg-[#18191B] p-5 rounded-2xl border border-[#2A2D30]">
              <div className="w-6 h-6 rounded-full bg-[#3C6B4D]/15 border border-[#3C6B4D]/30 text-[#3C6B4D] flex items-center justify-center font-mono font-bold shrink-0">1</div>
              <div className="space-y-2 text-left">
                <h4 className="font-extrabold text-sm text-[#ECEBE9]">Download and Install Ollama</h4>
                <p>
                  Ollama is a local-only runner for large language models. Click below to download the application for your operating system.
                </p>
                <a
                  href="https://ollama.com/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-[#1E2022] hover:bg-[#25282B] text-[#ECEBE9] border border-[#2A2D30] px-3.5 py-1.5 rounded-lg font-semibold mt-1 transition-colors"
                >
                  <span>Go to Ollama Download Page</span>
                  <Sliders size={12} className="text-[#3C6B4D]" />
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start bg-[#18191B] p-5 rounded-2xl border border-[#2A2D30]">
              <div className="w-6 h-6 rounded-full bg-[#3C6B4D]/15 border border-[#3C6B4D]/30 text-[#3C6B4D] flex items-center justify-center font-mono font-bold shrink-0">2</div>
              <div className="space-y-3 text-left w-full">
                <h4 className="font-extrabold text-sm text-[#ECEBE9]">Configure CORS Isolation (Required)</h4>
                <p>
                  Since DomoDomo runs fully sandboxed within your browser tab, the local Ollama server must allow cross-origin requests from browsers. Configure CORS by setting the environment variable <code>OLLAMA_ORIGINS="*"</code>:
                </p>

                {osTab === 'mac' && (
                  <div className="space-y-3">
                    <p className="font-semibold text-xs text-[#ECEBE9]">For the macOS Terminal:</p>
                    <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl font-mono text-[10px] text-[#3C6B4D] overflow-x-auto">
                      <code>OLLAMA_ORIGINS="*" ollama serve</code>
                    </pre>
                    <p className="font-semibold text-xs text-[#ECEBE9] pt-1">For the GUI App (Permanent settings):</p>
                    <p>Open Terminal and run the following command to set environment variables permanently, then restart Ollama app:</p>
                    <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl font-mono text-[10px] text-[#3C6B4D] overflow-x-auto">
                      <code>launchctl setenv OLLAMA_ORIGINS "*"</code>
                    </pre>
                  </div>
                )}

                {osTab === 'win' && (
                  <div className="space-y-2">
                    <p>1. Right-click on the Start Menu and select <strong>Settings ➜ System ➜ About</strong>.</p>
                    <p>2. Click <strong>Advanced system settings</strong> on the right.</p>
                    <p>3. In the System Properties window, click <strong>Environment Variables</strong>.</p>
                    <p>4. Under <strong>User Variables</strong> (or System Variables), click <strong>New...</strong></p>
                    <p>5. Enter variable name: <code className="text-emerald-500">OLLAMA_ORIGINS</code> and variable value: <code className="text-emerald-500">*</code></p>
                    <p>6. Click OK, close System Settings, and restart Ollama from the Windows System Tray.</p>
                  </div>
                )}

                {osTab === 'linux' && (
                  <div className="space-y-3">
                    <p>For systemd configurations (standard install), edit the service file:</p>
                    <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl font-mono text-[10px] text-[#3C6B4D] overflow-x-auto">
                      <code>sudo systemctl edit ollama.service</code>
                    </pre>
                    <p>Add the following section under the editor, save, and exit:</p>
                    <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl font-mono text-[10px] text-[#3C6B4D] overflow-x-auto">
                      <code>[Service]
Environment="OLLAMA_ORIGINS=*"</code>
                    </pre>
                    <p>Reload daemon settings and restart the service:</p>
                    <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl font-mono text-[10px] text-[#3C6B4D] overflow-x-auto">
                      <code>sudo systemctl daemon-reload
sudo systemctl restart ollama</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start bg-[#18191B] p-5 rounded-2xl border border-[#2A2D30]">
              <div className="w-6 h-6 rounded-full bg-[#3C6B4D]/15 border border-[#3C6B4D]/30 text-[#3C6B4D] flex items-center justify-center font-mono font-bold shrink-0">3</div>
              <div className="space-y-2 text-left">
                <h4 className="font-extrabold text-sm text-[#ECEBE9]">Verify Offline Readiness</h4>
                <p>
                  Go to the <strong>Model Hub Catalog</strong> tab above and press "Re-Check Connection". If detected, you are ready to pull models and run offline AI tools like the DomoDomo Selection Explainer!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AIOpenClawHub;
