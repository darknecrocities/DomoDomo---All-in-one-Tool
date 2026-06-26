import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, ShieldCheck, Copy, RefreshCcw, AlertTriangle } from 'lucide-react';

interface HashResult {
  algorithm: string;
  hash: string;
  timeMs: number;
}

export const FileHashCheckerTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [results, setResults] = useState<HashResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [compareHash, setCompareHash] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bufferToHex = (buffer: ArrayBuffer) => {
    const hashArray = Array.from(new Uint8Array(buffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const computeHashes = async (selectedFile: File) => {
    setIsHashing(true);
    setResults([]);
    setError(null);
    
    // File size limit check (e.g., 500MB) due to ArrayBuffer memory constraints
    if (selectedFile.size > 500 * 1024 * 1024) {
      setError('File is too large (max 500MB) for in-memory browser hashing.');
      setIsHashing(false);
      return;
    }

    try {
      const buffer = await selectedFile.arrayBuffer();
      const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
      const newResults: HashResult[] = [];

      for (const algo of algos) {
        const start = performance.now();
        const hashBuffer = await crypto.subtle.digest(algo, buffer);
        const hashHex = bufferToHex(hashBuffer);
        const end = performance.now();
        
        newResults.push({
          algorithm: algo,
          hash: hashHex,
          timeMs: Math.round(end - start)
        });
      }
      
      setResults(newResults);
    } catch (err: any) {
      setError(err.message || 'An error occurred while hashing the file.');
    } finally {
      setIsHashing(false);
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      computeHashes(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      computeHashes(selectedFile);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const reset = () => {
    setFile(null);
    setResults([]);
    setError(null);
    setCompareHash('');
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left">
        <h3 className="font-bold text-[#ECEBE9] text-lg flex items-center gap-2">
          <ShieldCheck size={20} className="text-[#3C6B4D]" />
          Verify File Integrity
        </h3>
        <p className="text-[#A3A09B] text-xs">
          Select a file to securely calculate its cryptographic hashes (SHA-1, SHA-256, SHA-384, SHA-512) directly within your browser. 
          Your file is processed locally and never uploaded anywhere.
        </p>
      </div>

      {!file ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`glass-card border-2 border-dashed flex flex-col items-center justify-center p-16 cursor-pointer transition-all ${
            isDragging ? 'border-[#3C6B4D] bg-[#3C6B4D]/5' : 'border-[#2A2D30] bg-[#111213]/40 hover:border-[#3C6B4D]/50 hover:bg-[#18191B]'
          }`}
        >
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <div className="w-16 h-16 rounded-2xl bg-[#18191B] border border-[#2A2D30] flex items-center justify-center mb-4 text-[#3C6B4D] shadow-lg">
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#ECEBE9] tracking-tight">Select or Drop File Here</h3>
          <p className="text-[#72706C] text-sm mt-2 max-w-sm text-center">
            Supports any file type. Max size is 500MB for browser-based hashing constraints.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 border-[#2A2D30] bg-[#111213] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="p-4 rounded-xl bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 shrink-0">
                <FileText size={24} />
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                <h4 className="font-bold text-[#ECEBE9] text-base truncate">{file.name}</h4>
                <div className="flex items-center gap-3 text-[11px] text-[#72706C] font-mono">
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>{file.type || 'Unknown Type'}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={reset}
              className="btn-secondary py-2 px-4 text-xs shrink-0 flex items-center gap-2"
            >
              <RefreshCcw size={14} />
              <span>Select Another File</span>
            </button>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-xs text-rose-450 font-semibold flex items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {isHashing ? (
            <div className="glass-card p-12 border-[#2A2D30] bg-[#18191B] flex flex-col items-center justify-center gap-4">
              <div className="animate-spin w-8 h-8 border-4 border-[#3C6B4D] border-t-transparent rounded-full"></div>
              <p className="text-[#ECEBE9] font-bold text-sm">Computing hashes locally...</p>
              <p className="text-[#72706C] text-[10px] font-mono">This may take a few seconds for large files</p>
            </div>
          ) : results.length > 0 && (
            <div className="flex flex-col gap-4">
              {/* Comparison tool */}
              <div className="glass-card p-4 border-[#2A2D30] bg-[#18191B] flex flex-col md:flex-row gap-3 items-center">
                <input 
                  type="text" 
                  placeholder="Paste a hash here to verify..." 
                  value={compareHash}
                  onChange={(e) => setCompareHash(e.target.value.trim().toLowerCase())}
                  className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-4 py-2.5 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] transition-all placeholder:text-[#72706C]"
                />
                {compareHash && (
                  <div className="shrink-0 flex items-center text-xs font-bold font-mono">
                    {results.some(r => r.hash.toLowerCase() === compareHash) ? (
                      <span className="text-[#3C6B4D] flex items-center gap-1 bg-[#3C6B4D]/10 px-3 py-1.5 rounded-lg border border-[#3C6B4D]/20">
                        <ShieldCheck size={14} /> MATCH FOUND
                      </span>
                    ) : (
                      <span className="text-rose-450 flex items-center gap-1 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/25">
                        <AlertTriangle size={14} /> NO MATCH
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Hash list */}
              <div className="grid grid-cols-1 gap-3">
                {results.map((res) => {
                  const isMatch = compareHash === res.hash.toLowerCase();
                  return (
                    <div 
                      key={res.algorithm} 
                      className={`glass-card p-4 border flex flex-col gap-2 transition-colors ${
                        isMatch ? 'border-[#3C6B4D] bg-[#3C6B4D]/5' : 'border-[#2A2D30] bg-[#111213]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[#A3A09B] font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                          {res.algorithm}
                          {isMatch && <span className="w-2 h-2 rounded-full bg-[#3C6B4D] animate-pulse" />}
                        </span>
                        <span className="text-[#72706C] text-[10px] font-mono">{res.timeMs}ms</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="w-full bg-[#18191B] rounded-lg border border-[#2A2D30] p-2.5 overflow-x-auto scrollbar-none">
                          <code className={`text-xs break-all ${isMatch ? 'text-[#3C6B4D] font-bold' : 'text-[#ECEBE9]'}`}>
                            {res.hash}
                          </code>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(res.hash)}
                          className="shrink-0 p-2.5 bg-[#18191B] border border-[#2A2D30] rounded-lg text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022] transition-colors shadow-sm"
                          title="Copy to clipboard"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
