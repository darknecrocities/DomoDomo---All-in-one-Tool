import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { FileText, Upload, Download, Check, ShieldAlert, BookOpen, Settings } from 'lucide-react';

export const EpubPdfTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [chaptersFound, setChaptersFound] = useState<number>(0);
  const [fontSize, setFontSize] = useState<number>(11);
  const [pageSize, setPageSize] = useState<'A4' | 'LETTER'>('A4');
  const [maxChapters, setMaxChapters] = useState<number>(15);

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setSuccess(false);
    setChaptersFound(0);
    try {
      const buffer = await file.arrayBuffer();
      const arr = new Uint8Array(buffer);

      // EPUB files are ZIP containers. Scan for HTML/XHTML chapter files.
      let chaptersText: string[] = [];
      let i = 0;
      while (i < arr.length - 30) {
        if (arr[i] === 0x50 && arr[i+1] === 0x4B && arr[i+2] === 0x03 && arr[i+3] === 0x04) {
          const filenameLen = arr[i + 26] + (arr[i + 27] << 8);
          const extraLen = arr[i + 28] + (arr[i + 29] << 8);
          const compressedSize = arr[i + 22] + (arr[i + 23] << 8) + (arr[i + 24] << 16) + (arr[i + 25] << 24);
          const compressionMethod = arr[i + 8] + (arr[i + 9] << 8);

          const filenameStart = i + 30;
          if (filenameStart + filenameLen <= arr.length) {
            const filenameBytes = arr.slice(filenameStart, filenameStart + filenameLen);
            const filename = new TextDecoder().decode(filenameBytes);
            
            if (filename.endsWith('.html') || filename.endsWith('.xhtml') || filename.endsWith('.htm')) {
              const dataStart = filenameStart + filenameLen + extraLen;
              if (dataStart + compressedSize <= arr.length) {
                const compressedData = arr.slice(dataStart, dataStart + compressedSize);
                let htmlContent = '';
                
                if (compressionMethod === 8) {
                  try {
                    const ds = new DecompressionStream('deflate-raw');
                    const writer = ds.writable.getWriter();
                    writer.write(compressedData);
                    writer.close();
                    const response = new Response(ds.readable);
                    const decompressedBuffer = await response.arrayBuffer();
                    htmlContent = new TextDecoder().decode(decompressedBuffer);
                  } catch (e) {
                    htmlContent = new TextDecoder().decode(compressedData);
                  }
                } else {
                  htmlContent = new TextDecoder().decode(compressedData);
                }

                // Strip HTML tags to get pure printable chapter text
                const cleanText = htmlContent
                  .replace(/<[^>]*>/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();
                if (cleanText.length > 50) {
                  chaptersText.push(cleanText);
                }
              }
            }
          }
          i += 30 + filenameLen + extraLen + compressedSize;
        } else {
          i++;
        }
      }

      setChaptersFound(chaptersText.length);

      if (chaptersText.length === 0) {
        // Fallback: extract printable strings
        const rawText = new TextDecoder('utf-8', { fatal: false }).decode(arr);
        const clean = rawText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        chaptersText.push(clean.slice(0, 5000));
      }

      // Compile to PDF using pdf-lib
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const dimensions: [number, number] = pageSize === 'A4' ? [595, 842] : [612, 792];
      const pageLimit = Math.min(chaptersText.length, maxChapters);

      for (let chIdx = 0; chIdx < pageLimit; chIdx++) {
        const textSegment = chaptersText[chIdx];
        const page = pdfDoc.addPage(dimensions);
        const words = textSegment.split(' ');
        
        let currentLine = '';
        let y = dimensions[1] - 50; // Margin top

        for (let wIdx = 0; wIdx < words.length; wIdx++) {
          const testLine = currentLine + words[wIdx] + ' ';
          const width = font.widthOfTextAtSize(testLine, fontSize);
          if (width > dimensions[0] - 100) { // Margins left/right
            page.drawText(currentLine.trim(), {
              x: 50,
              y,
              size: fontSize,
              font,
              color: rgb(0.1, 0.1, 0.1)
            });
            currentLine = words[wIdx] + ' ';
            y -= fontSize * 1.6;
            if (y < 50) {
              // Add a page if text overflows this chapter page
              break;
            }
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine && y >= 50) {
          page.drawText(currentLine.trim(), {
            x: 50,
            y,
            size: fontSize,
            font,
            color: rgb(0.1, 0.1, 0.1)
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      triggerBlobDownload(
        new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }),
        `${file.name.replace(/\.[^/.]+$/, "")}_converted.pdf`
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Error parsing EPUB document container.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Editor Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 min-h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="text-[#4E8E5E]" size={22} />
              <span>EPUB → PDF Converter</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Rebuilds e-books offline</span>
          </div>

          {!file ? (
            <div className="border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-950/20 text-center flex flex-col items-center gap-3">
              <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
                <Upload size={32} />
              </div>
              <label className="btn-primary cursor-pointer mt-1">
                <span>Choose EPUB File</span>
                <input
                  type="file"
                  accept=".epub"
                  onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <p className="text-slate-500 text-xs">Supports EPUB e-book archives (.epub)</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center bg-slate-900/30 p-3 rounded-xl border border-slate-850 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="text-[#4E8E5E]" size={20} />
                  <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button onClick={() => { setFile(null); setChaptersFound(0); }} className="text-rose-455 hover:underline font-bold">Remove</button>
              </div>

              {chaptersFound > 0 && (
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 text-xs text-slate-300 leading-relaxed">
                  📖 Scanned EPUB package structure: Found <b>{chaptersFound}</b> readable HTML chapter segments.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Control panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Settings Panel */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-1.5">
            <Settings size={16} className="text-[#4E8E5E]" />
            <span>Layout Options</span>
          </h3>

          {/* Page size Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 font-semibold">Page Dimension Size</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="A4">A4 Standard (595 x 842 pt)</option>
              <option value="LETTER">US Letter Size (612 x 792 pt)</option>
            </select>
          </div>

          {/* Font Size Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 font-semibold">Content Font Size</label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="9">Small (9 pt)</option>
              <option value="11">Standard (11 pt)</option>
              <option value="13">Medium (13 pt)</option>
              <option value="15">Large (15 pt)</option>
            </select>
          </div>

          {/* Max Chapters Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs text-slate-500 font-semibold">
              <span>Max Chapters Limit</span>
              <span className="text-slate-300">{maxChapters}</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={maxChapters}
              onChange={(e) => setMaxChapters(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#4E8E5E]"
            />
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Compile PDF</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Decompresses XHTML files, strips layout elements, and draws e-book segments into standard PDF pages locally.
          </p>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleConvert}
              disabled={!file || loading}
              className="btn-primary w-full py-3"
            >
              {success ? <Check size={18} /> : <Download size={18} />}
              <span>{loading ? 'Compiling PDF...' : success ? 'PDF Saved!' : 'Compile to PDF'}</span>
            </button>
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% In-Browser Conversion</span>
            <span className="text-[10px] leading-relaxed">EPUB parsing and layout page stitching compile in client memory.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
