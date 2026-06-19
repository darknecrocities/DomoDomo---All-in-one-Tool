import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { PDFDocument, PDFRawStream, PDFName } from 'pdf-lib';
import { Upload, Image as ImageIcon, FileText, Check, ShieldAlert, AlertCircle } from 'lucide-react';

interface ExtractedImage {
  id: string;
  name: string;
  width: number;
  height: number;
  type: string;
  blob: Blob;
  size: string;
}

export const PDFToImageTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState<ExtractedImage[]>([]);
  const [scanned, setScanned] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImages([]);
      setScanned(false);
      setSuccess(false);
    }
  };

  const handleExtractImages = async () => {
    if (!file) return;
    setLoading(true);
    setImages([]);
    setScanned(true);
    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      
      const foundImages: ExtractedImage[] = [];
      let count = 1;

      // Extract low-level PDF raw streams containing image objects
      const indirectObjects = (pdfDoc.context as any).indirectObjects;
      for (const [ref, obj] of indirectObjects.entries()) {
        if (obj instanceof PDFRawStream) {
          const dict = obj.dict;
          const subtype = dict.get(PDFName.of('Subtype'));
          if (subtype && subtype.toString() === '/Image') {
            const widthObj = dict.get(PDFName.of('Width'));
            const heightObj = dict.get(PDFName.of('Height'));
            const filterObj = dict.get(PDFName.of('Filter'));
            
            const width = widthObj ? Number(widthObj.toString()) : 300;
            const height = heightObj ? Number(heightObj.toString()) : 300;
            const filter = filterObj ? filterObj.toString() : '';

            // Extract contents byte array
            const imgBytes = obj.contents;
            if (imgBytes && imgBytes.length > 100) {
              let ext = 'png';
              let mime = 'image/png';
              
              if (filter.includes('DCT') || filter.includes('Jpeg')) {
                ext = 'jpg';
                mime = 'image/jpeg';
              }

              const blob = new Blob([imgBytes as any], { type: mime });
              foundImages.push({
                id: ref.toString(),
                name: `extracted_img_${count}.${ext}`,
                width,
                height,
                type: ext.toUpperCase(),
                blob,
                size: (imgBytes.length / 1024).toFixed(1) + ' KB'
              });
              count++;
            }
          }
        }
      }

      setImages(foundImages);
      setSuccess(true);
    } catch (e) {
      console.error(e);
      alert('Error parsing PDF stream structures.');
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
              <ImageIcon className="text-[#4E8E5E]" size={22} />
              <span>PDF → Image Extractor</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Extract embedded graphics</span>
          </div>

          {!file ? (
            <div className="border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-950/20 text-center flex flex-col items-center gap-3">
              <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
                <Upload size={32} />
              </div>
              <label className="btn-primary cursor-pointer mt-1">
                <span>Choose PDF File</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-slate-500 text-xs">Select PDF to parse and unpack raster images</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-850">
                <div className="flex items-center gap-3">
                  <FileText className="text-[#4E8E5E]" size={24} />
                  <div className="flex flex-col">
                    <span className="text-slate-200 text-xs font-bold">{file.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { setFile(null); setImages([]); setScanned(false); }}
                  className="text-[10px] text-rose-400 hover:text-rose-350 font-bold self-start"
                >
                  Change PDF File
                </button>
              </div>

              {/* Extracted Images List */}
              {scanned && (
                <div className="flex flex-col gap-3 mt-2">
                  <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">
                    Unpacked Graphics ({images.length})
                  </span>
                  
                  {images.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-xs">
                      <AlertCircle size={16} />
                      <span>No direct embedded raster images found in this PDF's streams.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {images.map((img) => (
                        <div key={img.id} className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex flex-col gap-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-350 truncate max-w-[150px]">{img.name}</span>
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {img.type}
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>Dimensions:</span>
                            <span className="text-slate-300 font-mono">{img.width} × {img.height}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>Size:</span>
                            <span className="text-slate-300 font-mono">{img.size}</span>
                          </div>

                          <button
                            onClick={() => triggerBlobDownload(img.blob, img.name)}
                            className="btn-secondary w-full py-1.5 text-[11px] mt-1"
                          >
                            Download Graphic
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Settings / Controls */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 text-left">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Extraction Tool</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Extracts all embedded JPEG/PNG graphic resources from the PDF structure. Helpful for pulling assets out of presentation slides or document scans.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleExtractImages}
              disabled={!file || loading}
              className="btn-primary w-full py-3"
            >
              {success ? <Check size={18} /> : <ImageIcon size={18} />}
              <span>{loading ? 'Scanning...' : success ? 'Extraction Done!' : 'Extract Images'}</span>
            </button>
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400 text-left">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Client-Side Scan</span>
            <span className="text-[10px] leading-relaxed">Binary streams are parsed directly in memory. No assets are transmitted outside your device.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
