import { useState } from 'react';
import { Upload, FileText, ShieldAlert, Maximize2 } from 'lucide-react';

export const PDFViewerTool = () => {
  const [url, setUrl] = useState('');
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setUrl(URL.createObjectURL(file));
      setFileInfo({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 text-left ${isFullscreen ? 'fixed inset-0 z-50 bg-[#0B0F19] p-6' : ''}`}>
      {/* Viewer workspace */}
      <div className={`lg:col-span-8 flex flex-col gap-6 ${isFullscreen ? 'lg:col-span-12 h-full' : 'h-[600px]'}`}>
        <div className="glass-card p-6 flex flex-col gap-4 h-full relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-[#4E8E5E]" size={22} />
              <span>PDF Local Sandbox Reader</span>
            </h2>
            {url && (
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 text-slate-400 hover:text-slate-200 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
              >
                <Maximize2 size={16} />
              </button>
            )}
          </div>

          {url ? (
            <div className="flex-1 rounded-2xl border border-slate-800 bg-[#1e293b]/10 overflow-hidden shadow-inner p-1 relative">
              <iframe
                src={url}
                className="w-full h-full rounded-xl bg-slate-950/40 border-0"
                title="Local PDF Reader Frame"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 p-8 text-center gap-3">
              <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
                <Upload size={32} />
              </div>
              <label className="btn-primary cursor-pointer mt-1">
                <span>Open PDF Document</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
              <p className="text-slate-500 text-xs">Selected PDF will load fully offline within your browser Sandbox</p>
            </div>
          )}
        </div>
      </div>

      {/* Info sidebar */}
      {!isFullscreen && (
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card p-6 flex flex-col gap-5">
            <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Document details</h3>

            {fileInfo ? (
              <div className="flex flex-col gap-3 bg-slate-900/40 p-4 rounded-xl border border-slate-850 text-xs">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-slate-500 font-medium">Filename:</span>
                  <span className="text-slate-200 font-semibold truncate leading-relaxed">{fileInfo.name}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-500 font-medium">File size:</span>
                  <span className="text-slate-200 font-semibold">{fileInfo.size}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                No active document opened. Load a PDF file on the left workspace area to start viewing.
              </p>
            )}

            {url && (
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                <label className="btn-secondary w-full py-2.5 text-xs text-center cursor-pointer">
                  <span>Replace active file</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Privacy Sandbox Card */}
          <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400">
            <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-slate-300">Secure Offline Sandbox</span>
              <span className="text-[10px] leading-relaxed">Files are rendered directly using local URL references in a isolated browser frame. No credentials or logs are captured.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
