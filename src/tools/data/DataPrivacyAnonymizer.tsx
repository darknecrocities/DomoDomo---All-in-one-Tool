import { useState, useMemo } from 'react';
import { Sliders, Copy, Check, Download, AlertCircle, Play, EyeOff } from 'lucide-react';

// Hardcoded mock dictionaries for fake replacement mapping locally
const mockNames = ['Alice Carter', 'Bob Sterling', 'Charlie Green', 'David Miller', 'Emma Vance', 'Frank Reynolds'];
const mockDomains = ['mockmail.net', 'anonprivacy.org', 'testbox.com', 'securepost.io'];

export const DataPrivacyAnonymizerTool = () => {
  const [inputText, setInputText] = useState(`[
  {"id": 1, "name": "Arron Kian Parejas", "email": "arron@domodomo.site", "phone": "0917-123-4567", "city": "Manila"},
  {"id": 2, "name": "Ram Guinto", "email": "ram@domodomo.site", "phone": "0918-987-6543", "city": "Quezon City"},
  {"id": 3, "name": "John Doe", "email": "johndoe@example.com", "phone": "0920-555-0199", "city": "Cebu City"}
]`);

  const [records, setRecords] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Field rules maps: field_name -> anonymization_type
  const [fieldRules, setFieldRules] = useState<Record<string, 'keep' | 'mask' | 'hash' | 'fake_name' | 'fake_email' | 'fake_phone'>>({});
  const [copied, setCopied] = useState<boolean>(false);


  const handleParse = () => {
    try {
      setErrorMsg(null);
      const parsed = JSON.parse(inputText);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON input must be an array of objects.");
      }
      if (parsed.length === 0) {
        throw new Error("JSON array cannot be empty.");
      }

      setRecords(parsed);
      
      // Auto-assign default rules (keep by default)
      const keys = Object.keys(parsed[0]);
      const initialRules: Record<string, any> = {};
      keys.forEach(k => {
        initialRules[k] = 'keep';
      });
      setFieldRules(initialRules);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to parse JSON dataset.");
      setRecords([]);
    }
  };

  const detectedKeys = useMemo(() => {
    if (records.length === 0) return [];
    return Object.keys(records[0]);
  }, [records]);

  // Apply privacy rules to dataset records
  const anonymizedRecords = useMemo(() => {
    if (records.length === 0) return [];

    // Helper functions
    const applyRule = (val: any, rule: string, idx: number) => {
      if (val === undefined || val === null) return '';

      const strVal = String(val);

      switch (rule) {
        case 'mask': {
          // Keep first 2 and last 2, mask the rest
          if (strVal.length <= 4) return '***';
          return strVal.substring(0, 2) + '*'.repeat(strVal.length - 4) + strVal.substring(strVal.length - 2);
        }
        case 'hash': {
          // Simple hash simulation since crypto.subtle is async, using djb2 integer hash for robustness
          let hash = 5381;
          for (let i = 0; i < strVal.length; i++) {
            hash = ((hash << 5) + hash) + strVal.charCodeAt(i);
          }
          return `hash_${Math.abs(hash).toString(16)}`;
        }
        case 'fake_name': {
          return mockNames[idx % mockNames.length];
        }
        case 'fake_email': {
          const cleanName = mockNames[idx % mockNames.length].toLowerCase().replace(/\s+/g, '.');
          const domain = mockDomains[idx % mockDomains.length];
          return `${cleanName}@${domain}`;
        }
        case 'fake_phone': {
          return `0915-${(1000000 + idx * 7777).toString().substring(1, 8)}`;
        }
        case 'keep':
        default:
          return val;
      }
    };

    return records.map((record, rIdx) => {
      const anonymized: Record<string, any> = {};
      Object.keys(record).forEach(k => {
        const rule = fieldRules[k] || 'keep';
        anonymized[k] = applyRule(record[k], rule, rIdx);

      });
      return anonymized;
    });
  }, [records, fieldRules]);

  const outputJsonText = useMemo(() => {
    if (anonymizedRecords.length === 0) return '';
    return JSON.stringify(anonymizedRecords, null, 2);
  }, [anonymizedRecords]);

  const handleCopy = () => {
    if (outputJsonText) {
      navigator.clipboard.writeText(outputJsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDownload = () => {
    if (outputJsonText) {
      const blob = new Blob([outputJsonText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anonymized_privacy_data.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Configure sidebar */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-[#ECEBE9] border-b border-[#2A2D30] pb-2.5 flex items-center gap-1.5">
            <Sliders size={15} className="text-[#3C6B4D]" />
            <span>Dataset & Anonymization Rules</span>
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Source JSON Array Dataset</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              className="bg-[#111213] border border-[#2A2D30] rounded-xl p-3.5 text-xs font-mono text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] leading-relaxed"
              placeholder="Paste JSON array containing objects..."
            />
          </div>

          <button
            onClick={handleParse}
            className="py-2.5 px-4 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <Play size={13} />
            <span>Load JSON Fields</span>
          </button>

          {errorMsg && (
            <div className="bg-rose-950/20 border border-rose-500/30 text-rose-400 p-3 rounded-xl flex items-start gap-2 text-xs">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {detectedKeys.length > 0 && (
            <div className="border-t border-[#2A2D30] pt-4 space-y-3.5">
              <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Configure Field Mask Rules</label>
              
              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {detectedKeys.map(k => {
                  const activeRule = fieldRules[k] || 'keep';
                  return (
                    <div key={k} className="flex flex-col gap-1.5 bg-[#111213] border border-[#2A2D30] p-2.5 rounded-xl">
                      <span className="text-xs font-mono font-bold text-[#ECEBE9]">{k}</span>
                      <select
                        value={activeRule}
                        onChange={(e) => setFieldRules(prev => ({ ...prev, [k]: e.target.value as any }))}
                        className="bg-[#18191B] border border-[#2A2D30]/65 text-[10px] text-[#ECEBE9] px-2 py-1 rounded focus:outline-none"
                      >
                        <option value="keep">Keep Original Value</option>
                        <option value="mask">Mask characters (e.g. jo***ne)</option>
                        <option value="hash">Hash value (djb2 HEX)</option>
                        <option value="fake_name">Fake Name Placeholder</option>
                        <option value="fake_email">Fake Email Placeholder</option>
                        <option value="fake_phone">Fake Phone Placeholder</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparisons outputs column */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="glass-card p-6 border border-[#2A2D30] rounded-2xl flex flex-col gap-4">
          <div className="pb-3 border-b border-[#2A2D30] flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-1.5">
              <EyeOff size={15} className="text-[#3C6B4D]" />
              <span>Anonymized Output JSON</span>
            </h4>
            {anonymizedRecords.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="py-1 px-3 bg-[#111213] hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded-lg text-xs font-bold border border-[#2A2D30] flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>Copy JSON</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="py-1 px-3 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download size={12} />
                  <span>Download JSON</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] max-h-[360px] overflow-y-auto">
            {anonymizedRecords.length === 0 ? (
              <div className="text-center p-12 space-y-1.5 text-xs text-[#A3A09B]">
                <p className="font-semibold">No dataset processed.</p>
                <p className="text-[#72706C]">Load your JSON array and apply rules to compile privacy reports.</p>
              </div>
            ) : (
              <pre className="text-[10px] font-mono text-[#E29E2D] leading-relaxed break-all select-all">
                {outputJsonText}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
