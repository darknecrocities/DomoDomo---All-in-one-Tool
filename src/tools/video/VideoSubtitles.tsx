import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerTextDownload } from '../../utils/sharedHelpers';
import { Upload, Subtitles, Download, Plus, Trash2, FileText, Eye } from 'lucide-react';

interface SubtitleEntry {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

const toSrtTime = (s: number) => {
  const h = Math.floor(s / 3600).toString().padStart(2, '0');
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  const ms = Math.round((s % 1) * 1000).toString().padStart(3, '0');
  return `${h}:${m}:${sec},${ms}`;
};

const toVttTime = (s: number) => {
  const h = Math.floor(s / 3600).toString().padStart(2, '0');
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  const ms = Math.round((s % 1) * 1000).toString().padStart(3, '0');
  return `${h}:${m}:${sec}.${ms}`;
};

export const VideoSubtitlesTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [subtitles, setSubtitles] = useState<SubtitleEntry[]>([]);
  const [exportFormat, setExportFormat] = useState<'srt' | 'vtt' | 'ass'>('srt');
  const [showOverlay, setShowOverlay] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [importText, setImportText] = useState('');
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => setDuration(v.duration);
    const onTime = () => setCurrentTime(v.currentTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('timeupdate', onTime);
    return () => {
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('timeupdate', onTime);
    };
  }, [videoUrl]);

  const activeSubtitle = subtitles.find(s => currentTime >= s.startTime && currentTime <= s.endTime);

  const addSubtitle = () => {
    const start = Math.max(0, currentTime);
    const entry: SubtitleEntry = {
      id: Date.now().toString(),
      startTime: start,
      endTime: Math.min(duration, start + 3),
      text: 'New subtitle',
    };
    setSubtitles(prev => [...prev, entry].sort((a, b) => a.startTime - b.startTime));
    setEditingId(entry.id);
  };

  const updateSubtitle = (id: string, field: keyof SubtitleEntry, value: string | number) => {
    setSubtitles(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const deleteSubtitle = (id: string) => {
    setSubtitles(prev => prev.filter(s => s.id !== id));
  };

  const markStart = () => {
    if (editingId) updateSubtitle(editingId, 'startTime', currentTime);
  };
  const markEnd = () => {
    if (editingId) updateSubtitle(editingId, 'endTime', currentTime);
  };

  const exportSrt = useCallback(() => {
    const sorted = [...subtitles].sort((a, b) => a.startTime - b.startTime);
    const content = sorted.map((s, i) =>
      `${i + 1}\n${toSrtTime(s.startTime)} --> ${toSrtTime(s.endTime)}\n${s.text}\n`
    ).join('\n');
    const baseName = file?.name.replace(/\.[^.]+$/, '') ?? 'subtitles';
    triggerTextDownload(content, `${baseName}.srt`);
  }, [subtitles, file]);

  const exportVtt = useCallback(() => {
    const sorted = [...subtitles].sort((a, b) => a.startTime - b.startTime);
    const content = 'WEBVTT\n\n' + sorted.map((s, i) =>
      `${i + 1}\n${toVttTime(s.startTime)} --> ${toVttTime(s.endTime)}\n${s.text}\n`
    ).join('\n');
    const baseName = file?.name.replace(/\.[^.]+$/, '') ?? 'subtitles';
    triggerTextDownload(content, `${baseName}.vtt`);
  }, [subtitles, file]);

  const exportAss = useCallback(() => {
    const sorted = [...subtitles].sort((a, b) => a.startTime - b.startTime);
    const toAssTime = (s: number) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
      const sec = Math.floor(s % 60).toString().padStart(2, '0');
      const cs = Math.round((s % 1) * 100).toString().padStart(2, '0');
      return `${h}:${m}:${sec}.${cs}`;
    };
    const header = `[Script Info]\nTitle: DomoDomo Subtitles\nScriptType: v4.00+\n\n[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,Bold,Italic,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV\nStyle: Default,Arial,24,&H00FFFFFF,0,0,1,2,0,2,10,10,30\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
    const events = sorted.map(s =>
      `Dialogue: 0,${toAssTime(s.startTime)},${toAssTime(s.endTime)},Default,,0,0,0,,${s.text}`
    ).join('\n');
    const baseName = file?.name.replace(/\.[^.]+$/, '') ?? 'subtitles';
    triggerTextDownload(header + events, `${baseName}.ass`);
  }, [subtitles, file]);

  const handleExport = () => {
    if (exportFormat === 'srt') exportSrt();
    else if (exportFormat === 'vtt') exportVtt();
    else exportAss();
  };

  const importSrt = useCallback(() => {
    if (!importText.trim()) return;
    const blocks = importText.trim().split(/\n\s*\n/);
    const parsed: SubtitleEntry[] = [];
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 3) continue;
      const timeLine = lines.find(l => l.includes('-->'));
      if (!timeLine) continue;
      const [startStr, endStr] = timeLine.split('-->').map(s => s.trim());
      const parseTime = (t: string) => {
        const [hms, ms] = t.replace(',', '.').split('.');
        const [h, m, s] = hms.split(':').map(Number);
        return h * 3600 + m * 60 + s + parseInt(ms || '0') / 1000;
      };
      const textLines = lines.slice(lines.indexOf(timeLine) + 1);
      parsed.push({
        id: Date.now().toString() + Math.random(),
        startTime: parseTime(startStr),
        endTime: parseTime(endStr),
        text: textLines.join('\n'),
      });
    }
    setSubtitles(parsed);
    setShowImport(false);
    setImportText('');
  }, [importText]);

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toFixed(1).padStart(4, '0')}`;

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Subtitles size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Subtitle Creator & Editor</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">SRT · VTT · ASS</span>
      </div>

      {!file ? (
        <label className="flex flex-col items-center gap-3 py-10 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-teal-500/50 transition-colors">
          <Upload size={32} className="text-teal-400" />
          <span className="text-slate-300 text-sm font-medium">Drop or click to upload video</span>
          <span className="text-slate-500 text-xs">MP4, WebM, MOV</span>
          <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
        </label>
      ) : (
        <>
          {/* Video with overlay */}
          <div className="relative">
            <video ref={videoRef} src={videoUrl} controls className="w-full rounded-lg bg-black aspect-video object-contain" preload="metadata" />
            {showOverlay && activeSubtitle && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-sm px-4 py-2 rounded-lg text-center max-w-[90%] pointer-events-none whitespace-pre-wrap">
                {activeSubtitle.text}
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2">
            <button onClick={addSubtitle}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
              <Plus size={12} /> Add at {fmt(currentTime)}
            </button>
            {editingId && (
              <>
                <button onClick={markStart}
                  className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-teal-400 text-xs font-bold px-3 py-2 rounded-lg">
                  Set Start → {fmt(currentTime)}
                </button>
                <button onClick={markEnd}
                  className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-teal-400 text-xs font-bold px-3 py-2 rounded-lg">
                  Set End → {fmt(currentTime)}
                </button>
              </>
            )}
            <button onClick={() => setShowOverlay(!showOverlay)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                showOverlay ? 'bg-slate-700 text-teal-400' : 'bg-slate-900 text-slate-500'
              }`}>
              <Eye size={12} /> Preview
            </button>
            <button onClick={() => setShowImport(!showImport)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-2 rounded-lg transition-colors">
              <FileText size={12} /> Import SRT
            </button>
          </div>

          {/* SRT Import */}
          {showImport && (
            <div className="flex flex-col gap-2">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste SRT content here..."
                className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 h-32 font-mono resize-none"
              />
              <div className="flex gap-2">
                <button onClick={importSrt} className="btn-primary text-xs py-1.5 px-4">Import</button>
                <button onClick={() => setShowImport(false)} className="text-xs text-slate-400 hover:text-slate-200 px-4">Cancel</button>
              </div>
            </div>
          )}

          {/* Subtitle List */}
          {subtitles.length > 0 && (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {[...subtitles].sort((a, b) => a.startTime - b.startTime).map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => setEditingId(sub.id)}
                  className={`flex flex-col gap-1 p-3 rounded-lg border cursor-pointer transition-all ${
                    editingId === sub.id
                      ? 'border-teal-500 bg-teal-500/5'
                      : currentTime >= sub.startTime && currentTime <= sub.endTime
                      ? 'border-yellow-500/50 bg-yellow-500/5'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-teal-400 font-mono">{fmt(sub.startTime)} → {fmt(sub.endTime)}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); if (videoRef.current) videoRef.current.currentTime = sub.startTime; }}
                        className="text-xs text-slate-400 hover:text-white px-2"
                      >▶</button>
                      <button onClick={(e) => { e.stopPropagation(); deleteSubtitle(sub.id); }}
                        className="text-red-400 hover:text-red-300">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  {editingId === sub.id ? (
                    <textarea
                      value={sub.text}
                      onChange={(e) => updateSubtitle(sub.id, 'text', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-slate-200 resize-none h-14 w-full"
                    />
                  ) : (
                    <span className="text-xs text-slate-200 line-clamp-2">{sub.text}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Export */}
          <div className="flex flex-col gap-3 bg-slate-900/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-medium">Export as:</label>
              <div className="flex gap-2">
                {(['srt', 'vtt', 'ass'] as const).map(f => (
                  <button key={f}
                    onClick={() => setExportFormat(f)}
                    className={`px-3 py-1 text-xs font-bold rounded uppercase border transition-all ${
                      exportFormat === f ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 bg-slate-800 text-slate-400'
                    }`}>{f}</button>
                ))}
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={subtitles.length === 0}
              className="btn-primary flex items-center justify-center gap-2 py-2 text-xs font-bold disabled:opacity-50"
            >
              <Download size={14} />
              Export {subtitles.length} Subtitles as .{exportFormat.toUpperCase()}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
