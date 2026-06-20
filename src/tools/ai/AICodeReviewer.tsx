import { useState } from 'react';
import { Code, Loader2, Copy, Check, Download, Sparkles, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

type ReviewMode = 'bugs' | 'security' | 'practices' | 'performance' | 'tests' | 'docs';

export const AICodeReviewerTool = () => {
  const [code, setCode] = useState(`function getUserData(userId) {\n  const query = "SELECT * FROM users WHERE id = " + userId;\n  db.query(query, (err, result) => {\n    if (err) console.log(err);\n    return result;\n  });\n}`);
  const [activeMode, setActiveMode] = useState<ReviewMode>('bugs');
  const [results, setResults] = useState<Partial<Record<ReviewMode, string>>>({});
  const [runAll, setRunAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);

  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a senior software engineer and security expert. Provide thorough, actionable code reviews with specific line references where possible.');
  const [temperature, setTemperature] = useState(0.25);
  const [maxTokens, setMaxTokens] = useState(400);

  const prompts: Record<ReviewMode, string> = {
    bugs: `Find all bugs, logic errors, and edge cases in this code. For each issue: (1) describe the bug, (2) explain why it's a problem, (3) show the fix:\n\`\`\`\n${code}\n\`\`\``,
    security: `Perform a security audit of this code. Identify vulnerabilities (SQL injection, XSS, auth flaws, etc.). Rate each as Critical/High/Medium/Low and provide secure fixes:\n\`\`\`\n${code}\n\`\`\``,
    practices: `Review this code for best practices violations: naming conventions, SOLID principles, DRY violations, code smells, and maintainability issues. Provide refactored suggestions:\n\`\`\`\n${code}\n\`\`\``,
    performance: `Analyze this code for performance issues: unnecessary loops, memory leaks, inefficient operations, blocking calls. Suggest optimizations with Big-O impact:\n\`\`\`\n${code}\n\`\`\``,
    tests: `Suggest comprehensive unit test cases for this code. Include: happy path, edge cases, error cases, and boundary conditions. Write them in pseudocode or JS/Jest format:\n\`\`\`\n${code}\n\`\`\``,
    docs: `Check the documentation completeness of this code. Then write a complete JSDoc/docstring for all functions, parameters, return values, and thrown errors:\n\`\`\`\n${code}\n\`\`\``,
  };

  const reviewSingle = async (mode: ReviewMode) => {
    setLoading(true);
    setStatusMsg(`Running ${mode} review...`);
    try {
      const result = await aiService.generateText(
        prompts[mode],
        maxTokens,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );
      setResults(prev => ({ ...prev, [mode]: result }));
    } catch { setResults(prev => ({ ...prev, [mode]: 'Error. Ensure Ollama is running.' })); }
    setStatusMsg('');
    setLoading(false);
  };

  const reviewAll = async () => {
    setRunAll(true);
    setLoading(true);
    const modes: ReviewMode[] = ['bugs', 'security', 'practices', 'performance', 'tests', 'docs'];
    for (const m of modes) {
      setStatusMsg(`Running ${m} review...`);
      try {
        const result = await aiService.generateText(
          prompts[m],
          maxTokens,
          undefined,
          selectedModel || undefined,
          { systemPrompt, temperature }
        );
        setResults(prev => ({ ...prev, [m]: result }));
      } catch { setResults(prev => ({ ...prev, [m]: 'Error.' })); }
    }
    setLoading(false);
    setStatusMsg('');
    setRunAll(false);
  };

  const exportReport = () => {
    const modes: ReviewMode[] = ['bugs', 'security', 'practices', 'performance', 'tests', 'docs'];
    const content = `CODE REVIEW REPORT\n${'='.repeat(50)}\n\n` + modes.map(m => `## ${m.toUpperCase()} REVIEW\n${results[m] || 'Not run.'}`).join('\n\n---\n\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    a.download = 'code-review.md';
    a.click();
  };

  const modeConfig: { key: ReviewMode; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'bugs', label: '🐛 Bugs', icon: <AlertTriangle size={12} />, color: 'bg-red-700 border-red-600' },
    { key: 'security', label: '🔒 Security', icon: <Shield size={12} />, color: 'bg-orange-700 border-orange-600' },
    { key: 'practices', label: '✅ Practices', icon: <CheckCircle size={12} />, color: 'bg-green-700 border-green-600' },
    { key: 'performance', label: '⚡ Performance', icon: <Sparkles size={12} />, color: 'bg-yellow-700 border-yellow-600' },
    { key: 'tests', label: '🧪 Tests', icon: <Code size={12} />, color: 'bg-blue-700 border-blue-600' },
    { key: 'docs', label: '📄 Docs', icon: <Copy size={12} />, color: 'bg-purple-700 border-purple-600' },
  ];

  const completedModes = modeConfig.filter(m => results[m.key]);

  return (
    <div className="flex flex-col gap-5 max-w-4xl mx-auto">
      <LocalAIConfigPanel
        systemPrompt={systemPrompt} onSystemPromptChange={setSystemPrompt}
        temperature={temperature} onTemperatureChange={setTemperature}
        maxTokens={maxTokens} onMaxTokensChange={setMaxTokens}
        selectedModel={selectedModel} onModelChange={setSelectedModel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Input */}
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Code size={13} className="text-emerald-400" /> Code to Review
          </label>
          <textarea value={code} onChange={e => setCode(e.target.value)}
            className="w-full h-72 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
            placeholder="Paste your code here..."
            spellCheck={false} />

          {/* Completion badges */}
          {completedModes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {modeConfig.map(m => (
                <span key={m.key} className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${results[m.key] ? 'bg-emerald-900/40 border-emerald-700 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-600'}`}>
                  {results[m.key] ? '✓' : '○'} {m.key}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={reviewAll} disabled={loading || !code.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition-all active:scale-95">
              {loading && runAll ? <><Loader2 size={13} className="animate-spin" /><span>{statusMsg}</span></> : <><Sparkles size={13} /><span>Review All (6)</span></>}
            </button>
            {(Object.keys(results).length > 0) && (
              <button onClick={exportReport}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
                <Download size={12} /> Export
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showAnnotations} onChange={e => setShowAnnotations(e.target.checked)} className="accent-emerald-500" />
            <span className="text-xs text-slate-400">Show line-by-line annotation view</span>
          </label>
        </div>

        {/* Output */}
        <div className="flex flex-col gap-3">
          {/* Mode selector */}
          <div className="grid grid-cols-3 gap-1.5">
            {modeConfig.map(m => (
              <button key={m.key} onClick={() => { setActiveMode(m.key); if (!results[m.key]) reviewSingle(m.key); }}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] font-bold transition-all border ${activeMode === m.key ? `${m.color} text-white` : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'} ${results[m.key] ? 'ring-1 ring-emerald-600/30' : ''}`}>
                {m.icon} {m.label.split(' ')[1]}
                {loading && !runAll && activeMode === m.key && <Loader2 size={10} className="animate-spin ml-auto" />}
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-72 max-h-96 bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap overflow-auto">
            {results[activeMode] || (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-600">
                {loading && activeMode ? <Loader2 size={20} className="animate-spin text-emerald-500" /> : null}
                <span>{loading && statusMsg ? statusMsg : 'Select a review type to analyze your code...'}</span>
              </div>
            )}
          </div>

          {results[activeMode] && (
            <div className="flex gap-2">
              <button onClick={() => handleTextCopy(results[activeMode]!, setCopied)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />} Copy
              </button>
              <button onClick={() => reviewSingle(activeMode)} disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50">
                <Sparkles size={12} /> Re-run
              </button>
            </div>
          )}

          {showAnnotations && code && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 max-h-48 overflow-auto">
              <div className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">Line Annotations</div>
              {code.split('\n').map((line, i) => (
                <div key={i} className="flex gap-3 text-[10px] font-mono py-0.5 hover:bg-slate-900/40 px-1 rounded">
                  <span className="text-slate-700 w-5 text-right shrink-0">{i + 1}</span>
                  <span className="text-slate-400">{line || ' '}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
