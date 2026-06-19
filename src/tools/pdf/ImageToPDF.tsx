import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileText, Check, ShieldAlert, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  name: string;
  url: string;
}

export const ImageToPDFTool = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [margin, setMargin] = useState<number>(0);
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [outputName, setOutputName] = useState('images_converted');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newItems = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(),
        file,
        name: file.name,
        url: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newItems]);
      setSuccess(false);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const arr = [...prev];
      const temp = arr[index];
      arr[index] = arr[index - 1];
      arr[index - 1] = temp;
      return arr;
    });
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    setImages(prev => {
      const arr = [...prev];
      const temp = arr[index];
      arr[index] = arr[index + 1];
      arr[index + 1] = temp;
      return arr;
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setLoading(true);
    setSuccess(false);
    try {
      const pdf = await PDFDocument.create();
      for (const item of images) {
        const imgBytes = await item.file.arrayBuffer();
        let pageImage;
        if (item.file.type === 'image/png' || item.name.endsWith('.png')) {
          pageImage = await pdf.embedPng(imgBytes);
        } else {
          pageImage = await pdf.embedJpg(imgBytes);
        }

        // Calculate page layout
        let w = pageImage.width;
        let h = pageImage.height;

        if (orientation === 'portrait') {
          if (w > h) {
            const temp = w;
            w = h;
            h = temp;
          }
        } else if (orientation === 'landscape') {
          if (h > w) {
            const temp = w;
            w = h;
            h = temp;
          }
        }

        const page = pdf.addPage([w + margin * 2, h + margin * 2]);
        page.drawImage(pageImage, {
          x: margin,
          y: margin,
          width: w,
          height: h
        });
      }

      const bytes = await pdf.save();
      const cleanName = outputName.trim().replace(/[^a-zA-Z0-9_\-]/g, '_') || 'images';
      triggerBlobDownload(
        new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }),
        `${cleanName}.pdf`
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Error embedding images to PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Editor Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-[#4E8E5E]" size={22} />
              <span>Image → PDF Converter</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Build page layouts from graphics</span>
          </div>

          {/* Upload Area */}
          <div className="border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-950/20 text-center flex flex-col items-center gap-3">
            <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
              <Upload size={32} />
            </div>
            <label className="btn-primary cursor-pointer mt-1">
              <span>Choose Image Files</span>
              <input
                type="file"
                multiple
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
            <p className="text-slate-500 text-xs">Supports JPG, JPEG, and PNG images</p>
          </div>

          {/* Queue List */}
          {images.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">Pages Order</span>
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {images.map((item, index) => (
                  <div key={item.id} className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-850 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.url} alt="thumbnail" className="w-10 h-10 object-cover rounded bg-slate-950 border border-slate-800 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-slate-200 font-semibold truncate max-w-[200px] sm:max-w-md">{item.name}</span>
                        <span className="text-[10px] text-slate-500">Page {index + 1}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-1.5 bg-slate-950/60 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-20"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === images.length - 1}
                        className="p-1.5 bg-slate-950/60 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-20"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        onClick={() => setImages(prev => prev.filter(i => i.id !== item.id))}
                        className="p-1.5 bg-slate-950/60 rounded hover:bg-rose-950/30 text-rose-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 text-left">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Layout Options</h3>

          {/* Orientation */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium">Page Orientation</label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="auto">Auto (Match Image)</option>
              <option value="portrait">Portrait Lock</option>
              <option value="landscape">Landscape Lock</option>
            </select>
          </div>

          {/* Margins */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium">Page Padding Margins</label>
            <select
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value={0}>None (0px)</option>
              <option value={20}>Small (20px)</option>
              <option value={40}>Medium (40px)</option>
            </select>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-medium">Output Filename</label>
            <div className="relative">
              <input
                type="text"
                value={outputName}
                onChange={(e) => setOutputName(e.target.value)}
                className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">.pdf</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleConvert}
              disabled={images.length === 0 || loading}
              className="btn-primary w-full py-3"
            >
              {success ? <Check size={18} /> : <FileText size={18} />}
              <span>{loading ? 'Converting...' : success ? 'PDF Downloaded!' : 'Compile PDF'}</span>
            </button>
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400 text-left">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Client-Side Conversion</span>
            <span className="text-[10px] leading-relaxed">No data leaves your computer. Images are loaded onto internal canvases and saved to PDF.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
