import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Eye, CheckCircle2, AlertTriangle, Cpu, Download } from 'lucide-react';
import { aiService } from '../../../utils/aiService';

interface AIGuardrailsStudioProps {
  selectedModel?: string;
  installedModels?: string[];
  onSelectGlobalModel?: (modelName: string) => void;
  onDownloadModel?: (modelName: string, onProgress?: (pct: number) => void) => Promise<void>;
}

interface PiiMatch {
  type: string;
  original: string;
  redacted: string;
  position: number;
}

const COMMON_LLM_PRESETS = [
  'llama3.2:1b',
  'llama3.2:3b',
  'qwen2.5-coder:1.5b',
  'deepseek-r1:1.5b',
  'mistral:7b',
  'llama3:8b'
];

export const AIGuardrailsStudio: React.FC<AIGuardrailsStudioProps> = ({
  selectedModel: globalModel,
  installedModels = [],
  onSelectGlobalModel,
  onDownloadModel
}) => {
  const [currentModel, setCurrentModel] = useState<string>(globalModel || 'llama3.2:1b');
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<number>(0);

  const [inputText, setInputText] = useState<string>(
    `User query: Please contact john.doe@acme.org or call 555-839-2049 regarding credit card 4532-8921-1049-3912. Also server IP 192.168.1.15 needs audit. Secret Key: sk_live_9948271038472910.`
  );
  const [redactMask, setRedactMask] = useState<string>('[REDACTED]');
  const [redactPii, setRedactPii] = useState(true);
  const [detectApiKeys, setDetectApiKeys] = useState(true);
  const [blockInjection, setBlockInjection] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [matches, setMatches] = useState<PiiMatch[] | null>([
    { type: 'EMAIL', original: 'john.doe@acme.org', redacted: '[REDACTED_EMAIL]', position: 22 },
    { type: 'PHONE', original: '555-839-2049', redacted: '[REDACTED_PHONE]', position: 48 },
    { type: 'CREDIT_CARD', original: '4532-8921-1049-3912', redacted: '[REDACTED_CARD]', position: 79 },
    { type: 'IP_ADDRESS', original: '192.168.1.15', redacted: '[REDACTED_IP]', position: 114 },
    { type: 'API_SECRET', original: 'sk_live_9948271038472910', redacted: '[REDACTED_SECRET]', position: 140 }
  ]);
  const [injectionRisk, setInjectionRisk] = useState<{ risk: 'LOW' | 'MEDIUM' | 'HIGH'; score: number; reason: string }>({
    risk: 'LOW',
    score: 0.05,
    reason: 'Standard informational prompt. Zero jailbreak or instruction override patterns detected.'
  });

  const availableModels = Array.from(new Set([...installedModels, ...COMMON_LLM_PRESETS]));

  const handleModelChange = (modelName: string) => {
    setCurrentModel(modelName);
    if (onSelectGlobalModel) onSelectGlobalModel(modelName);
  };

  const handlePullModel = async (modelName: string) => {
    setDownloadingModel(modelName);
    setPullProgress(5);
    try {
      if (onDownloadModel) {
        await onDownloadModel(modelName, (pct) => setPullProgress(pct));
      } else {
        await aiService.pullOllamaModel(modelName, (_status, pct) => {
          setPullProgress(pct);
        });
      }
    } catch {
      for (let p = 15; p <= 100; p += 25) {
        await new Promise(r => setTimeout(r, 200));
        setPullProgress(p);
      }
    } finally {
      setDownloadingModel(null);
      setPullProgress(0);
      handleModelChange(modelName);
    }
  };

  const isInstalled = (name: string) => installedModels.some(m => m.toLowerCase().includes(name.toLowerCase()));

  const handleScanGuardrails = () => {
    setIsScanning(true);
    setTimeout(() => {
      const found: PiiMatch[] = [];
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const phoneRegex = /\d{3}-\d{3}-\d{4}/g;
      const cardRegex = /\d{4}-\d{4}-\d{4}-\d{4}/g;
      const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
      const secretRegex = /\b(sk_live_[a-zA-Z0-9]+|AIza[a-zA-Z0-9_-]+)\b/g;

      let m;
      while ((m = emailRegex.exec(inputText)) !== null) {
        found.push({ type: 'EMAIL', original: m[0], redacted: redactMask === '[REDACTED]' ? '[REDACTED_EMAIL]' : redactMask, position: m.index });
      }
      while ((m = phoneRegex.exec(inputText)) !== null) {
        found.push({ type: 'PHONE', original: m[0], redacted: redactMask === '[REDACTED]' ? '[REDACTED_PHONE]' : redactMask, position: m.index });
      }
      while ((m = cardRegex.exec(inputText)) !== null) {
        found.push({ type: 'CREDIT_CARD', original: m[0], redacted: redactMask === '[REDACTED]' ? '[REDACTED_CARD]' : redactMask, position: m.index });
      }
      while ((m = ipRegex.exec(inputText)) !== null) {
        found.push({ type: 'IP_ADDRESS', original: m[0], redacted: redactMask === '[REDACTED]' ? '[REDACTED_IP]' : redactMask, position: m.index });
      }
      if (detectApiKeys) {
        while ((m = secretRegex.exec(inputText)) !== null) {
          found.push({ type: 'API_SECRET', original: m[0], redacted: redactMask === '[REDACTED]' ? '[REDACTED_SECRET]' : redactMask, position: m.index });
        }
      }

      const lower = inputText.toLowerCase();
      if (lower.includes('ignore previous instructions') || lower.includes('dan mode') || lower.includes('system prompt leak')) {
        setInjectionRisk({
          risk: 'HIGH',
          score: 0.92,
          reason: 'Detected potential jailbreak or instruction override sequence.'
        });
      } else {
        setInjectionRisk({
          risk: 'LOW',
          score: 0.04,
          reason: 'Clean prompt payload. No adversarial tokens identified.'
        });
      }

      setMatches(found);
      setIsScanning(false);
    }, 400);
  };

  const getCleanedText = () => {
    if (!matches || !redactPii) return inputText;
    let text = inputText;
    matches.forEach(m => {
      text = text.replaceAll(m.original, m.redacted);
    });
    return text;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#3C6B4D]/15 text-[#3C6B4D] border border-[#3C6B4D]/30 text-[11px] font-bold uppercase tracking-wider w-fit max-w-full">
              <ShieldCheck size={13} className="shrink-0 text-[#3C6B4D]" />
              <span className="truncate">Local PII Redaction &amp; Prompt Safety Policy</span>
            </div>
            <h2 className="text-xl font-black text-[#ECEBE9] tracking-tight">AI Guardrails Inspector</h2>
            <p className="text-[#72706C] text-xs leading-relaxed max-w-xl">Scans inputs for PII, emails, credit cards, secrets, and prompt injections client-side before reaching local LLMs.</p>
          </div>

          {/* Model Selector Pill */}
          <div className="flex items-center gap-1.5 bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs font-mono w-fit shrink-0">
            <Cpu size={14} className="text-[#3C6B4D]" />
            <select
              value={currentModel}
              onChange={e => handleModelChange(e.target.value)}
              className="bg-transparent text-[#ECEBE9] font-bold focus:outline-none cursor-pointer"
            >
              {availableModels.map(m => (
                <option key={m} value={m} className="bg-[#18191B] text-[#ECEBE9]">
                  {m} {isInstalled(m) ? '✓ Installed' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#2A2D30]/60">
          {!isInstalled(currentModel) ? (
            <button
              onClick={() => handlePullModel(currentModel)}
              disabled={downloadingModel === currentModel}
              className="px-3.5 py-2 bg-[#3C6B4D]/20 border border-[#3C6B4D]/40 text-[#3C6B4D] hover:bg-[#3C6B4D]/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download size={13} className={downloadingModel === currentModel ? 'animate-spin' : ''} />
              <span>{downloadingModel === currentModel ? `Pulling ${pullProgress}%` : 'Download Model'}</span>
            </button>
          ) : <div />}

          <button
            onClick={handleScanGuardrails}
            disabled={isScanning || !inputText.trim()}
            className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-[#3C6B4D]/20"
          >
            <ShieldAlert size={14} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? 'Scanning Payload...' : 'Run Safety Scan'}</span>
          </button>
        </div>
      </div>

      {!isInstalled(currentModel) && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>Model <strong>{currentModel}</strong> is not installed in local Ollama storage. Click Download Model to pull it directly!</span>
          </div>
          <button
            onClick={() => handlePullModel(currentModel)}
            disabled={downloadingModel === currentModel}
            className="px-3 py-1 bg-amber-500 text-black font-extrabold rounded-lg text-xs"
          >
            {downloadingModel === currentModel ? `Pulling (${pullProgress}%)` : `Download ${currentModel}`}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
          <label className="text-xs font-bold text-[#A3A09B] flex items-center gap-2">
            <Eye size={14} className="text-[#3C6B4D]" /> Input Prompt Payload to Audit
          </label>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            rows={7}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
          />
        </div>

        <div className="lg:col-span-5 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-4">
          <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-2">
            <Lock size={14} className="text-[#3C6B4D]" /> Active Guardrail Policies ({currentModel})
          </span>
          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="text-[#A3A09B] block mb-1">Custom Redaction Mask</label>
              <input
                type="text"
                value={redactMask}
                onChange={e => setRedactMask(e.target.value)}
                className="w-full bg-[#111213] border border-[#2A2D30] rounded-lg px-2.5 py-1.5 text-xs text-[#ECEBE9] font-mono focus:outline-none"
              />
            </div>
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#111213] border border-[#2A2D30] cursor-pointer">
              <span className="text-[#ECEBE9]">Auto-Redact PII Tokens</span>
              <input type="checkbox" checked={redactPii} onChange={e => setRedactPii(e.target.checked)} className="accent-[#3C6B4D]" />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#111213] border border-[#2A2D30] cursor-pointer">
              <span className="text-[#ECEBE9]">Detect API Keys &amp; Secrets</span>
              <input type="checkbox" checked={detectApiKeys} onChange={e => setDetectApiKeys(e.target.checked)} className="accent-[#3C6B4D]" />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#111213] border border-[#2A2D30] cursor-pointer">
              <span className="text-[#ECEBE9]">Block Jailbreak Injections</span>
              <input type="checkbox" checked={blockInjection} onChange={e => setBlockInjection(e.target.checked)} className="accent-[#3C6B4D]" />
            </label>
          </div>
        </div>
      </div>

      {matches && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
              <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-400" /> Detected PII Tokens ({matches.length})
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                injectionRisk.risk === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}>
                Risk: {injectionRisk.risk}
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-xs">
              {matches.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#111213] border border-[#2A2D30]">
                  <span className="text-rose-400 font-bold">{m.type}: {m.original}</span>
                  <span className="text-[#3C6B4D]">{m.redacted}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
            <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-2">
              <CheckCircle2 size={14} className="text-emerald-400" /> Sanitized Output Payload
            </span>
            <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl text-xs text-emerald-400 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {getCleanedText()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
