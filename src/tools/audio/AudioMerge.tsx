import { useState, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Layers, Download, Loader2, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface AudioItem {
  id: string;
  file: File;
  url: string;
  duration: number;
  volume: number;
  trimStart: number;
  trimEnd: number | null;
}

const encodeWav = (buffer: AudioBuffer): ArrayBuffer => {
  const ch = buffer.numberOfChannels;
  const numSamples = buffer.length;
  const sampleRate = buffer.sampleRate;
  const blockAlign = ch * 2;
  const dataSize = numSamples * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  const write = (off: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
  write(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); write(8, 'WAVE'); write(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, ch, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true); view.setUint16(34, 16, true);
  write(36, 'data'); view.setUint32(40, dataSize, true);
  let off = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]));
      view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      off += 2;
    }
  }
  return ab;
};

export const AudioMergeTool = () => {
  const [tracks, setTracks] = useState<AudioItem[]>([]);
  const [mode, setMode] = useState<'sequential' | 'overlay'>('sequential');
  const [outputFormat, setOutputFormat] = useState<'wav' | 'ogg'>('wav');
  const [crossfade, setCrossfade] = useState(0);
  const [merging, setMerging] = useState(false);
  const [progress, setProgress] = useState(0);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const items: AudioItem[] = Array.from(files).map(f => {
      const url = URL.createObjectURL(f);
      const item: AudioItem = { id: `${Date.now()}-${Math.random()}`, file: f, url, duration: 0, volume: 1, trimStart: 0, trimEnd: null };
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        setTracks(prev => prev.map(t => t.id === item.id ? { ...t, duration: audio.duration, trimEnd: audio.duration } : t));
      });
      return item;
    });
    setTracks(prev => [...prev, ...items]);
  };

  const removeTrack = (id: string) => {
    setTracks(prev => {
      const t = prev.find(t => t.id === id);
      if (t) URL.revokeObjectURL(t.url);
      return prev.filter(t => t.id !== id);
    });
  };

  const moveTrack = (id: string, dir: -1 | 1) => {
    setTracks(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  const updateTrack = (id: string, field: keyof AudioItem, value: number) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleMerge = useCallback(async () => {
    if (tracks.length < 1) return;
    setMerging(true);
    setProgress(5);
    try {
      const sampleRate = 44100;
      const buffers: AudioBuffer[] = [];
      const volumes = tracks.map(t => t.volume);

      for (let i = 0; i < tracks.length; i++) {
        const ab = await tracks[i].file.arrayBuffer();
        const offCtx = new OfflineAudioContext(2, 1, sampleRate);
        const decoded = await offCtx.decodeAudioData(ab);

        // Trim
        const s = Math.floor(tracks[i].trimStart * decoded.sampleRate);
        const e = Math.floor((tracks[i].trimEnd ?? decoded.duration) * decoded.sampleRate);
        const len = e - s;
        const trimCtx = new OfflineAudioContext(decoded.numberOfChannels, len, decoded.sampleRate);
        const trimBuf = trimCtx.createBuffer(decoded.numberOfChannels, len, decoded.sampleRate);
        for (let c = 0; c < decoded.numberOfChannels; c++) {
          trimBuf.copyToChannel(decoded.getChannelData(c).slice(s, e), c);
        }
        const src = trimCtx.createBufferSource();
        src.buffer = trimBuf;
        const gain = trimCtx.createGain();
        gain.gain.value = tracks[i].volume;
        src.connect(gain);
        gain.connect(trimCtx.destination);
        src.start();
        const rendered = await trimCtx.startRendering();
        buffers.push(rendered);
        setProgress(5 + ((i + 1) / tracks.length) * 60);
      }

      let finalBuffer: AudioBuffer;
      const channels = 2;

      if (mode === 'sequential') {
        // Concatenate with optional crossfade
        const cfSamples = Math.floor(crossfade * sampleRate);
        let totalSamples = 0;
        buffers.forEach((b, i) => {
          totalSamples += b.length;
          if (i > 0 && cfSamples > 0) totalSamples -= cfSamples;
        });
        const renderCtx = new OfflineAudioContext(channels, Math.max(1, totalSamples), sampleRate);
        let offset = 0;
        for (let i = 0; i < buffers.length; i++) {
          const buf = buffers[i];
          const src = renderCtx.createBufferSource();
          const b = renderCtx.createBuffer(channels, buf.length, sampleRate);
          for (let c = 0; c < Math.min(channels, buf.numberOfChannels); c++) {
            b.copyToChannel(buf.getChannelData(c), c);
          }
          src.buffer = b;
          const g = renderCtx.createGain();
          src.connect(g);
          g.connect(renderCtx.destination);
          const startSec = offset / sampleRate;
          if (crossfade > 0 && i > 0) {
            g.gain.setValueAtTime(0, startSec);
            g.gain.linearRampToValueAtTime(1, startSec + crossfade);
          }
          if (crossfade > 0 && i < buffers.length - 1) {
            const endSec = startSec + buf.length / sampleRate;
            g.gain.setValueAtTime(1, endSec - crossfade);
            g.gain.linearRampToValueAtTime(0, endSec);
          }
          src.start(startSec);
          offset += buf.length - cfSamples;
        }
        setProgress(75);
        finalBuffer = await renderCtx.startRendering();
      } else {
        // Overlay / mix
        const maxLen = Math.max(...buffers.map(b => b.length));
        const renderCtx = new OfflineAudioContext(channels, maxLen, sampleRate);
        for (let i = 0; i < buffers.length; i++) {
          const buf = buffers[i];
          const b = renderCtx.createBuffer(channels, buf.length, sampleRate);
          for (let c = 0; c < Math.min(channels, buf.numberOfChannels); c++) {
            b.copyToChannel(buf.getChannelData(c), c);
          }
          const src = renderCtx.createBufferSource();
          src.buffer = b;
          const g = renderCtx.createGain();
          g.gain.value = volumes[i];
          src.connect(g);
          g.connect(renderCtx.destination);
          src.start(0);
        }
        setProgress(75);
        finalBuffer = await renderCtx.startRendering();
      }

      setProgress(90);
      if (outputFormat === 'wav') {
        const wavBuf = encodeWav(finalBuffer);
        triggerBlobDownload(new Blob([wavBuf], { type: 'audio/wav' }), 'merged_audio.wav');
      } else {
        const liveCtx = new AudioContext();
        const dest = liveCtx.createMediaStreamDestination();
        const bufSrc = liveCtx.createBufferSource();
        bufSrc.buffer = finalBuffer;
        bufSrc.connect(dest);
        const mimeType = MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') ? 'audio/ogg;codecs=opus' : 'audio/webm';
        const mr = new MediaRecorder(dest.stream, { mimeType });
        const chunks: BlobPart[] = [];
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        mr.onstop = () => {
          triggerBlobDownload(new Blob(chunks, { type: 'audio/ogg' }), 'merged_audio.ogg');
          liveCtx.close();
          setMerging(false);
          setProgress(0);
        };
        mr.start(200);
        bufSrc.start();
        bufSrc.onended = () => mr.stop();
        return;
      }

      setProgress(100);
      setMerging(false);
      setTimeout(() => setProgress(0), 500);
    } catch (err) {
      console.error(err);
      setMerging(false);
    }
  }, [tracks, mode, crossfade, outputFormat]);

  const fmtDur = (s: number) => s > 0 ? `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}` : '…';

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Layers size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Audio Merger / Mixer</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">OfflineAudioContext</span>
      </div>

      <label className="flex items-center gap-3 py-4 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-teal-500/50 transition-colors justify-center">
        <Plus size={18} className="text-teal-400" />
        <span className="text-slate-300 text-sm font-medium">Add Audio Files</span>
        <input type="file" multiple accept="audio/*" className="hidden" onChange={(e) => addFiles(e.target.files)} />
      </label>

      {/* Mode toggle */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-400 font-medium">Merge Mode</label>
        <div className="flex gap-2">
          {(['sequential', 'overlay'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border capitalize transition-all ${
                mode === m ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 bg-slate-900 text-slate-400'
              }`}>
              {m === 'sequential' ? '▶ Sequential (End to End)' : '⊕ Overlay (Mix Tracks)'}
            </button>
          ))}
        </div>
      </div>

      {/* Track list */}
      {tracks.length > 0 && (
        <div className="flex flex-col gap-2">
          {tracks.map((t, i) => (
            <div key={t.id} className="bg-slate-900/80 rounded-lg p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-teal-400 font-bold text-xs w-5">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-200 font-medium truncate">{t.file.name}</div>
                  <div className="text-xs text-slate-500">{fmtDur(t.duration)}</div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => moveTrack(t.id, -1)} disabled={i === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ArrowUp size={12} /></button>
                  <button onClick={() => moveTrack(t.id, 1)} disabled={i === tracks.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ArrowDown size={12} /></button>
                  <button onClick={() => removeTrack(t.id)} className="p-1 text-red-400 hover:text-red-300"><Trash2 size={12} /></button>
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <div className="flex flex-col gap-0.5 flex-1">
                  <label className="text-slate-500">Volume: {Math.round(t.volume * 100)}%</label>
                  <input type="range" min={0} max={2} step={0.05} value={t.volume}
                    onChange={(e) => updateTrack(t.id, 'volume', parseFloat(e.target.value))}
                    className="w-full accent-teal-500" />
                </div>
                {t.duration > 0 && (
                  <>
                    <div className="flex flex-col gap-0.5 flex-1">
                      <label className="text-slate-500">Start: {t.trimStart.toFixed(1)}s</label>
                      <input type="range" min={0} max={t.duration} step={0.1} value={t.trimStart}
                        onChange={(e) => updateTrack(t.id, 'trimStart', parseFloat(e.target.value))}
                        className="w-full accent-teal-500" />
                    </div>
                    <div className="flex flex-col gap-0.5 flex-1">
                      <label className="text-slate-500">End: {(t.trimEnd ?? t.duration).toFixed(1)}s</label>
                      <input type="range" min={0} max={t.duration} step={0.1} value={t.trimEnd ?? t.duration}
                        onChange={(e) => updateTrack(t.id, 'trimEnd', parseFloat(e.target.value))}
                        className="w-full accent-teal-500" />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings */}
      <div className="grid grid-cols-2 gap-3 bg-slate-900/50 rounded-lg p-3">
        {mode === 'sequential' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Crossfade: {crossfade.toFixed(1)}s</label>
            <input type="range" min={0} max={5} step={0.1} value={crossfade}
              onChange={(e) => setCrossfade(parseFloat(e.target.value))} className="w-full accent-teal-500" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Output Format</label>
          <div className="flex gap-2">
            {(['wav', 'ogg'] as const).map(f => (
              <button key={f} onClick={() => setOutputFormat(f)}
                className={`flex-1 py-1.5 text-xs font-bold rounded uppercase border transition-all ${
                  outputFormat === f ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 bg-slate-800 text-slate-400'
                }`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {merging && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-slate-400"><span>Merging…</span><span>{progress.toFixed(0)}%</span></div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <button onClick={handleMerge} disabled={merging || tracks.length < 1}
        className="btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50">
        {merging ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        {merging ? `Merging… ${progress.toFixed(0)}%` : `Merge ${tracks.length} Track${tracks.length !== 1 ? 's' : ''}`}
      </button>
    </div>
  );
};
