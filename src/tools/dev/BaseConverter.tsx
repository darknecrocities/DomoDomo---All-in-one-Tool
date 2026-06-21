import { useState, useEffect } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';

export const BaseConverterTool = () => {
  const [inputValue, setInputValue] = useState('255');
  const [fromBase, setFromBase] = useState<2 | 8 | 10 | 16>(10);
  const [binary, setBinary] = useState('');
  const [octal, setOctal] = useState('');
  const [decimal, setDecimal] = useState('');
  const [hex, setHex] = useState('');
  const [error, setError] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleConvert = () => {
    setError('');
    setSteps([]);
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setBinary('');
      setOctal('');
      setDecimal('');
      setHex('');
      return;
    }

    // Parse input based on selected input base
    const num = parseInt(trimmed, fromBase);
    if (isNaN(num)) {
      setError(`Invalid input value for base ${fromBase}.`);
      return;
    }

    setBinary(num.toString(2));
    setOctal(num.toString(8));
    setDecimal(num.toString(10));
    setHex(num.toString(16).toUpperCase());

    // Generate simple steps explanation
    const explainSteps: string[] = [];
    explainSteps.push(`1. Parsed input "${trimmed}" from Base-${fromBase} yields decimal value: ${num}`);
    explainSteps.push(`2. Decimal ${num} converted to Binary (Base-2) by successive division by 2: ${num.toString(2)}`);
    explainSteps.push(`3. Decimal ${num} converted to Octal (Base-8) by successive division by 8: ${num.toString(8)}`);
    explainSteps.push(`4. Decimal ${num} converted to Hexadecimal (Base-16) by successive division by 16: ${num.toString(16).toUpperCase()}`);
    setSteps(explainSteps);
  };

  useEffect(() => {
    handleConvert();
  }, [inputValue, fromBase]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-teal-400 font-bold border-b border-slate-800 pb-2">Number Base Converter</h3>
          
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs text-slate-400 font-semibold uppercase">Input Value</label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-slate-200 text-sm font-mono focus:outline-none focus:border-[#4E8E5E]"
                placeholder="e.g. 255"
              />
            </div>
            
            <div className="flex flex-col gap-1.5 w-44">
              <label className="text-xs text-slate-400 font-semibold uppercase">From Base</label>
              <select
                value={fromBase}
                onChange={(e) => setFromBase(parseInt(e.target.value) as any)}
                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 text-slate-200 text-xs font-semibold focus:outline-none focus:border-[#4E8E5E]"
              >
                <option value={10}>Decimal (10)</option>
                <option value={2}>Binary (2)</option>
                <option value={8}>Octal (8)</option>
                <option value={16}>Hexadecimal (16)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/25 p-3 rounded-xl text-xs text-rose-450 font-semibold font-mono">
              {error}
            </div>
          )}

          {/* Results grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {[
              { label: 'Decimal (Base 10)', val: decimal },
              { label: 'Binary (Base 2)', val: binary },
              { label: 'Octal (Base 8)', val: octal },
              { label: 'Hexadecimal (Base 16)', val: hex }
            ].map((res) => (
              <div key={res.label} className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-2 justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{res.label}</span>
                  <span className="text-sm font-mono font-bold text-slate-250 break-all select-all">{res.val || '-'}</span>
                </div>
                <button
                  onClick={() => handleCopy(res.val, res.label)}
                  disabled={!res.val}
                  className="btn-secondary self-start py-1 px-2.5 text-[10px] flex items-center gap-1.5 disabled:opacity-30"
                >
                  {copiedText === res.label ? <Check size={12} className="text-teal-400" /> : <Copy size={12} />}
                  <span>{copiedText === res.label ? 'Copied ✓' : 'Copy'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5">
            <RefreshCw size={14} className="text-[#4E8E5E]" />
            <span>Conversion Steps</span>
          </h3>
          
          <div className="flex flex-col gap-2 font-mono text-[10px] text-slate-400">
            {steps.length === 0 ? (
              <div className="text-center py-8 text-slate-600">Enter a valid value...</div>
            ) : (
              steps.map((s, idx) => (
                <div key={idx} className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-850/50 leading-relaxed">
                  {s}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
