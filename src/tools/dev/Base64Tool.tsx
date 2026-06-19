import { useState, useRef } from 'react';
import { handleTextCopy, triggerBlobDownload } from '../../utils/sharedHelpers';
import { FileText, Download, Clipboard, Check, AlertCircle, FileUp } from 'lucide-react';

export const Base64Tool = () => {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  
  // Text Mode state
  const [inputText, setInputText] = useState('DomoDomo - All-in-One Utility Suite');
  const [outputText, setOutputText] = useState('');
  const [isUrlSafe, setIsUrlSafe] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // File Mode state
  const [fileBase64, setFileBase64] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEncodeText = () => {
    try {
      setError('');
      if (!inputText) {
        setOutputText('');
        return;
      }
      let encoded = btoa(unescape(encodeURIComponent(inputText)));
      if (isUrlSafe) {
        encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }
      setOutputText(encoded);
    } catch (e: any) {
      setError('Encoding failed. Verify input encoding.');
    }
  };

  const handleDecodeText = () => {
    try {
      setError('');
      if (!inputText) {
        setOutputText('');
        return;
      }
      let target = inputText;
      if (isUrlSafe) {
        target = target.replace(/-/g, '+').replace(/_/g, '/');
        while (target.length % 4) target += '=';
      }
      const decoded = decodeURIComponent(escape(atob(target)));
      setOutputText(decoded);
    } catch (e: any) {
      setError('Invalid base64 string provided for decoding.');
      setOutputText('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileBase64(result);
    };
    reader.readAsDataURL(file);
  };

  // Convert Base64 back into downloadable binary file
  const handleDownloadBase64AsFile = () => {
    try {
      if (!fileBase64.trim()) return;
      
      const arr = fileBase64.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch || arr.length < 2) {
        // Assume plain binary octet if no prefix
        const bstr = atob(fileBase64);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        triggerBlobDownload(new Blob([u8arr], { type: 'application/octet-stream' }), 'decoded_binary.bin');
        return;
      }
      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      
      const extension = mime.split('/')[1] || 'bin';
      triggerBlobDownload(new Blob([u8arr], { type: mime }), `decoded_file.${extension}`);
    } catch (e) {
      alert('Could not decode. Verify base64 string contains valid headers.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <FileText size={18} className="text-teal-400" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">Base64 Encoder & Decoder</h3>
          <p className="text-[10px] text-slate-500">Convert plain text or binary files into standard base64 structures</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">Text & File</span>
      </div>

      {/* Mode selectors */}
      <div className="flex gap-2">
        {(['text', 'file'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border capitalize transition-all ${
              mode === m ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 bg-slate-900 text-slate-400'
            }`}>
            {m === 'text' ? '📝 String Text Mode' : '📂 Binary File Mode'}
          </button>
        ))}
      </div>

      {mode === 'text' ? (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-slate-500 uppercase font-semibold">Source Text / Code</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text string here..."
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono h-60 text-slate-200 resize-none w-full focus:outline-none focus:border-teal-500/50"
              />
            </div>

            {/* Output */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] text-slate-500 uppercase font-semibold">Base64 Output</label>
              {outputText ? (
                <textarea
                  readOnly
                  value={outputText}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono h-60 text-emerald-400 resize-none w-full focus:outline-none"
                />
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-xl h-60 flex flex-col items-center justify-center text-slate-600 text-xs text-center p-4">
                  {error ? (
                    <div className="flex flex-col items-center gap-2 text-rose-450">
                      <AlertCircle size={22} />
                      <span className="font-bold">Base64 Error</span>
                      <span className="text-[10px] text-slate-500">{error}</span>
                    </div>
                  ) : (
                    <span>Click Encode or Decode to see results</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Config switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-850 items-center">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={isUrlSafe} onChange={(e) => setIsUrlSafe(e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 rounded" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-350">URL Safe Encoding</span>
                <span className="text-[8px] text-slate-500">Replaces + with - and / with _</span>
              </div>
            </label>

            <div className="flex gap-2">
              <button onClick={handleEncodeText}
                className="flex-1 btn-primary py-2 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
                Encode Text
              </button>
              <button onClick={handleDecodeText}
                className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 py-2 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md">
                Decode Base64
              </button>
            </div>
          </div>

          {outputText && (
            <div className="flex gap-2">
              <button onClick={() => handleTextCopy(outputText, setCopied)}
                className="flex-1 btn-secondary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5">
                {copied ? <Check size={14} className="text-teal-400" /> : <Clipboard size={14} />}
                {copied ? 'Copied Output' : 'Copy Result'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* File upload block */}
            <div className="md:col-span-5 flex flex-col gap-3">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Upload Local File</span>
              <label className="flex flex-col items-center gap-3 py-10 border-2 border-dashed border-slate-700/60 rounded-xl cursor-pointer hover:border-teal-500/50 hover:bg-slate-950/20 transition-all justify-center">
                <FileUp size={32} className="text-teal-400 animate-bounce" />
                <span className="text-slate-300 text-xs font-semibold">Select File to Encode</span>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              </label>

              {uploadedFile && (
                <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-[10px] font-mono flex flex-col gap-1">
                  <div className="text-slate-300 truncate">Name: {uploadedFile.name}</div>
                  <div className="text-slate-550">Type: {uploadedFile.type || 'unknown'}</div>
                  <div className="text-slate-550">Size: {(uploadedFile.size / 1024).toFixed(1)} KB</div>
                </div>
              )}
            </div>

            {/* Base64 dataURL results */}
            <div className="md:col-span-7 flex flex-col gap-3">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">File Base64 Data String</span>
              <textarea
                value={fileBase64}
                onChange={(e) => setFileBase64(e.target.value)}
                placeholder="Paste file base64 dataURL here to convert back to binary file..."
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-mono h-48 text-slate-200 resize-none w-full focus:outline-none focus:border-teal-500/50 break-all"
              />

              {fileBase64 && (
                <div className="flex gap-2">
                  <button onClick={() => handleTextCopy(fileBase64, setCopied)}
                    className="flex-1 btn-secondary py-1.5 text-xs font-semibold flex items-center justify-center gap-1">
                    {copied ? <Check size={12} className="text-teal-400" /> : <Clipboard size={12} />}
                    Copy Base64
                  </button>
                  <button onClick={handleDownloadBase64AsFile}
                    className="flex-1 btn-primary py-1.5 text-xs font-semibold flex items-center justify-center gap-1">
                    <Download size={12} /> Download Decoded File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
