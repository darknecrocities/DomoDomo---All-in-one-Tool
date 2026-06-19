import { triggerTextDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { FileText, ArrowRightLeft, Download, Settings } from 'lucide-react';

export const CsvJsonTool = () => {
  const [input, setInput] = useState('name,age,skills\n"Doe, John",28,"React, TS"\n"Jane Smith",24,"Node, Wasm"');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [delimiter, setDelimiter] = useState<',' | ';' | '\t'>(',');
  const [indentation, setIndentation] = useState<'2' | '4' | 'compact'>('2');

  // Advanced CSV parsing to handle custom delimiters and comma encapsulation in double quotes
  const parseCsv = (csvText: string, delim: string) => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];

    const parseLine = (line: string) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delim && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const list = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      const obj: any = {};
      headers.forEach((h, idx) => {
        let val = values[idx] || '';
        // Strip outer quotes if still present
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        }
        obj[h.replace(/^"|"$/g, '').trim()] = val;
      });
      list.push(obj);
    }
    return list;
  };

  const handleCsvToJson = () => {
    try {
      const list = parseCsv(input, delimiter);
      const indent = indentation === 'compact' ? 0 : Number(indentation);
      setOutput(JSON.stringify(list, null, indent));
    } catch (e) {
      setOutput('Error parsing CSV. Please check formatting and delimiter selection.');
    }
  };

  const handleJsonToCsv = () => {
    try {
      const parsed = JSON.parse(input);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      if (list.length === 0) return;

      const headers = Object.keys(list[0]);
      const csvLines = [headers.join(delimiter)];

      list.forEach((obj: any) => {
        const row = headers.map(h => {
          const val = obj[h] !== undefined ? String(obj[h]) : '';
          // Wrap in quotes if it contains delimiter or quotes
          if (val.includes(delimiter) || val.includes('"') || val.includes('\n')) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        });
        csvLines.push(row.join(delimiter));
      });
      setOutput(csvLines.join('\n'));
    } catch (e) {
      setOutput('Error parsing JSON structure. Ensure it is a valid JSON Array of objects.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setInput(reader.result as string);
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Input panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 h-[520px] justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="text-[#4E8E5E]" size={18} />
              <span>Input CSV or JSON Data</span>
            </h2>
            
            {/* Upload Handles */}
            <div className="flex gap-2">
              <label className="py-1 px-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-400 flex items-center gap-1 hover:text-slate-200 cursor-pointer">
                <span>Load CSV</span>
                <input type="file" accept=".csv,.txt" onChange={(e) => handleFileUpload(e)} className="hidden" />
              </label>
              <label className="py-1 px-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-400 flex items-center gap-1 hover:text-slate-200 cursor-pointer">
                <span>Load JSON</span>
                <input type="file" accept=".json" onChange={(e) => handleFileUpload(e)} className="hidden" />
              </label>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-950/20 border border-slate-850 rounded-2xl p-4 text-xs font-mono text-slate-250 focus:outline-none focus:border-[#4E8E5E] resize-none outline-none"
          />

          <div className="flex gap-3 pt-2 border-t border-slate-850">
            <button onClick={handleCsvToJson} className="btn-primary flex-1 py-3 flex items-center justify-center gap-1.5">
              <ArrowRightLeft size={16} />
              <span>CSV → JSON</span>
            </button>
            <button onClick={handleJsonToCsv} className="btn-secondary flex-1 py-2.5 text-xs flex items-center justify-center gap-1.5">
              <ArrowRightLeft size={16} />
              <span>JSON → CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control & Result Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Settings Panel */}
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5">
            <Settings size={16} className="text-[#4E8E5E]" />
            <span>Converter Options</span>
          </h3>

          {/* Delimiter Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 font-semibold">CSV Separator Delimiter</label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value=",">Comma ( , )</option>
              <option value=";">Semicolon ( ; )</option>
              <option value="\t">Tab space ( \t )</option>
            </select>
          </div>

          {/* Pretty Printing Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 font-semibold">JSON Indentation</label>
            <select
              value={indentation}
              onChange={(e) => setIndentation(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="2">2 Spaces indentation</option>
              <option value="4">4 Spaces indentation</option>
              <option value="compact">Compact / Minified</option>
            </select>
          </div>
        </div>

        {/* Output Area */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Quick Export</span>
          {output ? (
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="btn-secondary w-full py-2.5 text-xs"
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={() => triggerTextDownload(output, output.trim().startsWith('[') ? 'output.json' : 'output.csv')}
                className="btn-primary w-full py-3"
              >
                <Download size={18} />
                <span>Save Result File</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4 text-center">Run convert to generate outputs</p>
          )}
        </div>
      </div>

      {/* Global Output Textbox under panels */}
      {output && (
        <div className="lg:col-span-12 flex flex-col gap-3">
          <div className="glass-card p-6 flex flex-col gap-3">
            <span className="text-sm font-bold text-slate-200">Result Output Console</span>
            <textarea
              readOnly
              value={output}
              className="w-full bg-slate-950 p-4 text-xs font-mono text-slate-300 rounded-2xl border border-slate-900 resize-y min-h-[220px] focus:outline-none outline-none leading-relaxed"
            />
          </div>
        </div>
      )}
    </div>
  );
};
