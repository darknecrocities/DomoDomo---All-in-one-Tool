import { triggerTextDownload, triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { FileCode, Upload, Download, Check, ShieldAlert, RefreshCw, Sparkles } from 'lucide-react';

export const Base64Tool = () => {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [inputText, setInputText] = useState('Hello DomoDomo!');
  const [outputText, setOutputText] = useState('');
  const [fileBase64, setFileBase64] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [copied, setCopied] = useState(false);

  const handleEncodeText = () => {
    try {
      setOutputText(btoa(inputText));
    } catch (e) {
      setOutputText('Error encoding: String contains non-ASCII characters. Use UTF-8 escape methods.');
    }
  };

  const handleDecodeText = () => {
    try {
      setOutputText(atob(inputText));
    } catch (e) {
      setOutputText('Error decoding: String is not a valid base64 representation.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(1) + ' KB');
      
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setFileBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadBase64Text = () => {
    if (!fileBase64) return;
    triggerTextDownload(fileBase64, `${fileName}_base64.txt`);
  };

  const handleDecodeFile = () => {
    if (!inputText.trim()) return;
    try {
      // Decode data URL or plain string back to binary file
      let base64 = inputText.trim();
      let mime = 'application/octet-stream';
      if (base64.startsWith('data:')) {
        const parts = base64.split(',');
        mime = parts[0].split(':')[1].split(';')[0];
        base64 = parts[1];
      }

      const binaryStr = atob(base64);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: mime });
      const ext = mime.split('/')[1] || 'bin';
      triggerBlobDownload(blob, `decoded_file.${ext}`);
    } catch (e) {
      alert('Failed to decode Base64 string back into binary file.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Input panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCode className="text-[#4E8E5E]" size={22} />
              <span>Base64 String & File Converter</span>
            </h2>
            
            {/* Mode Select */}
            <div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <button onClick={() => setMode('text')} className={`px-3 py-1 rounded-md font-semibold ${mode === 'text' ? 'bg-[#4E8E5E] text-white' : 'text-slate-500 hover:text-slate-350'}`}>Text String</button>
              <button onClick={() => setMode('file')} className={`px-3 py-1 rounded-md font-semibold ${mode === 'file' ? 'bg-[#4E8E5E] text-white' : 'text-slate-500 hover:text-slate-350'}`}>File Encoder</button>
            </div>
          </div>

          {mode === 'text' ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Input Content</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#4E8E5E] h-32 resize-none leading-relaxed outline-none"
                />
              </div>

              {outputText && (
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-xs text-slate-455 font-bold uppercase tracking-wider">Output Result</span>
                  <textarea
                    readOnly
                    value={outputText}
                    className="w-full bg-slate-950 p-4 text-xs font-mono h-32 rounded-2xl border border-slate-900 text-slate-300 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {!fileName ? (
                <div className="border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-950/20 text-center flex flex-col items-center gap-3">
                  <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
                    <Upload size={32} />
                  </div>
                  <label className="btn-primary cursor-pointer mt-1">
                    <span>Choose File to Encode</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-slate-500 text-xs">Supports images, documents, audio up to 5MB</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center bg-slate-900/30 p-3 rounded-xl border border-slate-850 text-xs">
                    <div className="flex flex-col">
                      <span className="text-slate-200 font-semibold">{fileName}</span>
                      <span className="text-[10px] text-slate-450">{fileSize}</span>
                    </div>
                    <button onClick={() => { setFileName(''); setFileBase64(''); }} className="text-rose-455 hover:underline font-bold">Remove</button>
                  </div>

                  {fileBase64 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-xs text-slate-455 font-bold uppercase tracking-wider">Base64 Data Stream</span>
                      <textarea
                        readOnly
                        value={fileBase64.slice(0, 1000) + (fileBase64.length > 1000 ? ' ... [Truncated]' : '')}
                        className="w-full bg-slate-950 p-4 text-[10px] font-mono h-32 rounded-2xl border border-slate-900 text-slate-350 focus:outline-none resize-none leading-normal"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Control panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Actions</h3>

          <div className="flex flex-col gap-2 pt-2">
            {mode === 'text' ? (
              <div className="flex flex-col gap-2">
                <button onClick={handleEncodeText} className="btn-primary w-full py-3 flex items-center justify-center gap-1.5">
                  <Sparkles size={18} />
                  <span>Encode Text</span>
                </button>
                <button onClick={handleDecodeText} className="btn-secondary w-full py-2.5 text-xs flex items-center justify-center gap-1.5">
                  <RefreshCw size={14} />
                  <span>Decode Text</span>
                </button>
                <button onClick={handleDecodeFile} className="btn-secondary w-full py-2.5 text-xs">
                  <span>Decode String to File</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDownloadBase64Text}
                  disabled={!fileBase64}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-1.5"
                >
                  <Download size={18} />
                  <span>Download Base64 TXT</span>
                </button>
                {fileBase64 && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(fileBase64);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="btn-secondary w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
                  >
                    {copied ? <Check size={14} className="text-green-400" /> : null}
                    <span>{copied ? 'Copied URL!' : 'Copy Data URL'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Client-Side Parsing</span>
            <span className="text-[10px] leading-relaxed">No data leaves your computer. File stream buffers are mapped to base64 fully offline.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
