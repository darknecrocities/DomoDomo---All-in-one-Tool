import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { Upload, Check, ShieldAlert, ImageIcon } from 'lucide-react';

interface ImageQueueItem {
  id: string;
  file: File;
  name: string;
  size: string;
  status: 'pending' | 'success' | 'error';
  blob?: Blob;
}

export const WebpJpgTool = () => {
  const [queue, setQueue] = useState<ImageQueueItem[]>([]);
  const [targetType, setTargetType] = useState<'webp' | 'jpeg'>('webp');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const items = Array.from(e.target.files).map(file => ({
      id: Math.random().toString(),
      file,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      status: 'pending' as const
    }));
    setQueue(prev => [...prev, ...items]);
    setSuccess(false);
  };

  const handleConvertBatch = async () => {
    if (queue.length === 0) return;
    setLoading(true);
    setSuccess(false);

    const updatedQueue = [...queue];

    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      if (item.status === 'success') continue;

      try {
        const url = URL.createObjectURL(item.file);
        const img = new Image();
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = url;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;

          if (targetType === 'jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0);

          await new Promise<void>((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) {
                updatedQueue[i] = {
                  ...item,
                  status: 'success',
                  blob
                };
              } else {
                updatedQueue[i] = { ...item, status: 'error' };
              }
              resolve();
            }, `image/${targetType}`, 0.90);
          });
        }
        URL.revokeObjectURL(url);
      } catch (err) {
        updatedQueue[i] = { ...item, status: 'error' };
      }
    }

    setQueue(updatedQueue);
    setLoading(false);
    setSuccess(true);
  };

  const handleDownloadAll = () => {
    queue.forEach(item => {
      if (item.blob) {
        const cleanName = item.name.replace(/\.[^/.]+$/, "");
        triggerBlobDownload(item.blob, `${cleanName}_converted.${targetType === 'jpeg' ? 'jpg' : 'webp'}`);
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Queue Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 min-h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ImageIcon className="text-[#4E8E5E]" size={22} />
              <span>WebP ↔ JPG Converter</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Batch image processing</span>
          </div>

          {/* Upload Area */}
          <div className="border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-950/20 text-center flex flex-col items-center gap-3">
            <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
              <Upload size={32} />
            </div>
            <label className="btn-primary cursor-pointer mt-1">
              <span>Choose Images</span>
              <input
                type="file"
                multiple
                accept="image/webp, image/jpeg, image/jpg, image/png"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
            <p className="text-slate-500 text-xs">Supports WebP, JPG, JPEG, and PNG files</p>
          </div>

          {/* Queue List */}
          {queue.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">Upload Queue</span>
              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                {queue.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-850 text-xs">
                    <div className="flex flex-col">
                      <span className="text-slate-200 font-semibold truncate max-w-[200px] sm:max-w-md">{item.name}</span>
                      <span className="text-[10px] text-slate-500">{item.size}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === 'success' && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">Ready</span>}
                      {item.status === 'error' && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">Failed</span>}
                      {item.status === 'pending' && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-850">Queued</span>}
                      <button
                        onClick={() => setQueue(prev => prev.filter(i => i.id !== item.id))}
                        className="text-[10px] text-rose-455 hover:underline font-bold ml-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Format Target</h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 font-semibold">Convert to Format</label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="webp">WebP (High Compression)</option>
              <option value="jpeg">JPG / JPEG (Solid Background)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleConvertBatch}
              disabled={queue.length === 0 || loading}
              className="btn-primary w-full py-3"
            >
              <span>{loading ? 'Processing...' : 'Run Conversion'}</span>
            </button>

            {success && (
              <button onClick={handleDownloadAll} className="btn-secondary w-full py-2.5 text-xs flex items-center justify-center gap-1.5">
                <Check size={14} className="text-green-400" />
                <span>Save All Files</span>
              </button>
            )}
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Client-Side Conversion</span>
            <span className="text-[10px] leading-relaxed">No data leaves your computer. Canvas drawing frames are processed fully in-browser.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
