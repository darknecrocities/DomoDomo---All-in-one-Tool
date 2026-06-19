import { useState, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Layers, Download, Loader2, Plus, Trash2, ArrowUp, ArrowDown, Settings, FileText } from 'lucide-react';

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
  const write = (off: number, str: string) => { 
    for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); 
  };
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
  const [crossfade, setCrossfade] = useState(0.5);
  const [customName, setCustomName] = useState('merged_output');
  const [merging, setMerging] = useState(false);
  const [progress, setProgress] = useState(0);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const items: AudioItem[] = Array.from(files).map(f => {
      const url = URL.createObjectURL(f);
      const item: AudioItem = { 
        id: `${Date.now()}-${Math.random()}`, 
        file: f, 
        url, 
        duration: 0, 
        volume: 1.0, 
        trimStart: 0, 
        trimEnd: null 
      };
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

        // Trim segment
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
        // Overlay mix
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
      const targetFileName = customName.trim() ? customName.trim() : 'merged_composition';

      if (outputFormat === 'wav') {
        const wavBuf = encodeWav(finalBuffer);
        triggerBlobDownload(new Blob([wavBuf], { type: 'audio/wav' }), `${targetFileName}.wav`);
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
          triggerBlobDownload(new Blob(chunks, { type: 'audio/ogg' }), `${targetFileName}.ogg`);
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
  }, [tracks, mode, crossfade, outputFormat, customName]);

  const fmtDur = (s: number) => s > 0 ? `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}` : '…';

  return (
    <div className="max-w-3xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Layers size={18} className="text-teal-400" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">Audio Merger & Mixer</h3>
          <p className="text-[10px] text-slate-500">Concatenate audios end-to-end or layer them simultaneously into a mix</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">Timeline Builder</span>
      </div>

      <label className="flex items-center gap-3 py-6 border-2 border-dashed border-slate-700/60 rounded-xl cursor-pointer hover:border-teal-500/50 hover:bg-slate-950/20 transition-all justify-center">
        <Plus size={18} className="text-teal-400" />
        <span className="text-slate-300 text-sm font-semibold">Select Audio Tracks</span>
        <input type="file" multiple accept="audio/*" className="hidden" onChange={(e) => addFiles(e.target.files)} />
      </label>

      {/* Mode selectors */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] text-slate-500 uppercase font-semibold">Merge Operation Mode</label>
        <div className="grid grid-cols-2 gap-2">
          {(['sequential', 'overlay'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                mode === m ? 'border-teal-500 bg-teal-500/10 text-teal-400 font-bold' : 'border-slate-800 bg-slate-900 text-slate-400'
              }`}>
              {m === 'sequential' ? '▶ Sequential (End to End)' : '⊕ Overlay (Mix Tracks)'}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Timeline Layout representation */}
      {tracks.length > 0 && (
        <div className="flex flex-col gap-2 bg-slate-950/45 p-3 rounded-xl border border-slate-850">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Visual Arrangement Preview</span>
          <div className={`flex ${mode === 'sequential' ? 'flex-row overflow-x-auto min-h-[50px] items-center' : 'flex-col gap-1.5'} p-2 rounded bg-slate-900/60`}>
            {tracks.map((t, idx) => {
              const weight = t.duration || 5;
              const relativeWidth = mode === 'sequential' ? `${Math.max(10, Math.min(60, weight * 4))}%` : '100%';
              return (
                <div key={t.id} className="text-[10px] p-2 bg-teal-950/30 border border-teal-800/40 text-teal-400 rounded flex items-center justify-between truncate" style={{ width: relativeWidth }}>
                  <span className="font-semibold truncate">#{idx + 1}: {t.file.name}</span>
                  <span className="text-[9px] font-mono shrink-0 ml-2">({fmtDur(t.duration)})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Track listing */}
      {tracks.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Track Deck settings</span>
          <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
            {tracks.map((t, i) => (
              <div key={t.id} className="bg-slate-900/80 border border-slate-850 rounded-xl p-4 flex flex-col gap-3 relative">
                <div className="flex items-center gap-2">
                  <span className="text-teal-400 font-extrabold text-xs w-6 h-6 flex items-center justify-center bg-slate-950 rounded-full border border-slate-800">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-200 font-semibold truncate">{t.file.name}</div>
                    <div className="text-[10px] text-slate-500">Track length: {fmtDur(t.duration)}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => moveTrack(t.id, -1)} disabled={i === 0} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30"><ArrowUp size={13} /></button>
                    <button onClick={() => moveTrack(t.id, 1)} disabled={i === tracks.length - 1} className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30"><ArrowDown size={13} /></button>
                    <button onClick={() => removeTrack(t.id)} className="p-1.5 text-rose-400 hover:text-rose-300"><Trash2 size={13} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] bg-slate-950/40 p-2.5 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <label className="text-slate-500">Volume Balance: {Math.round(t.volume * 100)}%</label>
                    <input type="range" min={0} max={2.0} step={0.05} value={t.volume}
                      onChange={(e) => updateTrack(t.id, 'volume', parseFloat(e.target.value))}
                      className="w-full accent-teal-500" />
                  </div>
                  {t.duration > 0 && (
                    <>
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-500">Trim From: {t.trimStart.toFixed(1)}s</label>
                        <input type="range" min={0} max={t.duration} step={0.1} value={t.trimStart}
                          onChange={(e) => updateTrack(t.id, 'trimStart', parseFloat(e.target.value))}
                          className="w-full accent-teal-500" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-500">Trim To: {(t.trimEnd ?? t.duration).toFixed(1)}s</label>
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
        </div>
      )}

      {/* Global Config Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/40 border border-slate-850 p-4 rounded-xl items-center">
        {mode === 'sequential' ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-550 uppercase font-semibold flex items-center gap-1"><Settings size={11} /> Crossfade overlap</label>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.0s</span>
              <span className="text-teal-400 font-semibold">{crossfade.toFixed(1)}s</span>
              <span>5.0s</span>
            </div>
            <input type="range" min={0} max={5} step={0.1} value={crossfade}
              onChange={(e) => setCrossfade(parseFloat(e.target.value))} className="w-full accent-teal-500 mt-1" />
          </div>
        ) : (
          <div className="text-[10px] text-slate-500 italic">No crossfade options available in Overlay mode</div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-550 uppercase font-semibold">Save File Format</label>
          <div className="grid grid-cols-2 gap-1.5">
            {(['wav', 'ogg'] as const).map(f => (
              <button key={f} onClick={() => setOutputFormat(f)}
                className={`py-1.5 text-[10px] font-bold rounded uppercase border transition-all ${
                  outputFormat === f ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-550 uppercase font-semibold flex items-center gap-1"><FileText size={11} /> Target Filename</label>
          <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Target file name" className="bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-300 text-xs font-mono" />
        </div>
      </div>

      {merging && (
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase"><span>Blending audio matrices…</span><span>{progress.toFixed(0)}%</span></div>
          <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
            <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <button onClick={handleMerge} disabled={merging || tracks.length < 1}
        className="btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50 mt-1">
        {merging ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        {merging ? `Processing merge (${progress.toFixed(0)}%)` : `Export Combined Track (${tracks.length})`}
      </button>
    </div>
  );
};
