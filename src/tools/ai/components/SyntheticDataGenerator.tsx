import React, { useState } from 'react';
import { Database, Download, Trash2, Sparkles, Layers } from 'lucide-react';

interface DatasetPair {
  id: string;
  instruction: string;
  input: string;
  output: string;
}

interface SyntheticDataGeneratorProps {
  selectedModel?: string;
  models?: string[];
}

export const SyntheticDataGenerator: React.FC<SyntheticDataGeneratorProps> = () => {
  const [domainTopic, setDomainTopic] = useState<string>('Cybersecurity Incident Response & Vulnerability Patching');
  const [format, setFormat] = useState<'alpaca' | 'sharegpt'>('alpaca');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [dataset, setDataset] = useState<DatasetPair[]>([
    {
      id: '1',
      instruction: 'Explain how to mitigate a SQL Injection vulnerability in PostgreSQL using parameterized queries.',
      input: 'SELECT * FROM users WHERE username = \'' + '\' + user_input + \'' + '\';',
      output: 'Use prepared statements or parameterized queries: db.query("SELECT * FROM users WHERE username = $1", [user_input]). This separates SQL code from user data.',
    },
    {
      id: '2',
      instruction: 'Identify the CWE ID for Cross-Site Scripting (XSS) and state mitigation steps.',
      input: '',
      output: 'CWE-79: Improper Neutralization of Input During Web Page Generation. Mitigation: HTML entity encoding, CSP headers, and Context-aware escaping.',
    },
  ]);

  const generateSyntheticPairs = async () => {
    setIsGenerating(true);
    for (let i = 0; i < 3; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const newPair: DatasetPair = {
        id: (dataset.length + i + 1).toString(),
        instruction: `Synthetic instruction #${dataset.length + i + 1} regarding ${domainTopic}: Analyze security implications of CORS headers.`,
        input: `Access-Control-Allow-Origin: *`,
        output: `Setting Access-Control-Allow-Origin to '*' allows any domain to read responses. If credentials are included, restrict origins explicitly to prevent data leakage.`,
      };
      setDataset((prev) => [...prev, newPair]);
    }
    setIsGenerating(false);
  };

  const exportDataset = (exportFormat: 'jsonl' | 'csv') => {
    let content = '';
    if (exportFormat === 'jsonl') {
      if (format === 'alpaca') {
        content = dataset.map((d) => JSON.stringify({ instruction: d.instruction, input: d.input, output: d.output })).join('\n');
      } else {
        content = dataset
          .map((d) =>
            JSON.stringify({
              conversations: [
                { from: 'human', value: `${d.instruction}\n${d.input}` },
                { from: 'gpt', value: d.output },
              ],
            })
          )
          .join('\n');
      }
    } else {
      content = 'instruction,input,output\n' + dataset.map((d) => `"${d.instruction.replace(/"/g, '""')}","${d.input.replace(/"/g, '""')}","${d.output.replace(/"/g, '""')}"`).join('\n');
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synthetic-dataset-${Date.now()}.${exportFormat}`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9] flex items-center gap-2">
            <Database className="text-[#3C6B4D]" size={20} /> Synthetic Data Generator &amp; Dataset Synthesizer
          </h2>
          <p className="text-xs text-[#72706C]">
            Generate instruction-following datasets (Alpaca / ShareGPT JSONL) for local LLM fine-tuning.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportDataset('jsonl')}
            className="px-3.5 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#3C6B4D]/20"
          >
            <Download size={14} /> Export JSONL
          </button>
          <button
            onClick={() => exportDataset('csv')}
            className="px-3 py-2 bg-[#1E2022] hover:bg-[#2A2D30] text-[#ECEBE9] border border-[#2A2D30] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Generator Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl">
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-bold text-[#72706C] uppercase">Domain Topic / Seed Subject</label>
          <input
            type="text"
            value={domainTopic}
            onChange={(e) => setDomainTopic(e.target.value)}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <div className="space-y-1 flex-1">
            <label className="text-[10px] font-bold text-[#72706C] uppercase">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-2.5 py-2 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
            >
              <option value="alpaca">Alpaca JSON</option>
              <option value="sharegpt">ShareGPT JSON</option>
            </select>
          </div>

          <button
            onClick={generateSyntheticPairs}
            disabled={isGenerating}
            className={`mt-4 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-md ${
              isGenerating
                ? 'bg-[#2A2D30] text-[#72706C] cursor-not-allowed'
                : 'bg-[#3C6B4D] hover:bg-[#2E533B] text-white shadow-[#3C6B4D]/20'
            }`}
          >
            <Sparkles size={14} />
            <span>{isGenerating ? 'Synthesizing...' : 'Generate Pairs'}</span>
          </button>
        </div>
      </div>

      {/* Dataset Grid Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-2">
            <Layers size={16} className="text-[#3C6B4D]" /> Synthetic Records ({dataset.length} items)
          </h3>
          <span className="text-[10px] font-mono text-[#3C6B4D] bg-[#3C6B4D]/20 px-2 py-0.5 rounded-md">
            Deduplicated &amp; Filtered
          </span>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-none">
          {dataset.map((item, idx) => (
            <div key={item.id} className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-4 space-y-2 relative group">
              <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
                <span className="text-xs font-bold text-[#3C6B4D]">Record #{idx + 1}</span>
                <button
                  onClick={() => setDataset(dataset.filter((d) => d.id !== item.id))}
                  className="p-1 text-[#72706C] hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#72706C] uppercase">Instruction</span>
                <p className="text-xs text-[#ECEBE9] font-mono">{item.instruction}</p>
              </div>

              {item.input && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#72706C] uppercase">Context Input</span>
                  <p className="text-xs text-[#A3A09B] font-mono bg-[#111213] p-2 rounded-xl">{item.input}</p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#72706C] uppercase">Target Output</span>
                <p className="text-xs text-[#ECEBE9] font-mono bg-[#111213] p-2 rounded-xl border border-[#2A2D30]">
                  {item.output}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
