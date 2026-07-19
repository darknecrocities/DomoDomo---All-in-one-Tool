import React, { useState } from 'react';
import { Upload, Download, FolderArchive, Trash2, FileText, CheckCircle2 } from 'lucide-react';

interface BatchFile {
  id: string;
  name: string;
  size: number;
  tags: string[];
  bboxCount: number;
  url: string;
}

export const BatchImageAnnotatorTool: React.FC = () => {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [datasetName, setDatasetName] = useState<string>('my_custom_dataset');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const uploaded = Array.from(e.target.files);

    uploaded.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setFiles((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            name: f.name,
            size: f.size,
            tags: ['train'],
            bboxCount: 0,
            url: evt.target?.result as string,
          },
        ]);
      };
      reader.readAsDataURL(f);
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === files.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(files.map((f) => f.id));
    }
  };

  const applyTagToSelected = (tag: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        selectedIds.includes(f.id)
          ? { ...f, tags: Array.from(new Set([...f.tags, tag])) }
          : f
      )
    );
  };

  const removeSelected = () => {
    setFiles((prev) => prev.filter((f) => !selectedIds.includes(f.id)));
    setSelectedIds([]);
  };

  // Export dataset summary and structure
  const exportDatasetMeta = () => {
    const yamlContent = `path: ./${datasetName}\ntrain: images/train\nval: images/val\n\nnames:\n  0: person\n  1: car\n  2: object\n`;
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `data.yaml`;
    link.click();
  };

  const exportDatasetCSV = () => {
    const rows = [['filename', 'size_bytes', 'tags', 'annotations_count']];
    files.forEach((f) => {
      rows.push([f.name, f.size.toString(), f.tags.join(';'), f.bboxCount.toString()]);
    });
    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${datasetName}_manifest.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] bg-[#111213] text-[#ECEBE9] rounded-2xl overflow-hidden border border-[#2A2D30]">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18191B] border-b border-[#2A2D30]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#E29E2D]/20 text-[#E29E2D] rounded-xl border border-[#E29E2D]/30">
            <FolderArchive size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide text-[#ECEBE9]">Batch Image Annotator & Dataset Packer</h2>
            <p className="text-xs text-[#72706C]">Organize, tag, propagate annotations, and export complete dataset archives</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all">
            <Upload size={14} />
            <span>Batch Upload Images</span>
            <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          {files.length > 0 && (
            <>
              <button
                onClick={exportDatasetMeta}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2022] hover:bg-[#2A2D30] border border-[#2A2D30] text-xs font-semibold rounded-xl text-[#ECEBE9]"
              >
                <FileText size={14} className="text-[#E29E2D]" />
                <span>Export data.yaml</span>
              </button>
              <button
                onClick={exportDatasetCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3C6B4D]/20 border border-[#3C6B4D]/40 text-xs font-semibold rounded-xl text-[#3C6B4D]"
              >
                <Download size={14} />
                <span>Download Dataset Manifest CSV</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Controls Sidebar */}
        <div className="w-80 bg-[#141517] border-r border-[#2A2D30] p-4 flex flex-col gap-4 overflow-y-auto">
          <div>
            <span className="text-xs font-bold text-[#72706C] uppercase tracking-wider block mb-1">Dataset Config</span>
            <input
              type="text"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              className="w-full bg-[#18191B] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs font-semibold text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
              placeholder="Dataset name..."
            />
          </div>

          <div className="pt-3 border-t border-[#2A2D30]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#72706C] uppercase tracking-wider">
                Selected ({selectedIds.length} / {files.length})
              </span>
              <button onClick={selectAll} className="text-xs text-[#3C6B4D] hover:underline font-semibold">
                {selectedIds.length === files.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {selectedIds.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#A3A09B] block">Batch Apply Dataset Split</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => applyTagToSelected('train')}
                    className="flex-1 py-1.5 bg-[#3C6B4D]/20 border border-[#3C6B4D]/40 text-[#3C6B4D] text-xs font-semibold rounded-xl"
                  >
                    + Train Split
                  </button>
                  <button
                    onClick={() => applyTagToSelected('val')}
                    className="flex-1 py-1.5 bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-[#3B82F6] text-xs font-semibold rounded-xl"
                  >
                    + Val Split
                  </button>
                </div>
                <button
                  onClick={removeSelected}
                  className="w-full py-1.5 bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-semibold rounded-xl flex items-center justify-center gap-1 mt-2"
                >
                  <Trash2 size={14} /> Delete Selected ({selectedIds.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Files Grid Viewport */}
        <div className="flex-1 bg-[#0D0E0F] p-6 overflow-y-auto">
          {files.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file) => {
                const isSelected = selectedIds.includes(file.id);
                return (
                  <div
                    key={file.id}
                    onClick={() => toggleSelect(file.id)}
                    className={`relative rounded-2xl overflow-hidden border-2 bg-[#141517] cursor-pointer transition-all ${
                      isSelected ? 'border-[#3C6B4D] ring-2 ring-[#3C6B4D]/30' : 'border-[#2A2D30] hover:border-[#3C6B4D]/40'
                    }`}
                  >
                    <div className="aspect-video relative overflow-hidden bg-black/40">
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[#3C6B4D] text-white p-1 rounded-full shadow-lg">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-[#ECEBE9] truncate mb-1">{file.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {file.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              t === 'train'
                                ? 'bg-[#3C6B4D]/20 text-[#3C6B4D] border-[#3C6B4D]/40'
                                : 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/40'
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-12 max-w-md mx-auto my-12 border-2 border-dashed border-[#2A2D30] rounded-3xl bg-[#141517]/50">
              <div className="w-16 h-16 rounded-2xl bg-[#E29E2D]/10 text-[#E29E2D] flex items-center justify-center mx-auto mb-4 border border-[#E29E2D]/20">
                <FolderArchive size={32} />
              </div>
              <h3 className="text-base font-bold text-[#ECEBE9] mb-1">Upload Image Batch</h3>
              <p className="text-xs text-[#72706C] mb-6">Drag and drop multiple image files to construct machine learning dataset splits.</p>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-[#ECEBE9] rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-lg">
                <Upload size={14} />
                <span>Select Multiple Files</span>
                <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
