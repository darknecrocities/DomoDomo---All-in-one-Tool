import { useState } from 'react';
import { Code, Loader2, Copy, Check, Sparkles, Download, RefreshCw, BookOpen, Shield, Languages } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

const LANGUAGES = ['Python', 'JavaScript', 'TypeScript', 'Rust', 'Go', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin'];

type HistoryEntry = { code: string; lang: string; explanation: string; timestamp: string };

export const AICodeExplainerTool = () => {
  const [code, setCode] = useState(`function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}`);
  const [detectedLang, setDetectedLang] = useState('JavaScript');
  const [explanation, setExplanation] = useState('');
  const [complexity, setComplexity] = useState('');
  const [docstring, setDocstring] = useState('');
  const [vulnerabilities, setVulnerabilities] = useState('');
  const [translatedCode, setTranslatedCode] = useState('');
  const [targetLang, setTargetLang] = useState('Python');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'explain' | 'optimize' | 'docstring' | 'security' | 'translate'>('explain');
  const [statusMsg, setStatusMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are an expert software engineer and code analyst. Provide clear, accurate, and structured analysis.');
  const [temperature, setTemperature] = useState(0.3);
  const [maxTokens, setMaxTokens] = useState(300);

  const detectLanguage = (src: string): string => {
    if (src.includes('def ') && src.includes(':')) return 'Python';
    if (src.includes('fn ') && src.includes('->')) return 'Rust';
    if (src.includes('func ') && src.includes('fmt.')) return 'Go';
    if (src.includes('public class') || src.includes('System.out')) return 'Java';
    if (src.includes('console.log') || src.includes('=>')) return 'JavaScript';
    if (src.includes(': string') || src.includes(': number')) return 'TypeScript';
    return 'Unknown';
  };

  const runExplain = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const lang = detectLanguage(code);
    setDetectedLang(lang);
    setStatusMsg('Analyzing code...');
    try {
      const result = await aiService.generateText(
        `Explain this ${lang} code in plain English. Break it down step by step. Be concise but thorough:\n\`\`\`${lang}\n${code}\n\`\`\``,
        maxTokens,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );
      setExplanation(result);
      setHistory(prev => [{ code, lang, explanation: result, timestamp: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    } catch { setExplanation('Error: Could not connect to Ollama. Make sure it is running.'); }
    setStatusMsg('');
    setLoading(false);
  };

  const runComplexity = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setStatusMsg('Calculating complexity...');
    try {
      const result = await aiService.generateText(
        `Analyze this code's time and space complexity. State the Big-O notation and explain why. Also suggest how to optimize it:\n\`\`\`\n${code}\n\`\`\``,
        maxTokens,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );
      setComplexity(result);
    } catch { setComplexity('Error connecting to Ollama.'); }
    setStatusMsg('');
    setLoading(false);
  };

  const runDocstring = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setStatusMsg('Generating documentation...');
    try {
      const result = await aiService.generateText(
        `Generate a complete docstring/JSDoc comment for this code. Include parameter descriptions, return type, and usage example:\n\`\`\`\n${code}\n\`\`\``,
        maxTokens,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );
      setDocstring(result);
    } catch { setDocstring('Error connecting to Ollama.'); }
    setStatusMsg('');
    setLoading(false);
  };

  const runSecurityScan = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setStatusMsg('Scanning for vulnerabilities...');
    try {
      const result = await aiService.generateText(
        `Scan this code for security vulnerabilities, bad practices, and potential bugs. List each issue with severity (High/Medium/Low) and fix suggestion:\n\`\`\`\n${code}\n\`\`\``,
        maxTokens,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature: 0.2 }
      );
      setVulnerabilities(result);
    } catch { setVulnerabilities('Error connecting to Ollama.'); }
    setStatusMsg('');
    setLoading(false);
  };

  const runTranslate = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setStatusMsg(`Translating to ${targetLang}...`);
    try {
      const result = await aiService.generateText(
        `Translate this code to ${targetLang}. Preserve all logic and comments. Output only the translated code:\n\`\`\`\n${code}\n\`\`\``,
        maxTokens,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature: 0.2 }
      );
      setTranslatedCode(result);
    } catch { setTranslatedCode('Error connecting to Ollama.'); }
    setStatusMsg('');
    setLoading(false);
  };

  const handleTabRun = () => {
    if (activeTab === 'explain') runExplain();
    else if (activeTab === 'optimize') runComplexity();
    else if (activeTab === 'docstring') runDocstring();
    else if (activeTab === 'security') runSecurityScan();
    else runTranslate();
  };

  const currentOutput = activeTab === 'explain' ? explanation
    : activeTab === 'optimize' ? complexity
    : activeTab === 'docstring' ? docstring
    : activeTab === 'security' ? vulnerabilities
    : translatedCode;

  const tabs = [
    { key: 'explain', label: 'Explain', icon: <BookOpen size={13} /> },
    { key: 'optimize', label: 'Complexity', icon: <Sparkles size={13} /> },
    { key: 'docstring', label: 'Docstring', icon: <Code size={13} /> },
    { key: 'security', label: 'Security', icon: <Shield size={13} /> },
    { key: 'translate', label: 'Translate', icon: <Languages size={13} /> },
  ] as const;

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto">
      <LocalAIConfigPanel
        systemPrompt={systemPrompt} onSystemPromptChange={setSystemPrompt}
        temperature={temperature} onTemperatureChange={setTemperature}
        maxTokens={maxTokens} onMaxTokensChange={setMaxTokens}
        selectedModel={selectedModel} onModelChange={setSelectedModel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Code Input */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Code size={14} className="text-indigo-400" /> Code Input
            </label>
            <span className="text-[10px] font-mono bg-indigo-950/40 text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/30">
              {detectedLang}
            </span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            placeholder="Paste your code here..."
            spellCheck={false}
          />
          {/* Tab selector */}
          <div className="flex gap-1 flex-wrap">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === t.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'translate' && (
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          )}

          <button
            onClick={handleTabRun}
            disabled={loading || !code.trim()}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all active:scale-95"
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /><span>{statusMsg}</span></> : <><Sparkles size={15} /><span>Run {tabs.find(t=>t.key===activeTab)?.label}</span></>}
          </button>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Output</label>
            <div className="flex gap-1.5">
              <button onClick={() => handleTextCopy(currentOutput, setCopied)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all">
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />} Copy
              </button>
              <button onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([currentOutput], {type:'text/plain'})); a.download = 'code-analysis.md'; a.click(); }}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all">
                <Download size={12} /> Export
              </button>
              <button onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all">
                <RefreshCw size={12} /> History
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-64 bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono overflow-auto max-h-96">
            {currentOutput || <span className="text-slate-600">Output will appear here after analysis...</span>}
          </div>

          {showHistory && history.length > 0 && (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Recent History</span>
              {history.map((h, i) => (
                <button key={i} onClick={() => { setCode(h.code); setExplanation(h.explanation); setShowHistory(false); }}
                  className="text-left p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-400 transition-all">
                  <span className="text-indigo-400 font-mono">[{h.lang}]</span> {h.timestamp} — {h.explanation.slice(0, 60)}...
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
