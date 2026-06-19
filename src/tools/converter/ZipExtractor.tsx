import { useState } from 'react';
import { parseZipEntries, decompressZipEntry, triggerBlobDownload } from '../../utils/sharedHelpers';
import type { ZipEntry } from '../../utils/sharedHelpers';
import { Archive, Upload, Check, ShieldAlert, Sparkles, Folder, File, AlertCircle, Search } from 'lucide-react';

export const ZipExtractorTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<ZipEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [extractingId, setExtractingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilenames, setSelectedFilenames] = useState<Set<string>>(new Set());

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setEntries([]);
      setError('');
      setSuccessMsg('');
      setSelectedFilenames(new Set());
      setLoading(true);

      try {
        const buffer = await selectedFile.arrayBuffer();
        const zipEntries = parseZipEntries(buffer);
        setEntries(zipEntries);
      } catch (err) {
        setError('Failed to inspect ZIP archive. The file may be corrupt or formatted incorrectly.');
      } finally {
        setLoading(false);
      }
    }
  };

  const extractSingle = async (entry: ZipEntry, index: number) => {
    if (!file) return;
    setExtractingId(index);
    setError('');
    setSuccessMsg('');

    try {
      const buffer = await file.arrayBuffer();
      const decompressed = await decompressZipEntry(buffer, entry);
      const mime = 'application/octet-stream';
      const blob = new Blob([decompressed.buffer as ArrayBuffer], { type: mime });
      
      const baseName = entry.filename.split('/').pop() || entry.filename;
      triggerBlobDownload(blob, baseName);
      setSuccessMsg(`Extracted: ${baseName}`);
    } catch (err) {
      setError(`Failed to decompress entry: ${entry.filename}`);
    } finally {
      setExtractingId(null);
    }
  };

  const extractSelected = async () => {
    if (!file || selectedFilenames.size === 0) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const buffer = await file.arrayBuffer();
      const targets = entries.filter(e => selectedFilenames.has(e.filename) && !e.filename.endsWith('/'));
      
      for (let i = 0; i < targets.length; i++) {
        const entry = targets[i];
        const decompressed = await decompressZipEntry(buffer, entry);
        const mime = 'application/octet-stream';
        const blob = new Blob([decompressed.buffer as ArrayBuffer], { type: mime });
        const baseName = entry.filename.split('/').pop() || entry.filename;
        
        triggerBlobDownload(blob, baseName);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      setSuccessMsg(`Successfully extracted ${targets.length} selected files!`);
    } catch (err) {
      setError('An error occurred during selective extraction.');
    } finally {
      setLoading(false);
    }
  };

  const extractAll = async () => {
    if (!file || entries.length === 0) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const buffer = await file.arrayBuffer();
      const filesOnly = entries.filter(e => !e.filename.endsWith('/'));
      
      for (let i = 0; i < filesOnly.length; i++) {
        const entry = filesOnly[i];
        const decompressed = await decompressZipEntry(buffer, entry);
        const mime = 'application/octet-stream';
        const blob = new Blob([decompressed.buffer as ArrayBuffer], { type: mime });
        const baseName = entry.filename.split('/').pop() || entry.filename;
        
        triggerBlobDownload(blob, baseName);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      setSuccessMsg(`Successfully extracted all ${filesOnly.length} files!`);
    } catch (err) {
      setError('An error occurred during bulk file extraction.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (filename: string) => {
    const next = new Set(selectedFilenames);
    if (next.has(filename)) {
      next.delete(filename);
    } else {
      next.add(filename);
    }
    setSelectedFilenames(next);
  };

  const toggleSelectAll = () => {
    const filesOnly = entries.filter(e => !e.filename.endsWith('/'));
    if (selectedFilenames.size === filesOnly.length) {
      setSelectedFilenames(new Set());
    } else {
      setSelectedFilenames(new Set(filesOnly.map(e => e.filename)));
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredEntries = entries.filter(e =>
    e.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* File List / Explorer */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Archive className="text-[#4E8E5E]" size={22} />
              <span>ZIP Archive Extractor</span>
            </h2>
          </div>

          {!file ? (
            <div className="border border-dashed border-slate-800 rounded-2xl p-10 bg-slate-950/20 text-center flex flex-col items-center gap-4">
              <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
                <Upload size={32} />
              </div>
              <label className="btn-primary cursor-pointer mt-1">
                <span>Choose ZIP File</span>
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-slate-500 text-xs">Offline local decompression</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center bg-slate-900/30 p-3 rounded-xl border border-slate-850 text-xs">
                <div className="flex flex-col">
                  <span className="text-slate-200 font-semibold">{file.name}</span>
                  <span className="text-[10px] text-slate-450">{formatSize(file.size)}</span>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setEntries([]);
                    setError('');
                    setSuccessMsg('');
                    setSelectedFilenames(new Set());
                  }}
                  className="text-rose-455 hover:underline font-bold"
                >
                  Clear File
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-550" />
                <input
                  type="text"
                  placeholder="Search files inside archive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
                />
              </div>

              {loading && (
                <div className="text-center py-6 text-slate-400 text-xs flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-t-transparent border-[#4E8E5E] rounded-full animate-spin"></div>
                  Parsing ZIP package headers...
                </div>
              )}

              {error && (
                <div className="bg-rose-950/30 border border-rose-900/50 text-rose-400 p-3 rounded-xl flex items-start gap-2.5 text-xs">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 p-3 rounded-xl flex items-start gap-2.5 text-xs">
                  <Check size={16} className="shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {entries.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-455 font-bold uppercase tracking-wider">Archive Entries</span>
                    {selectedFilenames.size > 0 && (
                      <span className="text-[10px] text-[#4E8E5E] font-semibold">{selectedFilenames.size} selected</span>
                    )}
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-850">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-850">
                        <tr>
                          <th className="p-3 w-10">
                            <input
                              type="checkbox"
                              checked={selectedFilenames.size === entries.filter(e => !e.filename.endsWith('/')).length && entries.length > 0}
                              onChange={toggleSelectAll}
                              className="w-3.5 h-3.5 bg-slate-900 border-slate-800 rounded text-[#4E8E5E] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            />
                          </th>
                          <th className="p-3">File Path</th>
                          <th className="p-3 text-right">Size</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 bg-slate-950/40">
                        {filteredEntries.map((entry, idx) => {
                          const isDir = entry.filename.endsWith('/');
                          return (
                            <tr key={idx} className="hover:bg-slate-900/30">
                              <td className="p-3">
                                {!isDir && (
                                  <input
                                    type="checkbox"
                                    checked={selectedFilenames.has(entry.filename)}
                                    onChange={() => toggleSelect(entry.filename)}
                                    className="w-3.5 h-3.5 bg-slate-900 border-slate-800 rounded text-[#4E8E5E] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                  />
                                )}
                              </td>
                              <td className="p-3 font-mono text-slate-300 max-w-[280px] truncate flex items-center gap-2">
                                {isDir ? (
                                  <Folder size={14} className="text-amber-500 shrink-0" />
                                ) : (
                                  <File size={14} className="text-slate-400 shrink-0" />
                                )}
                                <span>{entry.filename}</span>
                              </td>
                              <td className="p-3 text-right text-slate-400 font-mono">
                                {isDir ? '-' : formatSize(entry.uncompressedSize)}
                              </td>
                              <td className="p-3 text-right">
                                {!isDir && (
                                  <button
                                    onClick={() => extractSingle(entry, idx)}
                                    disabled={extractingId !== null}
                                    className="text-[#4E8E5E] hover:underline font-semibold"
                                  >
                                    {extractingId === idx ? 'Extracting...' : 'Extract'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Control panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Global Actions</h3>

          <div className="flex flex-col gap-2.5 pt-1">
            {selectedFilenames.size > 0 && (
              <button
                onClick={extractSelected}
                disabled={loading}
                className="btn-indigo w-full py-3 flex items-center justify-center gap-1.5"
              >
                <span>Extract Selected ({selectedFilenames.size})</span>
              </button>
            )}
            <button
              onClick={extractAll}
              disabled={!file || entries.length === 0 || loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-1.5"
            >
              <Sparkles size={18} />
              <span>Extract All Files</span>
            </button>
          </div>
        </div>

        {/* Statistics panel */}
        {entries.length > 0 && (
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-2">Archive Stats</h3>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Entries:</span>
                <span className="text-slate-200 font-mono">{entries.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Files:</span>
                <span className="text-slate-200 font-mono">{entries.filter(e => !e.filename.endsWith('/')).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Folders:</span>
                <span className="text-slate-200 font-mono">{entries.filter(e => e.filename.endsWith('/')).length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Client-Side Parsing</span>
            <span className="text-[10px] leading-relaxed">Decompression is handled entirely within your browser runtime via streams API.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
