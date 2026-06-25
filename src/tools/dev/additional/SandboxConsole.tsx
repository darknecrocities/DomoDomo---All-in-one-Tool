import { useState, useRef } from 'react';
import { Play, Trash2, Code, FileJson, Info, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';

interface ConsoleLog {
  type: 'log' | 'warn' | 'error';
  args: string[];
  timestamp: string;
}

export const SandboxConsoleTool = () => {
  const [code, setCode] = useState(`// Welcome to the Sandboxed JavaScript Playground!\n// You can write ES6 code and inspect stdout console outputs.\n\nconst greet = (name) => {\n  console.log("Hello, " + name + "!");\n};\n\ngreet("DomoDeveloper");\n\nconst numbers = [1, 2, 3, 4, 5];\nconst squared = numbers.map(x => x * x);\nconsole.log("Squared array result:", squared);\n`);
  
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [strictMode, setStrictMode] = useState(true);
  const [customArgs, setCustomArgs] = useState('["John", 42]');
  const [preset, setPreset] = useState('basic');

  const logRef = useRef<ConsoleLog[]>([]);

  // Snippets Presets
  const applyPreset = (p: string) => {
    setPreset(p);
    if (p === 'basic') {
      setCode(`console.log("Normal output message.");\nconsole.warn("This is a warning warning!");\nconsole.error("This is an error alert!");\n`);
    } else if (p === 'fibonacci') {
      setCode(`// Fibonacci Generator function\nconst fibonacci = (n) => {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n};\n\nconst count = 10;\nconsole.log(\`Calculating Fibonacci sequence for \${count} steps:\`);\nfor (let i = 0; i < count; i++) {\n  console.log(\`Fibonacci(\${i}):\`, fibonacci(i));\n}\n`);
    } else if (p === 'array') {
      setCode(`// Array manipulation helper\nconst users = [\n  { name: 'Alice', age: 25, active: true },\n  { name: 'Bob', age: 17, active: false },\n  { name: 'Charlie', age: 30, active: true }\n];\n\nconst activeAdults = users\n  .filter(u => u.age >= 18 && u.active)\n  .map(u => u.name);\n\nconsole.log("Filtered Active Adults:", activeAdults);\n`);
    } else if (p === 'args') {
      setCode(`// Access custom parameters passed to the function context:\n// args[0] and args[1] will match the inputs configuration below\n\nconsole.log("First custom parameter (name):", args[0]);\nconsole.log("Second custom parameter (id):", args[1]);\n`);
    }
  };

  // Execution trigger
  const runCode = () => {
    logRef.current = [];
    setLogs([]);
    setExecutionTime(null);
    
    // Setup Console Interceptors inside sandbox
    const createConsoleMock = () => {
      const logger = (type: 'log' | 'warn' | 'error') => (...rawArgs: any[]) => {
        const timeStr = new Date().toLocaleTimeString();
        const formattedArgs = rawArgs.map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        });
        logRef.current.push({ type, args: formattedArgs, timestamp: timeStr });
      };
      
      return {
        log: logger('log'),
        warn: logger('warn'),
        error: logger('error'),
      };
    };

    const mockConsole = createConsoleMock();
    
    // Parse custom arguments securely
    let parsedArgs: any[] = [];
    try {
      if (customArgs.trim()) {
        parsedArgs = JSON.parse(customArgs);
      }
    } catch (e) {
      logRef.current.push({
        type: 'error',
        args: ['Invalid Custom Arguments JSON format. Must be an array, e.g. ["John", 42]'],
        timestamp: new Date().toLocaleTimeString()
      });
      setLogs([...logRef.current]);
      return;
    }

    const t0 = performance.now();
    
    try {
      // Build safe execution function context
      const prefix = strictMode ? '"use strict";\n' : '';
      const execBody = `${prefix}${code}`;
      
      // Inject console mocks, arguments, and parameters
      const runContext = new Function('console', 'args', execBody);
      runContext(mockConsole, parsedArgs);
      
      const t1 = performance.now();
      setExecutionTime(t1 - t0);
    } catch (err: any) {
      const t1 = performance.now();
      setExecutionTime(t1 - t0);
      logRef.current.push({
        type: 'error',
        args: [err?.message || 'Unknown runtime error occurred.'],
        timestamp: new Date().toLocaleTimeString()
      });
    }

    setLogs([...logRef.current]);
  };

  const clearLogs = () => {
    logRef.current = [];
    setLogs([]);
    setExecutionTime(null);
  };

  const exportLogs = () => {
    if (logs.length === 0) return;
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'execution_logs.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatCode = () => {
    // Simple code formatter helper logic
    try {
      const trimmed = code.trim();
      setCode(trimmed);
    } catch (err) {}
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Editor Screen */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-[#3C6B4D] font-bold flex items-center gap-1.5"><Code size={18} /> JavaScript Console Sandbox</h3>
            
            <div className="flex gap-2">
              <button
                onClick={formatCode}
                className="text-[10px] bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-350 hover:text-white px-2.5 py-1 rounded-lg font-semibold transition-all"
              >
                Format Code
              </button>
              <button
                onClick={runCode}
                className="py-1 px-4 bg-[#3C6B4D] hover:bg-[#3C6B4D]/90 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Play size={11} fill="white" /> Run Code
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={14}
              className="bg-slate-950 border border-slate-850 rounded-xl p-4 text-slate-200 text-xs font-mono focus:outline-none focus:border-[#3C6B4D] w-full leading-relaxed"
            />
          </div>
        </div>

        {/* Mock Console output logs */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-850 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase">Console Outputs Logs</span>
              {executionTime !== null && (
                <span className="text-[10px] text-slate-500 font-mono">({executionTime.toFixed(2)}ms)</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={exportLogs}
                disabled={logs.length === 0}
                className="text-[10px] bg-slate-900 border border-slate-800 disabled:opacity-40 text-slate-350 hover:text-white px-2 py-0.5 rounded flex items-center gap-1"
              >
                <FileJson size={11} /> Export JSON
              </button>
              <button
                onClick={clearLogs}
                disabled={logs.length === 0}
                className="text-[10px] bg-rose-950/20 text-rose-400 disabled:opacity-40 hover:bg-rose-950/40 px-2 py-0.5 rounded flex items-center gap-1"
              >
                <Trash2 size={11} /> Clear
              </button>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 min-h-[160px] max-h-[300px] overflow-y-auto font-mono text-xs flex flex-col gap-2.5">
            {logs.map((log, idx) => {
              let Icon = Info;
              let colors = 'text-blue-400 bg-blue-950/15 border-blue-900/30';
              if (log.type === 'warn') {
                Icon = AlertTriangle;
                colors = 'text-amber-400 bg-amber-950/15 border-amber-900/30';
              } else if (log.type === 'error') {
                Icon = AlertCircle;
                colors = 'text-rose-400 bg-rose-950/15 border-rose-900/30';
              }

              return (
                <div key={idx} className={`p-2.5 border rounded-lg flex gap-2 items-start ${colors}`}>
                  <Icon size={14} className="mt-0.5 shrink-0" />
                  <div className="flex-1 flex flex-col gap-1">
                    <pre className="whitespace-pre-wrap font-mono font-bold leading-relaxed">{log.args.join(' ')}</pre>
                    <span className="text-[8px] text-slate-500 font-sans tracking-wide self-end">{log.timestamp}</span>
                  </div>
                </div>
              );
            })}
            {logs.length === 0 && (
              <span className="text-slate-500 text-xs italic text-center py-12">Console is empty. Click Run Code to inspect logs.</span>
            )}
          </div>
        </div>
      </div>

      {/* Settings control board */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Preset snippets */}
        <div className="glass-card p-6 flex flex-col gap-3">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-800 pb-2 flex items-center gap-1.5"><RefreshCw size={13} className="text-[#3C6B4D]" /> Template Snippets</span>
          <select
            value={preset}
            onChange={(e) => applyPreset(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs font-semibold focus:outline-none"
          >
            <option value="basic">Standard logs output</option>
            <option value="fibonacci">Fibonacci algorithm</option>
            <option value="array">Array mapping filters</option>
            <option value="args">Custom parameters loader</option>
          </select>
        </div>

        {/* Runtime config inputs */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-xs text-slate-400 font-bold uppercase border-b border-slate-800 pb-2">Sandbox Config</span>
          
          <div className="flex flex-col gap-4">
            {/* Strict Mode Toggle */}
            <div className="flex items-center justify-between bg-slate-950 border border-slate-850/80 rounded-xl p-3">
              <div className="flex flex-col">
                <span className="text-xs text-slate-200 font-semibold">Strict Mode</span>
                <span className="text-[10px] text-slate-500">Injects 'use strict' flag</span>
              </div>
              <button
                onClick={() => setStrictMode(!strictMode)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  strictMode ? 'bg-[#3C6B4D]' : 'bg-slate-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  strictMode ? 'translate-x-4.5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* Custom Arguments input */}
            <div className="flex flex-col gap-1.5 border-t border-slate-800/80 pt-3.5">
              <label className="text-[10px] text-slate-500 font-bold uppercase">Dynamic arguments (args JSON Array)</label>
              <input
                type="text"
                value={customArgs}
                onChange={(e) => setCustomArgs(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#3C6B4D]"
                placeholder='["param", 12]'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
