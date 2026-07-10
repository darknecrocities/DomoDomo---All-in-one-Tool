import React, { useState, useEffect } from 'react';
import { Code, ShieldAlert, Cpu, Activity, CheckCircle2 } from 'lucide-react';
import { aiService } from '../../../utils/aiService';

export const AICodeAuditorTool: React.FC = () => {
  const [code, setCode] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  interface HeuristicWarning {
    line: number;
    pattern: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
  }

  const [heuristicWarnings, setHeuristicWarnings] = useState<HeuristicWarning[]>([]);

  const runHeuristicScan = (codeToScan: string): HeuristicWarning[] => {
    const lines = codeToScan.split('\n');
    const warnings: HeuristicWarning[] = [];
    
    const secretsRegex = /(api_key|secret|password|passwd|private_key|token)\s*=\s*['"][a-zA-Z0-9_\-\+\/=]{16,}['"]/i;
    const sqliRegex = /select\s+.*\s+from\s+.*\s+where\s+.*=\s*['"]\s*\+\s*\w+|execute\(\s*['"].*\$.*['"]\)/i;
    const xssRegex = /innerHTML\s*=\s*|document\.write\(/i;
    const cmdRegex = /exec\(\s*.*\+.*\)/i;
    
    lines.forEach((lineText, index) => {
      const lineNum = index + 1;
      
      if (secretsRegex.test(lineText)) {
        warnings.push({
          line: lineNum,
          pattern: 'Hardcoded Secret',
          severity: 'high',
          message: `Line ${lineNum}: Hardcoded credential or API private key assignment.`
        });
      }
      
      if (sqliRegex.test(lineText)) {
        warnings.push({
          line: lineNum,
          pattern: 'SQL Injection',
          severity: 'high',
          message: `Line ${lineNum}: Raw query string concatenation. Use parameterized bindings.`
        });
      }
      
      if (xssRegex.test(lineText)) {
        warnings.push({
          line: lineNum,
          pattern: 'XSS Injection',
          severity: 'medium',
          message: `Line ${lineNum}: Unsafe DOM write using innerHTML/document.write.`
        });
      }
      
      if (cmdRegex.test(lineText)) {
        warnings.push({
          line: lineNum,
          pattern: 'Command Injection',
          severity: 'high',
          message: `Line ${lineNum}: Raw system command execution query concatenation.`
        });
      }
    });
    
    return warnings;
  };

  useEffect(() => {
    const fetchModels = async () => {
      const { status, models } = await aiService.checkOllama();
      if (status && models.length > 0) {
        setModels(models);
        const saved = aiService.getSelectedOllamaModel();
        if (saved && models.includes(saved)) {
          setSelectedModel(saved);
        } else {
          setSelectedModel(models[0]);
        }
      }
    };
    fetchModels();
  }, []);

  const analyzeCode = async () => {
    if (!code.trim() || !selectedModel) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    
    const warnings = runHeuristicScan(code);
    setHeuristicWarnings(warnings);

    let warningsPromptContext = '';
    if (warnings.length > 0) {
      warningsPromptContext = `\nNote: The local scanner found high-probability issues:\n` +
        warnings.map(w => `- Line ${w.line}: [${w.pattern}] ${w.message}`).join('\n') +
        `\nFocus first on confirming or dismissing these issues in your report, then identify other bugs.`;
    }

    const systemPrompt = `You are a Senior Application Security Engineer and Code Auditor. 
Your task is to review the provided source code for security vulnerabilities (e.g., OWASP Top 10 like SQLi, XSS, CSRF, hardcoded secrets, buffer overflows, or insecure crypto).${warningsPromptContext}
If you find vulnerabilities:
1. Identify the exact vulnerability and explain why it is dangerous.
2. Provide a secure code remediation example.
If the code is secure, explain why and what good practices were used. Keep your analysis concise, structured with markdown, and highly technical.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, code, 1024, systemPrompt);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to local AI. Ensure Ollama is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left">
        <h3 className="font-bold text-[#ECEBE9] text-lg flex items-center gap-2">
          <Code size={20} className="text-[#3C6B4D]" />
          DomoGuard Code Auditor
        </h3>
        <p className="text-[#A3A09B] text-xs leading-relaxed">
          Paste source code below to have your local AI model hunt for vulnerabilities, hardcoded secrets, and logic flaws. 
          Processing runs entirely offline on your hardware, ensuring your proprietary code never leaves your machine.
        </p>
      </div>

      <div className="glass-card p-6 border-[#2A2D30] bg-[#111213] flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-2">
            Source Code to Audit
          </label>
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[#3C6B4D]" />
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                aiService.setSelectedOllamaModel(e.target.value);
              }}
              className="bg-[#18191B] text-[#ECEBE9] border border-[#2A2D30] rounded-lg px-2 py-1 text-[10px] font-mono focus:outline-none focus:border-[#3C6B4D]"
            >
              {models.length === 0 ? (
                <option value="">No Models Found</option>
              ) : (
                models.map(m => <option key={m} value={m}>{m}</option>)
              )}
            </select>
          </div>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Paste C, C++, PHP, Python, JS, etc. here..."
          className="w-full h-64 bg-[#18191B] border border-[#2A2D30] rounded-xl p-4 text-xs font-mono text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] transition-all resize-none"
        />
        
        <button
          onClick={analyzeCode}
          disabled={isAnalyzing || !code.trim() || models.length === 0}
          className="btn-primary py-3 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Activity size={16} className="animate-spin" />
              <span>Auditing Code...</span>
            </>
          ) : (
            <>
              <ShieldAlert size={16} />
              <span>Run Local Security Audit</span>
            </>
          )}
        </button>
      </div>

      {heuristicWarnings.length > 0 && (
        <div className="glass-card p-6 border-rose-500/25 bg-[#18191B] flex flex-col gap-4 text-left animate-fadeIn">
          <div className="flex items-center gap-2 border-b border-[#2A2D30] pb-2.5">
            <span className="bg-rose-500/10 text-rose-450 border border-rose-500/25 px-2 py-0.5 rounded text-[9px] font-bold uppercase">Heuristic Findings</span>
            <h4 className="font-bold text-[#ECEBE9] text-xs uppercase tracking-wider font-mono">Found {heuristicWarnings.length} Warnings</h4>
          </div>
          <div className="space-y-2.5 font-mono text-[10px]">
            {heuristicWarnings.map((w, i) => (
              <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg border bg-[#111213] ${w.severity === 'high' ? 'border-rose-500/20 text-rose-450' : 'border-amber-500/20 text-amber-550'}`}>
                <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold uppercase text-[8px] border border-current px-1 py-0.25 rounded mr-2">{w.severity}</span>
                  <span className="font-bold mr-1">[{w.pattern}]</span>
                  <span>{w.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-xs text-rose-450 font-semibold flex items-start gap-2">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="glass-card p-6 border-[#3C6B4D]/30 bg-[#18191B] flex flex-col gap-4 text-left">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={18} className="text-[#3C6B4D]" />
            <h4 className="font-bold text-[#ECEBE9] text-sm uppercase tracking-wider">AI Audit Report</h4>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-[#A3A09B] leading-relaxed">
            {/* Super simple markdown rendering for now, could be replaced with ReactMarkdown if available */}
            {result.split('\n').map((line, i) => {
              if (line.startsWith('###')) return <h5 key={i} className="text-white font-bold mt-4 mb-2">{line.replace('###', '')}</h5>;
              if (line.startsWith('##')) return <h4 key={i} className="text-white font-bold text-base mt-4 mb-2">{line.replace('##', '')}</h4>;
              if (line.startsWith('#')) return <h3 key={i} className="text-[#3C6B4D] font-bold text-lg mt-4 mb-2">{line.replace('#', '')}</h3>;
              if (line.startsWith('-')) return <li key={i} className="ml-4">{line.substring(1)}</li>;
              if (line.startsWith('```')) return null; // skip code block markers for simple mapping
              return <p key={i} className="mb-2 break-words whitespace-pre-wrap font-mono text-[11px]">{line}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
