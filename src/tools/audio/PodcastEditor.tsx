import { useState, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Mic2, Download, Loader2, Plus, Trash2, ArrowUp, ArrowDown, Music, Volume2, ShieldAlert } from 'lucide-react';

interface Track {
  id: string;
  file: File;
  url: string;
  duration: number;
  volume: number;
  label: string;
  type: 'voice' | 'music' | 'sfx' | 'intro' | 'outro';
}

const encodeWav = (buffer: AudioBuffer): ArrayBuffer => {
  const ch = buffer.numberOfChannels;
  const numSamples = buffer.length;
  const sampleRate = buffer.sampleRate;
  const blockAlign = ch * 2;
  const dataSize = numSamples * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  const w = (off: number, str: string) => { 
    for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); 
  };
  w(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); w(8, 'WAVE'); w(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, ch, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true); view.setUint16(34, 16, true);
  w(36, 'data'); view.setUint32(40, dataSize, true);
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

const TRACK_TYPES: Track['type'][] = ['voice', 'music', 'sfx', 'intro', 'outro'];
const TYPE_COLORS: Record<Track['type'], string> = {
  voice: '#4E8E5E',
  music: '#8B5CF6',
  sfx: '#F97316',
  intro: '#06B6D4',
  outro: '#EC4899',
};

export const PodcastEditorTool = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [podcastTitle, setPodcastTitle] = useState('Podcast Composition');
  const [introSilence, setIntroSilence] = useState(0.5);
  const [outroSilence, setOutroSilence] = useState(1);
  const [masterGain, setMasterGain] = useState(1);
  const [normalize, setNormalize] = useState(true);
  const [compressDynamic, setCompressDynamic] = useState(true);
  const [crossfade, setCrossfade] = useState(0.5);
  const [outputFormat, setOutputFormat] = useState<'wav' | 'ogg'>('wav');
  
  // Ambient background music settings
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgVolume, setBgVolume] = useState(0.2);
  const [enableDucking, setEnableDucking] = useState(true);
  const duckingDb = -12; // -12dB ducking

  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const newTracks: Track[] = Array.from(files).map((f, i) => {
      const url = URL.createObjectURL(f);
      const track: Track = {
        id: `${Date.now()}-${i}`,
        file: f,
        url,
        duration: 0,
        volume: 1.0,
        label: f.name.replace(/\.[^.]+$/, ''),
        type: 'voice',
      };
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        setTracks(prev => prev.map(t => t.id === track.id ? { ...t, duration: audio.duration } : t));
      });
      return track;
    });
    setTracks(prev => [...prev, ...newTracks]);
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

  const updateTrack = (id: string, updates: Partial<Track>) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
  const fmtDur = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  const handleExport = useCallback(async () => {
    if (tracks.length === 0) return;
    setExporting(true);
    setProgress(5);

    try {
      const sampleRate = 44100;
      const channels = 2;
      const buffers: { buf: AudioBuffer; vol: number; type: Track['type'] }[] = [];

      // 1. Decode main tracks
      for (let i = 0; i < tracks.length; i++) {
        setProgressLabel(`Decoding Track ${i + 1}/${tracks.length}…`);
        const ab = await tracks[i].file.arrayBuffer();
        const offCtx = new OfflineAudioContext(2, 1, sampleRate);
        const decoded = await offCtx.decodeAudioData(ab);
        buffers.push({ buf: decoded, vol: tracks[i].volume, type: tracks[i].type });
        setProgress(5 + ((i + 1) / (tracks.length + (bgFile ? 1 : 0))) * 50);
      }

      // 2. Decode background track if exists
      let bgBuffer: AudioBuffer | null = null;
      if (bgFile) {
        setProgressLabel('Decoding Background Music track…');
        const bgAb = await bgFile.arrayBuffer();
        const bgCtx = new OfflineAudioContext(2, 1, sampleRate);
        bgBuffer = await bgCtx.decodeAudioData(bgAb);
      }

      setProgressLabel('Stitching layers…');
      const cfSamples = Math.floor(crossfade * sampleRate);
      const silIntro = Math.floor(introSilence * sampleRate);
      const silOutro = Math.floor(outroSilence * sampleRate);

      let totalSamples = silIntro + silOutro;
      buffers.forEach((b, i) => {
        totalSamples += b.buf.length;
        if (i > 0 && cfSamples > 0) totalSamples -= cfSamples;
      });

      const renderCtx = new OfflineAudioContext(channels, Math.max(1, totalSamples), sampleRate);

      // Master output dynamics
      let masterNode: AudioNode = renderCtx.destination;
      if (compressDynamic) {
        const comp = renderCtx.createDynamicsCompressor();
        comp.threshold.value = -18;
        comp.knee.value = 10;
        comp.ratio.value = 4;
        comp.attack.value = 0.005;
        comp.release.value = 0.1;
        comp.connect(renderCtx.destination);
        masterNode = comp;
      }
      const master = renderCtx.createGain();
      master.gain.value = masterGain;
      master.connect(masterNode);

      // Render main tracks sequentially
      let offset = silIntro;
      const voiceTimeIntervals: { start: number; end: number }[] = [];

      for (let i = 0; i < buffers.length; i++) {
        const { buf, vol, type } = buffers[i];
        const b = renderCtx.createBuffer(channels, buf.length, sampleRate);
        
        for (let c = 0; c < Math.min(channels, buf.numberOfChannels); c++) {
          const srcData = buf.getChannelData(c);
          if (normalize) {
            let peak = 0;
            for (let s = 0; s < srcData.length; s++) peak = Math.max(peak, Math.abs(srcData[s]));
            const normFactor = peak > 0.01 ? 0.95 / peak : 1;
            const normData = new Float32Array(srcData.length);
            for (let s = 0; s < srcData.length; s++) normData[s] = srcData[s] * normFactor;
            b.copyToChannel(normData, c);
          } else {
            b.copyToChannel(srcData, c);
          }
        }

        const src = renderCtx.createBufferSource();
        src.buffer = b;
        const gain = renderCtx.createGain();
        gain.gain.value = vol;
        src.connect(gain);
        gain.connect(master);

        const startSec = offset / sampleRate;
        const endSec = startSec + buf.length / sampleRate;

        if (type === 'voice') {
          voiceTimeIntervals.push({ start: startSec, end: endSec });
        }

        // Crossfading calculations
        if (crossfade > 0 && i > 0) {
          gain.gain.setValueAtTime(0, startSec);
          gain.gain.linearRampToValueAtTime(vol, startSec + crossfade);
        }
        if (crossfade > 0 && i < buffers.length - 1) {
          gain.gain.setValueAtTime(vol, endSec - crossfade);
          gain.gain.linearRampToValueAtTime(0, endSec);
        }
        src.start(startSec);
        offset += buf.length - cfSamples;
      }

      // Mix Ambient Background music with Auto-Ducking
      if (bgBuffer) {
        const bgSrc = renderCtx.createBufferSource();
        bgSrc.buffer = bgBuffer;
        bgSrc.loop = true;

        const bgGain = renderCtx.createGain();
        bgGain.gain.setValueAtTime(bgVolume, 0);

        // Apply ducking automation based on voice intervals
        if (enableDucking && voiceTimeIntervals.length > 0) {
          const duckedVolume = bgVolume * Math.pow(10, duckingDb / 20);
          voiceTimeIntervals.forEach(interval => {
            // Duck down right before voice starts
            bgGain.gain.setValueAtTime(bgVolume, Math.max(0, interval.start - 0.3));
            bgGain.gain.linearRampToValueAtTime(duckedVolume, interval.start);
            // Rise back up right after voice finishes
            bgGain.gain.setValueAtTime(duckedVolume, interval.end);
            bgGain.gain.linearRampToValueAtTime(bgVolume, interval.end + 0.4);
          });
        }

        bgSrc.connect(bgGain);
        bgGain.connect(master);
        bgSrc.start(0);
        // Stop background when sequential track finishes
        bgSrc.stop(totalSamples / sampleRate);
      }

      setProgress(75);
      setProgressLabel('Rendering multi-layer mix…');
      const rendered = await renderCtx.startRendering();
      setProgress(90);
      setProgressLabel('Encoding final composition…');

      const fileName = podcastTitle.toLowerCase().replace(/\s+/g, '_');
      if (outputFormat === 'wav') {
        const wavBuf = encodeWav(rendered);
        triggerBlobDownload(new Blob([wavBuf], { type: 'audio/wav' }), `${fileName}.wav`);
        setProgress(100);
        setExporting(false);
        setProgressLabel('');
      } else {
        const liveCtx = new AudioContext();
        const dest = liveCtx.createMediaStreamDestination();
        const bufSrc = liveCtx.createBufferSource();
        bufSrc.buffer = rendered;
        bufSrc.connect(dest);
        const mimeType = MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') ? 'audio/ogg;codecs=opus' : 'audio/webm';
        const mr = new MediaRecorder(dest.stream, { mimeType });
        const chunks: BlobPart[] = [];
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        mr.onstop = () => {
          triggerBlobDownload(new Blob(chunks, { type: 'audio/ogg' }), `${fileName}.ogg`);
          liveCtx.close();
          setExporting(false);
          setProgressLabel('');
          setProgress(0);
        };
        mr.start(200);
        bufSrc.start();
        bufSrc.onended = () => mr.stop();
      }
    } catch (err) {
      console.error(err);
      setExporting(false);
      setProgressLabel('');
    }
  }, [tracks, podcastTitle, introSilence, outroSilence, masterGain, normalize, compressDynamic, crossfade, outputFormat, bgFile, bgVolume, enableDucking, duckingDb]);

  return (
    <div className="max-w-3xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Mic2 size={18} className="text-teal-400" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">Podcast Editor & Multi-Track Mixer</h3>
          <p className="text-[10px] text-slate-500">Stitch narration reels, overlay ambient music tracks, and configure auto-ducking triggers</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">Multi-Track</span>
      </div>

      {/* Podcast Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-slate-500 uppercase font-semibold">Podcast Title / Output Filename</label>
        <input type="text" value={podcastTitle} onChange={(e) => setPodcastTitle(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 w-full focus:outline-none focus:border-teal-500" />
      </div>

      {/* Narrative tracks */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] text-slate-500 uppercase font-semibold">Audio Narrative Tracks</span>
        
        <label className="flex items-center gap-3 py-4 border-2 border-dashed border-slate-700/60 rounded-xl cursor-pointer hover:border-teal-500/50 hover:bg-slate-950/20 transition-all justify-center">
          <Plus size={16} className="text-teal-400" />
          <span className="text-slate-300 text-xs font-semibold">Add Story Tracks</span>
          <input type="file" multiple accept="audio/*" className="hidden" onChange={(e) => addFiles(e.target.files)} />
        </label>

        {tracks.length > 0 && (
          <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {tracks.map((t, i) => (
              <div key={t.id} className="bg-slate-900/80 border border-slate-850 rounded-xl p-3.5 flex flex-col gap-2 border-l-3"
                style={{ borderColor: TYPE_COLORS[t.type] }}>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-850" style={{ color: TYPE_COLORS[t.type] }}>#{i + 1}</span>
                  <input
                    type="text"
                    value={t.label}
                    onChange={(e) => updateTrack(t.id, { label: e.target.value })}
                    className="flex-1 bg-transparent text-xs text-slate-200 font-semibold outline-none border-b border-transparent hover:border-slate-700 focus:border-teal-500 transition-colors"
                  />
                  <span className="text-[10px] text-slate-550 font-mono">{fmtDur(t.duration)}</span>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => moveTrack(t.id, -1)} disabled={i === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ArrowUp size={12} /></button>
                    <button onClick={() => moveTrack(t.id, 1)} disabled={i === tracks.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ArrowDown size={12} /></button>
                    <button onClick={() => removeTrack(t.id)} className="p-1 text-rose-400 hover:text-rose-350"><Trash2 size={12} /></button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-950/40 p-2 rounded-lg justify-between">
                  <div className="flex gap-1">
                    {TRACK_TYPES.map(type => (
                      <button key={type}
                        onClick={() => updateTrack(t.id, { type })}
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded capitalize border transition-all ${
                          t.type === type ? 'border-current bg-teal-950/20' : 'border-slate-850 text-slate-500'
                        }`}
                        style={{ color: t.type === type ? TYPE_COLORS[type] : undefined }}>
                        {type}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-[220px]">
                    <span className="text-[9px] text-slate-500 uppercase font-semibold">Volume:</span>
                    <input type="range" min={0} max={2.0} step={0.05} value={t.volume}
                      onChange={(e) => updateTrack(t.id, { volume: parseFloat(e.target.value) })}
                      className="flex-1 accent-teal-500" style={{ height: '4px' }} />
                    <span className="text-[9px] font-mono text-slate-400 w-8">{Math.round(t.volume * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dual Layer: Ambient music */}
      <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Music size={12} /> Ambient Background Music Layer</span>
          {bgFile && (
            <button onClick={() => setBgFile(null)} className="text-[10px] text-rose-450 hover:text-rose-400 flex items-center gap-1"><Trash2 size={11} /> Clear Music</button>
          )}
        </div>

        {!bgFile ? (
          <label className="flex items-center justify-center gap-2 py-3 border border-dashed border-slate-800 rounded-lg cursor-pointer hover:border-teal-500/40 hover:bg-slate-950/15 transition-all text-xs text-slate-450">
            <Plus size={13} /> Select backing track file
            <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && setBgFile(e.target.files[0])} />
          </label>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-950/35 p-3 rounded-lg border border-slate-850/60">
            <div className="sm:col-span-5 flex flex-col">
              <span className="text-xs text-slate-200 font-semibold truncate">{bgFile.name}</span>
              <span className="text-[9px] text-slate-500">Overlay music loops beneath voice clips</span>
            </div>
            
            <div className="sm:col-span-3 flex items-center gap-2">
              <Volume2 size={13} className="text-slate-400 shrink-0" />
              <input type="range" min={0} max={1.0} step={0.05} value={bgVolume}
                onChange={(e) => setBgVolume(parseFloat(e.target.value))} className="w-full accent-teal-500" />
              <span className="text-[9px] font-mono text-slate-400 w-8">{Math.round(bgVolume * 100)}%</span>
            </div>

            <div className="sm:col-span-4 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer border-l border-slate-800 pl-3">
                <input type="checkbox" checked={enableDucking} onChange={(e) => setEnableDucking(e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 rounded" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-300">Auto-Ducking</span>
                  <span className="text-[8px] text-slate-550">Lowers music when voice plays</span>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Global stitching settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-900/40 border border-slate-850 p-4 rounded-xl">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-500 uppercase">Intro Silence padding</label>
          <div className="flex justify-between text-[9px] text-slate-400 font-mono"><span>0.0s</span><span>{introSilence.toFixed(1)}s</span><span>5.0s</span></div>
          <input type="range" min={0} max={5} step={0.5} value={introSilence}
            onChange={(e) => setIntroSilence(parseFloat(e.target.value))} className="w-full accent-teal-500" />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-500 uppercase">Outro Silence padding</label>
          <div className="flex justify-between text-[9px] text-slate-400 font-mono"><span>0.0s</span><span>{outroSilence.toFixed(1)}s</span><span>5.0s</span></div>
          <input type="range" min={0} max={5} step={0.5} value={outroSilence}
            onChange={(e) => setOutroSilence(parseFloat(e.target.value))} className="w-full accent-teal-500" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-500 uppercase">Clip Crossfade Overlap</label>
          <div className="flex justify-between text-[9px] text-slate-400 font-mono"><span>0.0s</span><span>{crossfade.toFixed(1)}s</span><span>3.0s</span></div>
          <input type="range" min={0} max={3} step={0.1} value={crossfade}
            onChange={(e) => setCrossfade(parseFloat(e.target.value))} className="w-full accent-teal-500" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-500 uppercase">Master Gain: {Math.round(masterGain * 100)}%</label>
          <input type="range" min={0.2} max={1.8} step={0.05} value={masterGain}
            onChange={(e) => setMasterGain(parseFloat(e.target.value))} className="w-full accent-teal-500 mt-2" />
        </div>

        <div className="flex flex-col gap-2 justify-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={normalize} onChange={(e) => setNormalize(e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 rounded" />
            <span className="text-xs text-slate-450 select-none">Normalize individual clips</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={compressDynamic} onChange={(e) => setCompressDynamic(e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 rounded" />
            <span className="text-xs text-slate-450 select-none">Apply master dynamics compressor</span>
          </label>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-550 uppercase font-semibold">Output Format</label>
          <div className="grid grid-cols-2 gap-1.5 mt-0.5">
            {(['wav', 'ogg'] as const).map(f => (
              <button key={f} onClick={() => setOutputFormat(f)}
                className={`py-1.5 text-[10px] font-bold rounded uppercase border transition-all ${
                  outputFormat === f ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 bg-slate-950 text-slate-450'
                }`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400">
        <ShieldAlert size={12} className="text-teal-400 shrink-0 mt-0.5" />
        <span>Mixing & Ducking takes place completely inside your browser sandbox. No audio streams ever leave your computer.</span>
      </div>

      {exporting && (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[10px] text-slate-450 font-bold uppercase">
            <span>{progressLabel}</span><span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
            <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <button onClick={handleExport} disabled={exporting || tracks.length === 0}
        className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50">
        {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
        {exporting ? `${progressLabel}` : `Mix & Export Master Composition (${fmtDur(totalDuration)})`}
      </button>
    </div>
  );
};
