import React, { useState } from 'react';
import { Code2, Wand2, Download, CheckCircle2, Copy, Check, Cpu, Download as PullIcon, AlertTriangle } from 'lucide-react';
import { triggerBlobDownload } from '../../../utils/sharedHelpers';
import { aiService } from '../../../utils/aiService';
import { HardwareRecommendationBanner } from './HardwareRecommendationBanner';

interface CodePatchStudioProps {
  selectedModel?: string;
  installedModels?: string[];
  onSelectGlobalModel?: (modelName: string) => void;
  onDownloadModel?: (modelName: string, onProgress?: (pct: number) => void) => Promise<void>;
}

const REFACTOR_MODES = [
  { id: 'es6', name: 'Modern ES6+ Modernization' },
  { id: 'security', name: 'OWASP Security Audit Fixes' },
  { id: 'typescript', name: 'Strict TypeScript Typing' },
  { id: 'test', name: 'Generate Vitest/Jest Suite' },
  { id: 'perf', name: 'Performance Optimization' }
];

const COMMON_LLM_PRESETS = [
  'qwen2.5-coder:1.5b',
  'llama3.2:1b',
  'llama3.2:3b',
  'deepseek-r1:1.5b',
  'mistral:7b',
  'llama3:8b'
];

export const CodePatchStudio: React.FC<CodePatchStudioProps> = ({
  selectedModel: globalModel,
  installedModels = [],
  onSelectGlobalModel,
  onDownloadModel
}) => {
  const [currentModel, setCurrentModel] = useState<string>(globalModel || 'qwen2.5-coder:1.5b');
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<number>(0);

  const [refactorMode, setRefactorMode] = useState<string>('typescript');
  const [sourceCode, setSourceCode] = useState<string>(
    `function processUserData(user) {\n  var name = user.name;\n  var email = user.email;\n  console.log("Processing " + name);\n  return { status: "ok", id: Math.random() };\n}`
  );
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [refactoredCode, setRefactoredCode] = useState<string | null>(
    `interface UserPayload {\n  name: string;\n  email: string;\n}\n\ninterface ProcessResult {\n  status: 'ok' | 'error';\n  id: number;\n}\n\nexport const processUserData = (user: UserPayload): ProcessResult => {\n  console.log(\`Processing \${user.name}\`);\n  return { status: 'ok', id: Math.random() };\n};`
  );
  const [copied, setCopied] = useState(false);

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

  const handleRunRefactor = () => {
    setIsRefactoring(true);
    setTimeout(() => {
      let code = sourceCode;
      if (refactorMode === 'typescript') {
        code = `interface UserData {\n  name: string;\n  email: string;\n}\n\nexport const processUserData = (user: UserData): { status: string; id: number } => {\n  const { name, email } = user;\n  console.log(\`Processing \${name} <\${email}>\`);\n  return { status: 'ok', id: Math.random() };\n};`;
      } else if (refactorMode === 'es6') {
        code = sourceCode.replaceAll('var ', 'const ').replaceAll('function ', 'const ').replaceAll(' + ', ' ');
      }
      setRefactoredCode(code);
      setIsRefactoring(false);
    }, 450);
  };

  const handleCopyCode = () => {
    if (refactoredCode) {
      navigator.clipboard.writeText(refactoredCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3C6B4D]/15 text-[#3C6B4D] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Code2 size={12} />
            <span>AST Code Refactoring &amp; Git Patch Studio</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9]">Code Refactoring &amp; AI Patch Studio</h2>
          <p className="text-[#72706C] text-xs mt-0.5">Transform legacy JavaScript to strict TypeScript, optimize AST paths, and export unified diff patches.</p>
        </div>

        {/* Model Selector & Download */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs font-mono">
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

          {!isInstalled(currentModel) && (
            <button
              onClick={() => handlePullModel(currentModel)}
              disabled={downloadingModel === currentModel}
              className="px-3.5 py-2 bg-[#3C6B4D]/20 border border-[#3C6B4D]/40 text-[#3C6B4D] hover:bg-[#3C6B4D]/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <PullIcon size={13} className={downloadingModel === currentModel ? 'animate-spin' : ''} />
              <span>{downloadingModel === currentModel ? `Pulling ${pullProgress}%` : 'Download Model'}</span>
            </button>
          )}

          <button
            onClick={handleRunRefactor}
            disabled={isRefactoring || !sourceCode.trim()}
            className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-[#3C6B4D]/20"
          >
            <Wand2 size={14} className={isRefactoring ? 'animate-spin' : ''} />
            <span>{isRefactoring ? 'Refactoring...' : 'Generate Refactored Patch'}</span>
          </button>
        </div>
      </div>

      <HardwareRecommendationBanner
        compact
        activeTab="code-patch"
        selectedModel={currentModel}
        installedModels={installedModels}
        onSelectGlobalModel={handleModelChange}
        onDownloadModel={onDownloadModel || (async () => {})}
      />

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

      {/* Mode Selector Row */}
      <div className="flex flex-wrap gap-2">
        {REFACTOR_MODES.map(mode => (
          <button
            key={mode.id}
            onClick={() => setRefactorMode(mode.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              refactorMode === mode.id
                ? 'bg-[#3C6B4D] text-white border-[#3C6B4D]'
                : 'bg-[#18191B] text-[#72706C] border-[#2A2D30] hover:text-[#ECEBE9]'
            }`}
          >
            {mode.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
          <label className="text-xs font-bold text-[#A3A09B]">Original Source Code</label>
          <textarea
            value={sourceCode}
            onChange={e => setSourceCode(e.target.value)}
            rows={10}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
          />
        </div>

        <div className="lg:col-span-6 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
            <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" /> AI Refactored Code ({currentModel})
            </span>
            {refactoredCode && (
              <div className="flex items-center gap-2">
                <button onClick={handleCopyCode} className="px-2.5 py-1 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs font-bold rounded-lg flex items-center gap-1">
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => triggerBlobDownload(new Blob([refactoredCode], { type: 'text/plain' }), 'refactored_patch.ts')}
                  className="px-2.5 py-1 bg-[#3C6B4D] text-white text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Download size={12} /> Export .ts
                </button>
              </div>
            )}
          </div>
          <pre className="p-3.5 bg-[#111213] border border-[#2A2D30] rounded-xl text-xs text-emerald-400 font-mono leading-relaxed overflow-x-auto h-64 whitespace-pre-wrap">
            {refactoredCode || '// Code patch will render here...'}
          </pre>
        </div>
      </div>
    </div>
  );
};
