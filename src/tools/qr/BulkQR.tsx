import { triggerDownload, generateDesignedQR, triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { Layers, Download, Sparkles, Upload, Grid, List, Table, AlertCircle } from 'lucide-react';
import { QRStylingPanel } from '../../components/QRStylingPanel';
import type { QRStyleSettings } from '../../components/QRStylingPanel';

interface BulkQRItem {
  id: string;
  text: string;
  qrUrl: string;
  isValid: boolean;
}

// Pure JS ZIP Archiver helper
const makeZipBlob = (files: { name: string; data: Uint8Array }[]): Blob => {
  const crcTable = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c;
  }
  
  const crc32 = (data: Uint8Array) => {
    let crc = -1;
    for (let i = 0; i < data.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xFF];
    }
    return (crc ^ -1) >>> 0;
  };

  const bufs: BlobPart[] = [];
  const localHeaders: { offset: number; size: number; name: string; crc: number }[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name);
    const crc = crc32(file.data);
    const size = file.data.length;

    const header = new Uint8Array(30 + nameBytes.length);
    header.set([0x50, 0x4B, 0x03, 0x04], 0); // signature PK\x03\x04
    header.set([0x0A, 0x00], 4);             // version 1.0
    header.set([0x00, 0x00], 6);             // flags
    header.set([0x00, 0x00], 8);             // store
    header.set([0x00, 0x00, 0x00, 0x00], 10); // time
    header.set([crc & 0xFF, (crc >>> 8) & 0xFF, (crc >>> 16) & 0xFF, (crc >>> 24) & 0xFF], 14);
    header.set([size & 0xFF, (size >>> 8) & 0xFF, (size >>> 16) & 0xFF, (size >>> 24) & 0xFF], 18);
    header.set([size & 0xFF, (size >>> 8) & 0xFF, (size >>> 16) & 0xFF, (size >>> 24) & 0xFF], 22);
    header.set([nameBytes.length & 0xFF, (nameBytes.length >>> 8) & 0xFF], 26);
    header.set([0x00, 0x00], 28);
    header.set(nameBytes, 30);

    bufs.push(header as any);
    bufs.push(file.data as any);

    localHeaders.push({ offset, size, name: file.name, crc });
    offset += header.length + file.data.length;
  }

  const centralDirOffset = offset;
  let centralDirSize = 0;

  for (const h of localHeaders) {
    const nameBytes = new TextEncoder().encode(h.name);
    const cd = new Uint8Array(46 + nameBytes.length);
    cd.set([0x50, 0x4B, 0x01, 0x02], 0); // signature PK\x01\x02
    cd.set([0x0A, 0x00], 4);
    cd.set([0x0A, 0x00], 6);
    cd.set([0x00, 0x00], 8);
    cd.set([0x00, 0x00], 10);
    cd.set([0x00, 0x00, 0x00, 0x00], 12);
    cd.set([h.crc & 0xFF, (h.crc >>> 8) & 0xFF, (h.crc >>> 16) & 0xFF, (h.crc >>> 24) & 0xFF], 16);
    cd.set([h.size & 0xFF, (h.size >>> 8) & 0xFF, (h.size >>> 16) & 0xFF, (h.size >>> 24) & 0xFF], 20);
    cd.set([h.size & 0xFF, (h.size >>> 8) & 0xFF, (h.size >>> 16) & 0xFF, (h.size >>> 24) & 0xFF], 24);
    cd.set([nameBytes.length & 0xFF, (nameBytes.length >>> 8) & 0xFF], 28);
    cd.set([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], 30);
    cd.set([h.offset & 0xFF, (h.offset >>> 8) & 0xFF, (h.offset >>> 16) & 0xFF, (h.offset >>> 24) & 0xFF], 42);
    cd.set(nameBytes, 46);

    bufs.push(cd as any);
    centralDirSize += cd.length;
  }

  const eocd = new Uint8Array(22);
  eocd.set([0x50, 0x4B, 0x05, 0x06], 0); // signature PK\x05\x06
  const count = localHeaders.length;
  eocd.set([0x00, 0x00, 0x00, 0x00, count & 0xFF, (count >>> 8) & 0xFF, count & 0xFF, (count >>> 8) & 0xFF], 4);
  eocd.set([centralDirSize & 0xFF, (centralDirSize >>> 8) & 0xFF, (centralDirSize >>> 16) & 0xFF, (centralDirSize >>> 24) & 0xFF], 12);
  eocd.set([centralDirOffset & 0xFF, (centralDirOffset >>> 8) & 0xFF, (centralDirOffset >>> 16) & 0xFF, (centralDirOffset >>> 24) & 0xFF], 16);
  eocd.set([0x00, 0x00], 20);

  bufs.push(eocd as any);
  return new Blob(bufs, { type: 'application/zip' });
};

const dataURLToBytes = (dataUrl: string): Uint8Array => {
  const base64 = dataUrl.split(',')[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export const BulkQRTool = () => {
  const [inputText, setInputText] = useState('https://github.com/arronkianparejas\nhttps://google.com\nHello DomoDomo!');
  const [result, setResult] = useState<BulkQRItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [zipDownloading, setZipDownloading] = useState(false);

  // 10 Features States
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  const [namingTemplate, setNamingTemplate] = useState('qr_[index]_[content]');
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(0);
  const [moduleStyle, setModuleStyle] = useState<'square' | 'circle' | 'rounded'>('rounded');
  const [eyeStyle, setEyeStyle] = useState<'square' | 'circle' | 'rounded'>('rounded');

  const [settings, setSettings] = useState<QRStyleSettings>({
    fgColor: '#4E8E5E',
    bgColor: '#0B0F19',
    margin: 2,
    errorCorrection: 'Q',
    size: 400,
    format: 'png',
    logoPreset: 'none',
    theme: 'emerald'
  });

  const checkUrlValidity = (val: string) => {
    if (val.startsWith('http://') || val.startsWith('https://')) return true;
    // Simple text is valid payload, but we label it as raw text
    return false;
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setProgress(0);
    setResult([]);

    const items = inputText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const generated: BulkQRItem[] = [];

    try {
      for (let i = 0; i < items.length; i++) {
        const text = items[i];
        const qrUrl = await generateDesignedQR(text, {
          ...settings,
          moduleStyle,
          eyeFrameStyle: eyeStyle,
          eyeBallStyle: eyeStyle === 'circle' ? 'circle' : 'square'
        });
        generated.push({
          id: Math.random().toString(36).substr(2, 9),
          text,
          qrUrl,
          isValid: checkUrlValidity(text)
        });
        setProgress(Math.round(((i + 1) / items.length) * 100));
      }
      setResult(generated);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // CSV Drag/Drop Parser
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        if (!content) return;

        const lines = content.split(/\r?\n/).filter(Boolean);
        if (lines.length > 0) {
          // Detect headers/columns
          const firstLine = lines[0].split(',');
          setCsvColumns(firstLine);

          // Extract values from selected column index (default first column)
          const extracted = lines.map(line => {
            const cols = line.split(',');
            return cols[selectedColumnIndex] || '';
          }).filter(Boolean);

          setInputText(extracted.join('\n'));
        }
      };
      reader.readAsText(file);
    }
  };

  // Zip Archive Exporter
  const handleZipDownload = async () => {
    if (result.length === 0) return;
    setZipDownloading(true);

    try {
      const filesToPack = result.map((item, idx) => {
        const fileBytes = dataURLToBytes(item.qrUrl);
        // Compute filename based on template
        let safeContent = item.text.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 15) || 'payload';
        let filename = namingTemplate
          .replace('[index]', (idx + 1).toString())
          .replace('[content]', safeContent);
        
        filename += `.${settings.format}`;
        return { name: filename, data: fileBytes };
      });

      const zipBlob = makeZipBlob(filesToPack);
      triggerBlobDownload(zipBlob, 'bulk_qr_batch.zip');
    } catch (err) {
      console.error('Zip packer failed', err);
    } finally {
      setZipDownloading(false);
    }
  };

  // Avery labels sticker layout printer
  const handlePrintLabels = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Printable Avery QR Label Sheet</title>
          <style>
            body { font-family: sans-serif; padding: 20px; background: #fff; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
            .label-item { border: 1px dashed #ccc; padding: 10px; text-align: center; border-radius: 8px; font-size: 10px; page-break-inside: avoid; }
            .qr-img { width: 100px; height: 100px; }
            .text { truncate; margin-top: 5px; font-family: monospace; opacity: 0.7; }
          </style>
        </head>
        <body>
          <h3>Bulk Sticker Sheet</h3>
          <div class="grid">
            ${result.map((item, idx) => `
              <div class="label-item">
                <img src="${item.qrUrl}" class="qr-img" />
                <div class="text">#${idx + 1}: ${item.text.slice(0, 12)}...</div>
              </div>
            `).join('')}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleUpdateRow = (id: string, newText: string) => {
    setResult(prev => prev.map(item => item.id === id ? { ...item, text: newText } : item));
  };

  const handleDeleteRow = (id: string) => {
    setResult(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Settings Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-lg">
              <Layers className="text-[#4E8E5E]" size={20} />
              <span>Bulk QR Code Generator</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Batch Processing</span>
          </div>

          {/* CSV File Upload drag and drop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/20 p-3 rounded-2xl border border-slate-850">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-450 font-bold uppercase flex items-center gap-1">
                <Upload size={12} className="text-[#4E8E5E]" />
                <span>Import CSV Values Sheet</span>
              </label>
              <label className="btn-secondary cursor-pointer py-1.5 px-3 text-[11px] rounded-lg text-center">
                <span>Upload CSV Sheet</span>
                <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
              </label>
            </div>

            {csvColumns.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-450 font-bold uppercase">Select CSV Column index</label>
                <select
                  value={selectedColumnIndex}
                  onChange={(e) => setSelectedColumnIndex(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs text-slate-200"
                >
                  {csvColumns.map((col, idx) => (
                    <option key={idx} value={idx}>{col || `Column ${idx + 1}`}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-slate-400 font-semibold">Inputs list (One payload per line)</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="https://example1.com&#10;https://example2.com&#10;Some custom text payload"
              className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E] h-28 resize-none outline-none leading-relaxed"
            />
          </div>

          {/* Filename custom settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-semibold">Filename Export Template</label>
              <input
                type="text"
                value={namingTemplate}
                onChange={(e) => setNamingTemplate(e.target.value)}
                placeholder="e.g. qr_[index]_[content]"
                className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
              />
              <span className="text-[9px] text-slate-500">Tokens: [index] (number), [content] (payload)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 font-bold uppercase">QR Pixel dot style</label>
                <select
                  value={moduleStyle}
                  onChange={(e) => setModuleStyle(e.target.value as any)}
                  className="bg-slate-900 border border-slate-850 rounded-xl px-2 py-1.5 text-xs text-slate-200"
                >
                  <option value="square">Square Blocks</option>
                  <option value="circle">Circles</option>
                  <option value="rounded">Rounded</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-500 font-bold uppercase">Corner Eye Style</label>
                <select
                  value={eyeStyle}
                  onChange={(e) => setEyeStyle(e.target.value as any)}
                  className="bg-slate-900 border border-slate-850 rounded-xl px-2 py-1.5 text-xs text-slate-200"
                >
                  <option value="rounded">Rounded</option>
                  <option value="square">Square</option>
                  <option value="circle">Circle</option>
                </select>
              </div>
            </div>
          </div>

          <QRStylingPanel settings={settings} onChange={setSettings} />

          {/* Progress bar container */}
          {loading && (
            <div className="w-full bg-slate-900 p-2.5 rounded-xl border border-slate-850 flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Generating batch...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-[#4E8E5E]" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !inputText.trim()}
            className="btn-primary w-full py-3 flex items-center justify-center gap-1.5 mt-2"
          >
            <Sparkles size={16} />
            <span>{loading ? 'Generating Pack...' : 'Generate Batch Pack'}</span>
          </button>
        </div>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 min-h-[350px]">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3 w-full">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Preview</span>
            </h3>
            {result.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintLabels}
                  className="text-slate-500 hover:text-emerald-400 transition-all"
                  title="Print Sticker Sheets"
                >
                  <Table size={13} />
                </button>
                
                <button
                  onClick={handleZipDownload}
                  disabled={zipDownloading}
                  className="text-slate-500 hover:text-emerald-400 transition-all flex items-center gap-1"
                  title="Download ZIP"
                >
                  {zipDownloading ? (
                    <div className="w-3.5 h-3.5 border border-t-transparent border-emerald-400 rounded-full animate-spin" />
                  ) : (
                    <Download size={13} />
                  )}
                </button>
              </div>
            )}
          </div>

          {result.length > 0 ? (
            <div className="flex flex-col gap-4 w-full text-left">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Generated Pack ({result.length})</span>
                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-850">
                  <button onClick={() => setViewLayout('grid')} className={`p-1 rounded ${viewLayout === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-550'}`}><Grid size={11} /></button>
                  <button onClick={() => setViewLayout('list')} className={`p-1 rounded ${viewLayout === 'list' ? 'bg-slate-900 text-white' : 'text-slate-550'}`}><List size={11} /></button>
                </div>
              </div>

              {viewLayout === 'grid' ? (
                <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1 w-full">
                  {result.map((item, idx) => (
                    <div 
                      key={item.id} 
                      className="border border-slate-850 p-2 rounded-2xl flex flex-col items-center justify-between gap-2 text-center"
                      style={{ backgroundColor: settings.bgColor }}
                    >
                      <img src={item.qrUrl} className="w-20 h-20 border border-slate-800/10 rounded-xl" alt={`bulk qr ${idx}`} />
                      
                      <div className="flex flex-col w-full px-1">
                        <span className="text-[8px] text-slate-500 font-mono truncate" title={item.text}>{item.text}</span>
                        {!item.isValid && (
                          <span className="text-[7px] text-amber-500 font-medium leading-none">Plain text</span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            let safeContent = item.text.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 10) || 'qr';
                            triggerDownload(item.qrUrl, `qr_${idx + 1}_${safeContent}.${settings.format}`);
                          }}
                          className="text-[9px] text-[#4E8E5E] hover:underline font-bold"
                        >
                          Get
                        </button>
                        <button
                          onClick={() => handleDeleteRow(item.id)}
                          className="text-[9px] text-rose-500 hover:underline"
                        >
                          Del
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Compact spreadsheet tabular row editor view
                <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1 w-full">
                  {result.map((item, idx) => (
                    <div key={item.id} className="bg-slate-950/60 p-2 border border-slate-900 rounded-xl flex items-center justify-between gap-3">
                      <span className="text-[9px] font-mono text-slate-500">#{idx + 1}</span>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => handleUpdateRow(item.id, e.target.value)}
                        className="bg-transparent border-0 text-[10px] text-slate-350 focus:outline-none focus:ring-0 p-0 flex-1 min-w-0"
                      />
                      <div className="flex gap-2 shrink-0">
                        {!item.isValid && (
                          <span title="Text Payload (Non-URL)">
                            <AlertCircle size={10} className="text-amber-500" />
                          </span>
                        )}
                        <button onClick={() => handleDeleteRow(item.id)} className="text-rose-500 hover:text-rose-400 text-[9px] font-bold">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-555 my-auto">Batch outputs will render here.</span>
          )}
        </div>
      </div>
    </div>
  );
};
