import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { FileText, Upload, Download, Check, ShieldAlert, FileSearch } from 'lucide-react';

export const DocxTxtTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extracted, setExtracted] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setExtracted('');
    try {
      const buffer = await file.arrayBuffer();
      const arr = new Uint8Array(buffer);
      
      // Let's locate "word/document.xml" header in the ZIP structure
      const target = new TextEncoder().encode("word/document.xml");
      let headerOffset = -1;

      for (let i = 0; i < arr.length - target.length; i++) {
        let match = true;
        for (let j = 0; j < target.length; j++) {
          if (arr[i+j] !== target[j]) {
            match = false;
            break;
          }
        }
        if (match) {
          // Verify it's preceded by local file signature PK\x03\x04
          // The filename is offset by 30 bytes from PK\x03\x04
          const possibleStart = i - 30;
          if (possibleStart >= 0 && arr[possibleStart] === 0x50 && arr[possibleStart+1] === 0x4B) {
            headerOffset = possibleStart;
            break;
          }
        }
      }

      if (headerOffset === -1) {
        // Fallback: search for XML w:t tags directly in raw stream
        const textDecoder = new TextDecoder('utf-8', { fatal: false });
        const textStr = textDecoder.decode(arr);
        const matches = [...textStr.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g)];
        const textOutput = matches.map(m => m[1]).join('\n');
        
        if (textOutput.trim()) {
          setExtracted(textOutput);
          setSuccess(true);
          triggerBlobDownload(new Blob([textOutput], { type: 'text/plain' }), `${file.name.replace(/\.[^/.]+$/, "")}_extracted.txt`);
        } else {
          setExtracted('Could not locate standard DOCX text streams. Ensure it is a valid XML docx package.');
        }
        setLoading(false);
        return;
      }

      // Read ZIP local file header info
      const compressionMethod = arr[headerOffset + 8] + (arr[headerOffset + 9] << 8);
      const compressedSize = arr[headerOffset + 18] + (arr[headerOffset + 19] << 8) + (arr[headerOffset + 20] << 16) + (arr[headerOffset + 21] << 24);
      const filenameLen = arr[headerOffset + 26] + (arr[headerOffset + 27] << 8);
      const extraLen = arr[headerOffset + 28] + (arr[headerOffset + 29] << 8);

      const dataStart = headerOffset + 30 + filenameLen + extraLen;
      const compressedData = arr.slice(dataStart, dataStart + compressedSize);

      let xmlString = '';
      if (compressionMethod === 8) {
        // Decompress Deflated stream using native DecompressionStream if available,
        // otherwise fallback to raw regex
        try {
          const ds = new DecompressionStream('deflate-raw');
          const writer = ds.writable.getWriter();
          writer.write(compressedData);
          writer.close();
          const response = new Response(ds.readable);
          const decompressedBuffer = await response.arrayBuffer();
          xmlString = new TextDecoder().decode(decompressedBuffer);
        } catch (e) {
          // Decompression stream fallback
          const textDecoder = new TextDecoder('utf-8', { fatal: false });
          xmlString = textDecoder.decode(arr);
        }
      } else {
        // Stored (no compression)
        xmlString = new TextDecoder().decode(compressedData);
      }

      // Extract text content from XML tags <w:t>Text</w:t>
      const matches = [...xmlString.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g)];
      const resultText = matches.map(m => m[1]).join('\n');

      if (resultText.trim()) {
        setExtracted(resultText);
        setSuccess(true);
        triggerBlobDownload(
          new Blob([resultText], { type: 'text/plain' }),
          `${file.name.replace(/\.[^/.]+$/, "")}_extracted.txt`
        );
      } else {
        setExtracted('DOCX file parsed but no readable text paragraph blocks (<w:t>) were found.');
      }
    } catch (err) {
      console.error(err);
      setExtracted('Failed to parse docx zip payload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Input panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 min-h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileSearch className="text-[#4E8E5E]" size={22} />
              <span>DOCX ↔ TXT Extractor</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Extracts XML tags locally</span>
          </div>

          {!file ? (
            <div className="border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-950/20 text-center flex flex-col items-center gap-3">
              <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
                <Upload size={32} />
              </div>
              <label className="btn-primary cursor-pointer mt-1">
                <span>Choose DOCX File</span>
                <input
                  type="file"
                  accept=".docx"
                  onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <p className="text-slate-500 text-xs">Supports Microsoft Word files (.docx)</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center bg-slate-900/30 p-3 rounded-xl border border-slate-850 text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="text-[#4E8E5E]" size={20} />
                  <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button onClick={() => { setFile(null); setExtracted(''); }} className="text-rose-455 hover:underline font-bold">Remove</button>
              </div>

              {extracted && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-slate-455 font-bold uppercase tracking-wider font-mono">Parsed text content</span>
                  <textarea
                    readOnly
                    value={extracted}
                    className="w-full bg-slate-950 p-4 text-xs font-mono h-48 rounded-2xl border border-slate-900 text-slate-300 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Control panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Unpack utility</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Parses word structure directories offline. Locates the primary document layout tags and copies clean content.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleConvert}
              disabled={!file || loading}
              className="btn-primary w-full py-3"
            >
              {success ? <Check size={18} /> : <Download size={18} />}
              <span>{loading ? 'Decompressing...' : success ? 'TXT Downloaded!' : 'Unpack to TXT'}</span>
            </button>
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Secure local extract</span>
            <span className="text-[10px] leading-relaxed">Native browser decompression streams are used. No content touches a network.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
