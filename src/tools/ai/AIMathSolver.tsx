import { useState } from 'react';
import { Calculator, Loader2, Copy, Check, Download, RefreshCw, Sparkles } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

type MathMode = 'solve' | 'verify' | 'convert' | 'wordproblem';

interface MathHistory { problem: string; solution: string; timestamp: string }

export const AIMathSolverTool = () => {
  const [problem, setProblem] = useState('Find the derivative of f(x) = 3x³ + 2x² - 5x + 7');
  const [mode, setMode] = useState<MathMode>('solve');
  const [solution, setSolution] = useState('');
  const [userSolution, setUserSolution] = useState('');
  const [verifyResult, setVerifyResult] = useState('');
  const [convertFrom, setConvertFrom] = useState('25 kilometers');
  const [convertTo, setConvertTo] = useState('miles');
  const [convertResult, setConvertResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<MathHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a math tutor. Show clear, step-by-step solutions. State the theorem or formula used. Be precise and educational.');
  const [temperature, setTemperature] = useState(0.2);
  const [maxTokens, setMaxTokens] = useState(400);

  const solveProblem = async () => {
    if (!problem.trim()) return;
    setLoading(true);
    setStatusMsg('Solving...');
    try {
      const result = await aiService.generateText(
        `Solve this math problem step by step. Show each step clearly. State the formula/theorem used. Provide the final answer:\n\n${problem}`,
        maxTokens,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );
      setSolution(result);
      setHistory(prev => [{ problem, solution: result, timestamp: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    } catch { setSolution('Error. Ensure Ollama is running.'); }
    setStatusMsg('');
    setLoading(false);
  };

  const verifyWork = async () => {
    if (!problem.trim() || !userSolution.trim()) return;
    setLoading(true);
    setStatusMsg('Verifying your solution...');
    try {
      const result = await aiService.generateText(
        `Problem: ${problem}\n\nStudent's solution: ${userSolution}\n\nIs this solution correct? If not, identify the error and show the correct approach. Be encouraging.`,
        maxTokens,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );
      setVerifyResult(result);
    } catch { setVerifyResult('Error. Ensure Ollama is running.'); }
    setStatusMsg('');
    setLoading(false);
  };

  const convertUnits = async () => {
    setLoading(true);
    setStatusMsg('Converting...');
    try {
      const result = await aiService.generateText(
        `Convert ${convertFrom} to ${convertTo}. Show the conversion formula and step-by-step calculation.`,
        150,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );
      setConvertResult(result);
    } catch { setConvertResult('Error. Ensure Ollama is running.'); }
    setStatusMsg('');
    setLoading(false);
  };

  const solveWordProblem = async () => {
    if (!problem.trim()) return;
    setLoading(true);
    setStatusMsg('Parsing word problem...');
    try {
      const result = await aiService.generateText(
        `Parse and solve this word problem:\n1. Identify what is given\n2. Identify what is asked\n3. Choose the right formula\n4. Solve step by step\n5. Verify the answer makes sense\n\nWord problem: ${problem}`,
        maxTokens,
        undefined,
        selectedModel || undefined,
        { systemPrompt, temperature }
      );
      setSolution(result);
      setHistory(prev => [{ problem, solution: result, timestamp: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    } catch { setSolution('Error. Ensure Ollama is running.'); }
    setStatusMsg('');
    setLoading(false);
  };

  const handleRun = () => {
    if (mode === 'solve') solveProblem();
    else if (mode === 'verify') verifyWork();
    else if (mode === 'convert') convertUnits();
    else solveWordProblem();
  };

  const currentOutput = mode === 'verify' ? verifyResult : mode === 'convert' ? convertResult : solution;

  const exportSolution = () => {
    const content = `Problem: ${problem}\n\nSolution:\n${currentOutput}`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
    a.download = 'math-solution.txt';
    a.click();
  };

  const modeConfig = [
    { key: 'solve', label: '🧮 Solve', desc: 'Step-by-step solution' },
    { key: 'wordproblem', label: '📖 Word Problem', desc: 'Parse & solve' },
    { key: 'verify', label: '✅ Verify', desc: 'Check your work' },
    { key: 'convert', label: '📐 Units', desc: 'Unit conversion' },
  ] as const;

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      <LocalAIConfigPanel
        systemPrompt={systemPrompt} onSystemPromptChange={setSystemPrompt}
        temperature={temperature} onTemperatureChange={setTemperature}
        maxTokens={maxTokens} onMaxTokensChange={setMaxTokens}
        selectedModel={selectedModel} onModelChange={setSelectedModel}
      />

      {/* Mode tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {modeConfig.map(m => (
          <button key={m.key} onClick={() => setMode(m.key as MathMode)}
            className={`flex flex-col items-center gap-0.5 py-3 rounded-xl text-xs font-bold transition-all border ${mode === m.key ? 'bg-cyan-700 border-cyan-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}>
            <span>{m.label}</span>
            <span className={`text-[9px] font-normal ${mode === m.key ? 'text-cyan-200' : 'text-slate-600'}`}>{m.desc}</span>
          </button>
        ))}
      </div>

      {/* Input area */}
      {mode === 'convert' ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">From</label>
              <input value={convertFrom} onChange={e => setConvertFrom(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                placeholder="e.g. 25 kilometers" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">To</label>
              <input value={convertTo} onChange={e => setConvertTo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                placeholder="e.g. miles" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            {mode === 'verify' ? 'Problem' : 'Math Problem'}
          </label>
          <textarea value={problem} onChange={e => setProblem(e.target.value)}
            className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-500 resize-none"
            placeholder="Enter your math problem here..." />
          {mode === 'verify' && (
            <>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Your Solution</label>
              <textarea value={userSolution} onChange={e => setUserSolution(e.target.value)}
                className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 font-mono focus:outline-none focus:border-cyan-500 resize-none"
                placeholder="Paste your attempted solution..." />
            </>
          )}
        </div>
      )}

      <button onClick={handleRun} disabled={loading}
        className="flex items-center justify-center gap-2 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-95">
        {loading ? <><Loader2 size={15} className="animate-spin" /><span>{statusMsg}</span></> : <><Calculator size={15} /><span>
          {mode === 'solve' ? 'Solve Step by Step' : mode === 'verify' ? 'Check My Solution' : mode === 'convert' ? 'Convert Units' : 'Solve Word Problem'}
        </span></>}
      </button>

      {/* Output */}
      {currentOutput && (
        <div className="flex flex-col gap-3">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 font-mono leading-relaxed whitespace-pre-wrap max-h-80 overflow-auto">
            {currentOutput}
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleTextCopy(currentOutput, setCopied)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />} Copy with LaTeX
            </button>
            <button onClick={exportSolution}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
              <Download size={12} /> Export
            </button>
            <button onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
              <RefreshCw size={12} /> History ({history.length})
            </button>
            <button onClick={() => { setSolution(''); setVerifyResult(''); setConvertResult(''); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
              <Sparkles size={12} /> New Problem
            </button>
          </div>
        </div>
      )}

      {showHistory && history.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Problem History</div>
          {history.map((h, i) => (
            <button key={i} onClick={() => { setProblem(h.problem); setSolution(h.solution); setShowHistory(false); }}
              className="text-left p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-400 transition-all">
              <span className="text-cyan-400 font-mono">[{h.timestamp}]</span> {h.problem.slice(0, 80)}...
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
