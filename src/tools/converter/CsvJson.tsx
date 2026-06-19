import { triggerTextDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { FileText, ArrowRightLeft, Download } from 'lucide-react';

export const CsvJsonTool = () => {
  const [input, setInput] = useState('name,age,skills\n"Doe, John",28,"React, TS"\n"Jane Smith",24,"Node, Wasm"');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  // Advanced CSV parsing to handle comma encapsulation in double quotes
  const parseCsv = (csvText: string) => {
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
        } else if (char === ',' && !inQuotes) {
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
      const list = parseCsv(input);
      setOutput(JSON.stringify(list, null, 2));
    } catch (e) {
      setOutput('Error parsing CSV. Please check formatting.');
    }
  };

  const handleJsonToCsv = () => {
    try {
      const parsed = JSON.parse(input);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      if (list.length === 0) return;

      const headers = Object.keys(list[0]);
      const csvLines = [headers.join(',')];

      list.forEach((obj: any) => {
        const row = headers.map(h => {
          const val = obj[h] !== undefined ? String(obj[h]) : '';
          // Wrap in quotes if it contains commas
          if (val.includes(',') || val.includes('"')) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        });
        csvLines.push(row.join(','));
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
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 h-[500px] justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="text-[#4E8E5E]" size={18} />
              <span>Input CSV or JSON Data</span>
            </h2>
            
            {/* Upload Handles */}
            <div className="flex gap-2">
              <label className="py-1 px-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-400 flex items-center gap-1 hover:text-slate-200 cursor-pointer">
                <span>Load CSV</span>
                <input type="file" accept=".csv" onChange={(e) => handleFileUpload(e)} className="hidden" />
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

      {/* Output Panel */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 h-[500px] justify-between">
          <span className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Result View</span>
          
          <textarea
            readOnly
            value={output}
            placeholder="Parsed format result prints here..."
            className="flex-1 bg-slate-950 p-4 text-xs font-mono text-slate-300 rounded-2xl border border-slate-900 resize-none focus:outline-none outline-none leading-relaxed"
          />

          {output && (
            <div className="flex gap-2.5 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="btn-secondary flex-1 py-2 text-xs"
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              <button
                onClick={() => triggerTextDownload(output, output.trim().startsWith('[') ? 'output.json' : 'output.csv')}
                className="btn-primary flex-1 py-3"
              >
                <Download size={18} />
                <span>Save Result File</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
