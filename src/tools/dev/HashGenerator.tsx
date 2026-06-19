import { useState, useRef, useEffect } from 'react';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { Shield, FileUp, Clipboard, Check, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export const HashGeneratorTool = () => {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  
  // Text Mode state
  const [inputText, setInputText] = useState('DomoDomo');
  
  // File Mode state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Hash outputs
  const [algo, setAlgo] = useState<'SHA-256' | 'SHA-512' | 'SHA-384' | 'SHA-1'>('SHA-256');
  const [hashResult, setHashResult] = useState('');
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Matcher state
  const [expectedHash, setExpectedHash] = useState('');
  const [isMatch, setIsMatch] = useState<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const computeTextHash = async () => {
    if (!inputText) {
      setHashResult('');
      return;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(inputText);
    const hashBuffer = await crypto.subtle.digest(algo, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setHashResult(hashHex);
  };

  const computeFileHash = async (file: File) => {
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest(algo, arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setHashResult(hashHex);
    } catch (e) {
      console.error(e);
      alert('Failed to hash file. Make sure it is not locked.');
    }
    setProcessing(false);
  };

  // Re-run whenever input changes
  useEffect(() => {
    if (mode === 'text') {
      computeTextHash();
    } else if (mode === 'file' && selectedFile) {
      computeFileHash(selectedFile);
    } else {
      setHashResult('');
    }
  }, [inputText, algo, mode, selectedFile]);

  // Check expected hash match
  useEffect(() => {
    if (!expectedHash.trim() || !hashResult) {
      setIsMatch(null);
      return;
    }
    setIsMatch(hashResult.toLowerCase() === expectedHash.trim().toLowerCase());
  }, [expectedHash, hashResult]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
  };

  return (
    <div className="max-w-3xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Shield size={18} className="text-teal-400" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">Crypto Checksum & Hash Generator</h3>
          <p className="text-[10px] text-slate-500">Generate secure digest hashes of text or binary files locally in browser</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">SHA-512</span>
      </div>

      {/* Mode choice */}
      <div className="flex gap-2">
        {(['text', 'file'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setHashResult(''); setExpectedHash(''); }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border capitalize transition-all ${
              mode === m ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 bg-slate-900 text-slate-400'
            }`}>
            {m === 'text' ? '📝 String Text Mode' : '📂 Binary File Mode'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Settings block */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hash Parameters</span>

          {/* Algorithm selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 uppercase">Hashing Algorithm</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['SHA-256', 'SHA-512', 'SHA-384', 'SHA-1'] as const).map(a => (
                <button key={a} onClick={() => setAlgo(a)}
                  className={`py-1.5 text-[10px] font-bold rounded border transition-all ${
                    algo === a ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 bg-slate-950 text-slate-450'
                  }`}>{a}</button>
              ))}
            </div>
          </div>

          {/* Input text / file upload */}
          {mode === 'text' ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-semibold font-mono">Source String Text</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text..."
                className="bg-slate-905 border border-slate-800 rounded-xl p-3 text-xs font-mono h-36 text-slate-200 resize-none w-full focus:outline-none focus:border-teal-500"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3 bg-slate-900/35 border border-slate-850 p-4 rounded-xl">
              <label className="flex flex-col items-center gap-3 py-6 border border-dashed border-slate-800 rounded-xl cursor-pointer hover:border-teal-500/50 hover:bg-slate-950/20 transition-all justify-center">
                <FileUp size={28} className="text-teal-400" />
                <span className="text-slate-350 text-xs font-bold">Select Checksum File</span>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              </label>

              {selectedFile && (
                <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-[10px] font-mono flex flex-col gap-1">
                  <div className="text-slate-300 truncate">Name: {selectedFile.name}</div>
                  <div className="text-slate-550">Size: {(selectedFile.size / 1024).toFixed(1)} KB</div>
                </div>
              )}
            </div>
          )}

          {/* Result Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-500 uppercase font-semibold">Generated Hash ({algo})</label>
            {processing ? (
              <div className="h-16 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center gap-2">
                <RefreshCw size={14} className="animate-spin text-teal-400" />
                <span className="text-xs text-slate-500 font-bold uppercase">Computing Checksum...</span>
              </div>
            ) : hashResult ? (
              <div className="relative">
                <textarea
                  readOnly
                  value={hashResult}
                  className="bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs font-mono h-20 text-emerald-400 w-full resize-none focus:outline-none select-all"
                />
                <button onClick={() => handleTextCopy(hashResult, setCopied)}
                  className="absolute right-3.5 bottom-3.5 p-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-white shrink-0">
                  {copied ? <Check size={11} className="text-teal-400" /> : <Clipboard size={11} />}
                </button>
              </div>
            ) : (
              <div className="h-20 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center text-slate-600 text-xs">
                Waiting for input values
              </div>
            )}
          </div>
        </div>

        {/* Verification Side */}
        <div className="md:col-span-5 flex flex-col gap-4 border-l border-slate-800 md:pl-6">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Checksum Validation Matcher</span>

          <div className="flex flex-col gap-2 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
            <label className="text-[10px] text-slate-550 uppercase">Expected Hash Compare</label>
            <input
              type="text"
              value={expectedHash}
              onChange={(e) => setExpectedHash(e.target.value)}
              placeholder="Paste signature key to verify..."
              className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono w-full focus:outline-none"
            />
          </div>

          {/* Validation Status Indicator */}
          {isMatch !== null && (
            <div className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 ${
              isMatch ? 'bg-emerald-950/15 border-emerald-800/35 text-emerald-400' : 'bg-rose-950/15 border-rose-800/35 text-rose-400'
            }`}>
              {isMatch ? (
                <>
                  <CheckCircle2 size={24} className="text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Validation Match Successfully</span>
                  <span className="text-[9.5px] text-slate-450 leading-relaxed max-w-[200px]">The computed hash matches the expected signature exactly.</span>
                </>
              ) : (
                <>
                  <XCircle size={24} className="text-rose-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Mismatch Checksum Signature</span>
                  <span className="text-[9.5px] text-slate-450 leading-relaxed max-w-[200px]">The computed hash does NOT match the expected signature. Verify algorithm selection.</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
