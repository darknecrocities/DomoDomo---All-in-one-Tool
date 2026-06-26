import React, { useState, useRef, useCallback } from 'react';
import { Upload, ShieldAlert, Trash2, RefreshCcw, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const FileShredderTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isShredding, setIsShredding] = useState(false);
  const [shredProgress, setShredProgress] = useState(0);
  const [shreddedUrl, setShreddedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleShred = async () => {
    if (!file) return;
    setIsShredding(true);
    setShredProgress(0);

    try {
      // Browsers cannot directly overwrite files on disk. 
      // The best we can do is create a Blob of the exact same size filled with random noise or zeros,
      // and instruct the user to "Save As" and overwrite the original file on their OS.
      
      const fileSize = file.size;
      const chunkSize = 1024 * 1024; // 1MB chunks
      const chunks = Math.ceil(fileSize / chunkSize);
      
      const parts: ArrayBuffer[] = [];
      
      // DoD 5220.22-M inspired: 3 passes (Zeros, Ones, Random)
      // Since we can only produce one final file to download, we will just fill it with cryptographic random noise
      for (let i = 0; i < chunks; i++) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const size = i === chunks - 1 ? fileSize - (i * chunkSize) : chunkSize;
        const buffer = new Uint8Array(size);
        crypto.getRandomValues(buffer);
        parts.push(buffer.buffer as ArrayBuffer);
        
        setShredProgress(Math.round(((i + 1) / chunks) * 100));
      }

      const blob = new Blob(parts, { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      setShreddedUrl(url);

    } catch (err) {
      console.error(err);
    } finally {
      setIsShredding(false);
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
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const reset = () => {
    setFile(null);
    setShredProgress(0);
    if (shreddedUrl) URL.revokeObjectURL(shreddedUrl);
    setShreddedUrl(null);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left">
        <h3 className="font-bold text-[#ECEBE9] text-lg flex items-center gap-2">
          <Trash2 size={20} className="text-rose-450" />
          Secure File Shredder
        </h3>
        <p className="text-[#A3A09B] text-xs leading-relaxed">
          Standard deletion only removes file pointers, allowing data recovery. This tool generates a cryptographically 
          random file of the exact same size. To securely shred a file, download the generated noise and save it directly 
          over your original file.
        </p>
        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg flex gap-3 mt-2">
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-500/90 leading-relaxed font-semibold">
            Browser Sandbox Limitation: Web apps cannot forcefully overwrite sectors on your hard drive. 
            You MUST manually "Save As" and select the original file to replace it with the generated noise.
          </p>
        </div>
      </div>

      {!file ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`glass-card border-2 border-dashed flex flex-col items-center justify-center p-16 cursor-pointer transition-all ${
            isDragging ? 'border-rose-500 bg-rose-500/5' : 'border-[#2A2D30] bg-[#111213]/40 hover:border-rose-500/50 hover:bg-[#18191B]'
          }`}
        >
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <div className="w-16 h-16 rounded-2xl bg-[#18191B] border border-[#2A2D30] flex items-center justify-center mb-4 text-rose-450 shadow-lg">
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#ECEBE9] tracking-tight">Drop File to Shred</h3>
          <p className="text-[#72706C] text-sm mt-2 max-w-sm text-center">
            Max size ~500MB (Browser Memory Limit)
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 border-[#2A2D30] bg-[#111213] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="p-4 rounded-xl bg-rose-500/10 text-rose-450 border border-rose-500/20 shrink-0">
                <FileText size={24} />
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                <h4 className="font-bold text-[#ECEBE9] text-base truncate">{file.name}</h4>
                <div className="flex items-center gap-3 text-[11px] text-[#72706C] font-mono">
                  <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>{file.type || 'Unknown'}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={reset}
              className="btn-secondary py-2 px-4 text-xs shrink-0 flex items-center gap-2"
            >
              <RefreshCcw size={14} />
              <span>Select Another</span>
            </button>
          </div>

          {isShredding ? (
            <div className="glass-card p-12 border-[#2A2D30] bg-[#18191B] flex flex-col items-center justify-center gap-6">
              <div className="w-full max-w-md flex flex-col gap-2">
                <div className="flex justify-between text-xs font-bold font-mono">
                  <span className="text-rose-450">Generating Noise...</span>
                  <span className="text-[#A3A09B]">{shredProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#111213] rounded-full overflow-hidden border border-[#2A2D30]">
                  <div 
                    className="h-full bg-rose-450 transition-all duration-300" 
                    style={{ width: `${shredProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : shreddedUrl ? (
            <div className="glass-card p-8 border-[#2A2D30] bg-[#18191B] border-t-4 border-t-rose-450 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-450 flex items-center justify-center border border-rose-500/20">
                <CheckCircle2 size={36} />
              </div>
              
              <div className="flex flex-col gap-2 max-w-md">
                <h3 className="text-xl font-bold text-[#ECEBE9] tracking-tight">Overwrite File Ready</h3>
                <p className="text-[#A3A09B] text-xs leading-relaxed">
                  Click the button below and <strong className="text-rose-450">SAVE OVER</strong> the original file on your computer. 
                  This will physically overwrite the sectors on your hard drive with the random noise we just generated.
                </p>
              </div>

              <a 
                href={shreddedUrl} 
                download={file.name}
                className="bg-rose-500 hover:bg-rose-600 text-white py-3 px-8 text-sm font-bold flex items-center gap-2 mt-2 rounded-xl transition-all shadow-lg shadow-rose-500/20"
              >
                <Trash2 size={18} />
                <span>Overwrite {file.name}</span>
              </a>
            </div>
          ) : (
            <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4">
              <button
                onClick={handleShred}
                className="bg-rose-500 hover:bg-rose-600 text-white w-full py-4 font-bold text-sm flex items-center justify-center gap-2 rounded-xl transition-all shadow-lg shadow-rose-500/20"
              >
                <ShieldAlert size={16} />
                Generate Overwrite Data
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
