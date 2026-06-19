import { useState, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Mic2, Download, Loader2, Plus, Trash2, ArrowUp, ArrowDown, Info } from 'lucide-react';

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
  const w = (off: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
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
  const [podcastTitle, setPodcastTitle] = useState('My Podcast Episode');
  const [introSilence, setIntroSilence] = useState(0.5);
  const [outroSilence, setOutroSilence] = useState(1);
  const [masterGain, setMasterGain] = useState(1);
  const [normalize, setNormalize] = useState(true);
  const [compressDynamic, setCompressDynamic] = useState(true);
  const [crossfade, setCrossfade] = useState(0.5);
  const [outputFormat, setOutputFormat] = useState<'wav' | 'ogg'>('wav');
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
        volume: 1,
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

      for (let i = 0; i < tracks.length; i++) {
        setProgressLabel(`Decoding track ${i + 1}/${tracks.length}…`);
        const ab = await tracks[i].file.arrayBuffer();
        const offCtx = new OfflineAudioContext(2, 1, sampleRate);
        const decoded = await offCtx.decodeAudioData(ab);
        buffers.push({ buf: decoded, vol: tracks[i].volume, type: tracks[i].type });
        setProgress(5 + ((i + 1) / tracks.length) * 50);
      }

      setProgressLabel('Mixing podcast…');
      const cfSamples = Math.floor(crossfade * sampleRate);
      const silIntro = Math.floor(introSilence * sampleRate);
      const silOutro = Math.floor(outroSilence * sampleRate);

      let totalSamples = silIntro + silOutro;
      buffers.forEach((b, i) => {
        totalSamples += b.buf.length;
        if (i > 0 && cfSamples > 0) totalSamples -= cfSamples;
      });

      const renderCtx = new OfflineAudioContext(channels, Math.max(1, totalSamples), sampleRate);

      // Master gain + optional compressor
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

      let offset = silIntro;
      for (let i = 0; i < buffers.length; i++) {
        const { buf, vol } = buffers[i];
        const b = renderCtx.createBuffer(channels, buf.length, sampleRate);
        for (let c = 0; c < Math.min(channels, buf.numberOfChannels); c++) {
          const srcData = buf.getChannelData(c);
          // Normalize if enabled
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
        // Crossfade
        if (crossfade > 0 && i > 0) {
          gain.gain.setValueAtTime(0, startSec);
          gain.gain.linearRampToValueAtTime(vol, startSec + crossfade);
        }
        if (crossfade > 0 && i < buffers.length - 1) {
          const endSec = startSec + buf.length / sampleRate;
          gain.gain.setValueAtTime(vol, endSec - crossfade);
          gain.gain.linearRampToValueAtTime(0, endSec);
        }
        src.start(startSec);
        offset += buf.length - cfSamples;
      }

      setProgress(70);
      setProgressLabel('Rendering…');
      const rendered = await renderCtx.startRendering();
      setProgress(90);
      setProgressLabel('Encoding output…');

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
  }, [tracks, podcastTitle, introSilence, outroSilence, masterGain, normalize, compressDynamic, crossfade, outputFormat]);

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Mic2 size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Podcast Editor & Mixer</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">OfflineAudioContext</span>
      </div>

      {/* Podcast title */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400 font-medium">Episode Title</label>
        <input type="text" value={podcastTitle} onChange={(e) => setPodcastTitle(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 w-full" />
      </div>

      <label className="flex items-center gap-3 py-3 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-teal-500/50 transition-colors justify-center">
        <Plus size={18} className="text-teal-400" />
        <span className="text-slate-300 text-sm font-medium">Add Audio Tracks</span>
        <input type="file" multiple accept="audio/*" className="hidden" onChange={(e) => addFiles(e.target.files)} />
      </label>

      {/* Track list */}
      {tracks.length > 0 && (
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
          {tracks.map((t, i) => (
            <div key={t.id} className="bg-slate-900/80 rounded-lg p-3 flex flex-col gap-2 border-l-2"
              style={{ borderColor: TYPE_COLORS[t.type] }}>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs" style={{ color: TYPE_COLORS[t.type] }}>#{i + 1}</span>
                <input
                  type="text"
                  value={t.label}
                  onChange={(e) => updateTrack(t.id, { label: e.target.value })}
                  className="flex-1 bg-transparent text-xs text-slate-200 font-medium outline-none border-b border-transparent hover:border-slate-600 focus:border-teal-500 transition-colors"
                />
                <span className="text-xs text-slate-500">{fmtDur(t.duration)}</span>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => moveTrack(t.id, -1)} disabled={i === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ArrowUp size={11} /></button>
                  <button onClick={() => moveTrack(t.id, 1)} disabled={i === tracks.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30"><ArrowDown size={11} /></button>
                  <button onClick={() => removeTrack(t.id)} className="p-1 text-red-400 hover:text-red-300"><Trash2 size={11} /></button>
                </div>
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <div className="flex gap-1">
                  {TRACK_TYPES.map(type => (
                    <button key={type}
                      onClick={() => updateTrack(t.id, { type })}
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded capitalize border transition-all ${
                        t.type === type ? 'border-current' : 'border-slate-700 text-slate-500'
                      }`}
                      style={{ color: t.type === type ? TYPE_COLORS[type] : undefined }}>
                      {type}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-[10px] text-slate-500 shrink-0">Vol:</span>
                  <input type="range" min={0} max={2} step={0.05} value={t.volume}
                    onChange={(e) => updateTrack(t.id, { volume: parseFloat(e.target.value) })}
                    className="flex-1 accent-teal-500" style={{ height: '4px' }} />
                  <span className="text-[10px] text-slate-400 w-8">{Math.round(t.volume * 100)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tracks.length > 0 && (
        <div className="flex gap-2 text-xs text-slate-400 flex-wrap">
          <span className="bg-slate-900 px-2 py-1 rounded">{tracks.length} tracks</span>
          <span className="bg-slate-900 px-2 py-1 rounded">Total: {fmtDur(totalDuration)}</span>
        </div>
      )}

      {/* Settings */}
      <div className="grid grid-cols-2 gap-3 bg-slate-900/50 rounded-lg p-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Intro Silence: {introSilence.toFixed(1)}s</label>
          <input type="range" min={0} max={5} step={0.5} value={introSilence}
            onChange={(e) => setIntroSilence(parseFloat(e.target.value))} className="w-full accent-teal-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Outro Silence: {outroSilence.toFixed(1)}s</label>
          <input type="range" min={0} max={5} step={0.5} value={outroSilence}
            onChange={(e) => setOutroSilence(parseFloat(e.target.value))} className="w-full accent-teal-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Crossfade: {crossfade.toFixed(1)}s</label>
          <input type="range" min={0} max={3} step={0.1} value={crossfade}
            onChange={(e) => setCrossfade(parseFloat(e.target.value))} className="w-full accent-teal-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-400">Master Gain: {Math.round(masterGain * 100)}%</label>
          <input type="range" min={0.1} max={2} step={0.05} value={masterGain}
            onChange={(e) => setMasterGain(parseFloat(e.target.value))} className="w-full accent-teal-500" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="pod-normalize" checked={normalize} onChange={(e) => setNormalize(e.target.checked)} className="accent-teal-500" />
          <label htmlFor="pod-normalize" className="text-xs text-slate-400">Normalize each track</label>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="pod-compress" checked={compressDynamic} onChange={(e) => setCompressDynamic(e.target.checked)} className="accent-teal-500" />
          <label htmlFor="pod-compress" className="text-xs text-slate-400">Dynamic compression</label>
        </div>
        <div className="col-span-2 flex flex-col gap-1">
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

      <div className="flex items-start gap-2 bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400">
        <Info size={12} className="text-teal-400 shrink-0 mt-0.5" />
        <span>Mixes all tracks sequentially with crossfades, silence padding, per-track normalization, and dynamic compression — fully in-browser.</span>
      </div>

      {exporting && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>{progressLabel}</span><span>{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <button onClick={handleExport} disabled={exporting || tracks.length === 0}
        className="btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50">
        {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        {exporting ? `${progressLabel || 'Exporting…'} ${progress.toFixed(0)}%` : `Mix & Export Podcast (${fmtDur(totalDuration)})`}
      </button>
    </div>
  );
};
