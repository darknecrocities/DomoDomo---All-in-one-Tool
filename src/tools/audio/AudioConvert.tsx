import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, RefreshCw, Download, Loader2, Music, Tag, FileText, CheckCircle2 } from 'lucide-react';

// PCM → WAV encoder supporting bit depths (8-bit, 16-bit, 32-bit float)
const encodeWav = (buffer: AudioBuffer, channels: number, bitDepth: 8 | 16 | 32): ArrayBuffer => {
  const ch = Math.min(channels, buffer.numberOfChannels);
  const numSamples = buffer.length;
  const sampleRate = buffer.sampleRate;
  const bytesPerSample = bitDepth === 8 ? 1 : bitDepth === 16 ? 2 : 4;
  const blockAlign = ch * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const ab = new ArrayBuffer(44 + dataSize);
  const view = new DataView(ab);
  const write = (off: number, str: string) => { 
    for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); 
  };

  write(0, 'RIFF'); 
  view.setUint32(4, 36 + dataSize, true);
  write(8, 'WAVE'); 
  write(12, 'fmt ');
  view.setUint32(16, 16, true); 
  view.setUint16(20, bitDepth === 32 ? 3 : 1, true); // 3 = IEEE Float, 1 = PCM
  view.setUint16(22, ch, true); 
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true); 
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true); 
  write(36, 'data');
  view.setUint32(40, dataSize, true);

  let off = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]));
      if (bitDepth === 8) {
        // 8-bit unsigned PCM (0 to 255, center is 128)
        const val = Math.round((s + 1) * 127.5);
        view.setUint8(off, Math.max(0, Math.min(255, val)));
        off += 1;
      } else if (bitDepth === 16) {
        // 16-bit signed PCM
        const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
        view.setInt16(off, Math.max(-32768, Math.min(32767, Math.round(val))), true);
        off += 2;
      } else {
        // 32-bit float
        view.setFloat32(off, s, true);
        off += 4;
      }
    }
  }
  return ab;
};

const FORMAT_OPTS = [
  { value: 'wav', label: 'WAV (Lossless)', mime: 'audio/wav' },
  { value: 'ogg', label: 'OGG Vorbis', mime: 'audio/ogg' },
  { value: 'webm', label: 'WebM Opus', mime: 'audio/webm' },
];

export const AudioConvertTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [format, setFormat] = useState('wav');
  const [sampleRate, setSampleRate] = useState(44100);
  const [channels, setChannels] = useState(2);
  const [bitDepth, setBitDepth] = useState<8 | 16 | 32>(16);
  const [normalize, setNormalize] = useState(false);
  const [customName, setCustomName] = useState('');
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [meta, setMeta] = useState({ duration: 0, sr: 0, ch: 0, size: 0 });

  // Metadata tags
  const [tagTitle, setTagTitle] = useState('');
  const [tagArtist, setTagArtist] = useState('');
  const [tagAlbum, setTagAlbum] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setMeta(prev => ({ ...prev, size: file.size }));
      const baseName = file.name.replace(/\.[^.]+$/, '');
      setCustomName(`${baseName}_converted`);
      // Reset metadata inputs
      setTagTitle(baseName);
      setTagArtist('DomoDomo Converter');
      setTagAlbum('');
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onMeta = () => setMeta(prev => ({ ...prev, duration: a.duration }));
    a.addEventListener('loadedmetadata', onMeta);
    return () => a.removeEventListener('loadedmetadata', onMeta);
  }, [audioUrl]);

  const fmtSize = (b: number) => b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;
  const fmtDur = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  const handleConvert = useCallback(async () => {
    if (!file) return;
    setConverting(true);
    setProgress(10);
    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(25);
      const offCtx = new OfflineAudioContext(channels, 1, sampleRate);
      const decoded = await offCtx.decodeAudioData(arrayBuffer);
      setProgress(40);
      setMeta(prev => ({ ...prev, sr: decoded.sampleRate, ch: decoded.numberOfChannels }));

      // Resample via OfflineAudioContext
      const targetSamples = Math.ceil(decoded.duration * sampleRate);
      const renderCtx = new OfflineAudioContext(channels, targetSamples, sampleRate);
      const src = renderCtx.createBufferSource();
      src.buffer = decoded;

      if (normalize) {
        const gain = renderCtx.createGain();
        let peak = 0;
        for (let c = 0; c < decoded.numberOfChannels; c++) {
          const data = decoded.getChannelData(c);
          for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
        }
        gain.gain.value = peak > 0 ? 0.98 / peak : 1;
        src.connect(gain);
        gain.connect(renderCtx.destination);
      } else {
        src.connect(renderCtx.destination);
      }

      src.start();
      setProgress(60);
      const rendered = await renderCtx.startRendering();
      setProgress(80);

      const targetFileName = customName.trim() ? customName.trim() : 'audio';

      if (format === 'wav') {
        const wavBuf = encodeWav(rendered, channels, bitDepth);
        triggerBlobDownload(new Blob([wavBuf], { type: 'audio/wav' }), `${targetFileName}.wav`);
        setProgress(100);
        setConverting(false);
      } else {
        // OGG / WebM via MediaRecorder
        const liveCtx = new AudioContext({ sampleRate });
        const dest = liveCtx.createMediaStreamDestination();
        const bufSrc = liveCtx.createBufferSource();
        bufSrc.buffer = rendered;
        bufSrc.connect(dest);
        bufSrc.connect(liveCtx.destination);

        const mimeType = format === 'ogg'
          ? (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') ? 'audio/ogg;codecs=opus' : 'audio/webm')
          : 'audio/webm;codecs=opus';

        const mr = new MediaRecorder(dest.stream, { mimeType });
        const chunks: BlobPart[] = [];
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        mr.onstop = () => {
          triggerBlobDownload(new Blob(chunks, { type: mimeType }), `${targetFileName}.${format}`);
          liveCtx.close();
          setProgress(100);
          setConverting(false);
        };
        mr.start(200);
        bufSrc.start();
        bufSrc.onended = () => mr.stop();
      }
      setProgress(90);
    } catch (err) {
      console.error(err);
      setConverting(false);
    }
  }, [file, format, sampleRate, channels, normalize, customName, bitDepth]);

  return (
    <div className="max-w-3xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <RefreshCw size={18} className="text-teal-400 animate-spin-slow" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">Audio Format Converter</h3>
          <p className="text-[10px] text-slate-500">Offline high-performance audio resampling and channel mapping</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">WebAudio API</span>
      </div>

      {!file ? (
        <label className="flex flex-col items-center gap-3 py-12 border-2 border-dashed border-slate-700/60 rounded-xl cursor-pointer hover:border-teal-500/50 hover:bg-slate-950/20 transition-all">
          <Upload size={36} className="text-teal-400" />
          <span className="text-slate-300 text-sm font-semibold">Drop or click to upload audio file</span>
          <span className="text-slate-500 text-xs">Supports MP3, WAV, OGG, FLAC, M4A, AAC, etc.</span>
          <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
        </label>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Audio Player and Stats */}
          <div className="md:col-span-7 flex flex-col gap-4">
            <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-850/50 flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Music size={12} /> Live Preview</span>
              <audio ref={audioRef} src={audioUrl} controls className="w-full" preload="metadata" />
            </div>

            {meta.duration > 0 && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-2.5 text-center">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">Duration</div>
                  <div className="text-slate-200 font-bold font-mono mt-0.5">{fmtDur(meta.duration)}</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-2.5 text-center">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">File Size</div>
                  <div className="text-slate-200 font-bold font-mono mt-0.5">{fmtSize(meta.size)}</div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-2.5 text-center">
                  <div className="text-slate-500 text-[10px] uppercase font-semibold">Original Format</div>
                  <div className="text-slate-200 font-bold font-mono mt-0.5">{file.name.split('.').pop()?.toUpperCase()}</div>
                </div>
              </div>
            )}

            {/* Custom Output Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1"><FileText size={11} /> Save Filename</label>
              <div className="relative">
                <input type="text" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Target file name" className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-teal-500" />
                <span className="absolute right-3 top-2 text-[10px] text-slate-500">.{format}</span>
              </div>
            </div>

            {/* Metadata Tags */}
            <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Tag size={12} /> ID3 Metadata Tags</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-500">Track Title</label>
                  <input type="text" value={tagTitle} onChange={(e) => setTagTitle(e.target.value)} className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-300 text-xs" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-slate-500">Artist</label>
                  <input type="text" value={tagArtist} onChange={(e) => setTagArtist(e.target.value)} className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-300 text-xs" />
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-[10px] text-slate-500">Album</label>
                  <input type="text" value={tagAlbum} onChange={(e) => setTagAlbum(e.target.value)} className="bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-300 text-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="md:col-span-5 flex flex-col gap-4 border-l border-slate-800 md:pl-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversion Settings</span>

            {/* Target format */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase">Target Container Format</label>
              <div className="flex flex-col gap-1.5">
                {FORMAT_OPTS.map(f => (
                  <button key={f.value} onClick={() => setFormat(f.value)}
                    className={`w-full py-1.5 text-xs text-left px-3 rounded border transition-all flex items-center justify-between ${
                      format === f.value ? 'border-teal-500 bg-teal-500/10 text-teal-400 font-bold' : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}>
                    <span>{f.label}</span>
                    {format === f.value && <CheckCircle2 size={12} className="text-teal-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* WAV specific bit depth selection */}
            {format === 'wav' && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 uppercase">Bit Depth</label>
                <div className="grid grid-cols-3 gap-1">
                  {([8, 16, 32] as const).map(d => (
                    <button key={d} onClick={() => setBitDepth(d)}
                      className={`py-1 text-[10px] font-bold rounded border ${
                        bitDepth === d ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-800 bg-slate-900 text-slate-450'
                      }`}>
                      {d === 32 ? '32-Bit Float' : `${d}-Bit Int`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sample rate selection */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase font-semibold">Output Sample Rate</label>
              <select value={sampleRate} onChange={(e) => setSampleRate(Number(e.target.value))}
                className="bg-slate-900 border border-slate-800 text-xs px-2.5 py-1.5 rounded text-slate-200 focus:outline-none focus:border-teal-500">
                <option value={8000}>8,000 Hz (Telephony)</option>
                <option value={16000}>16,000 Hz (Speech Recognition)</option>
                <option value={22050}>22,050 Hz (AM Radio)</option>
                <option value={32000}>32,000 Hz (FM Audio)</option>
                <option value={44100}>44,100 Hz (CD Quality)</option>
                <option value={48000}>48,000 Hz (Professional Studio)</option>
                <option value={96000}>96,000 Hz (High-Definition Audio)</option>
              </select>
            </div>

            {/* Channels selection */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500 uppercase">Channels</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[1, 2].map(c => (
                  <button key={c} onClick={() => setChannels(c)}
                    className={`py-1 text-[10px] font-bold rounded border transition-all ${
                      channels === c ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-850 bg-slate-900 text-slate-400'
                    }`}>{c === 1 ? 'Mono' : 'Stereo'}</button>
                ))}
              </div>
            </div>

            {/* Normalize switch */}
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input type="checkbox" checked={normalize} onChange={(e) => setNormalize(e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 rounded" />
              <span className="text-[11px] text-slate-400 select-none">Normalize peak volume to 0 dBFS</span>
            </label>

            {converting && (
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase">
                  <span>Converting…</span><span>{progress}%</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-auto pt-3 border-t border-slate-850">
              <label className="flex items-center justify-center p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-teal-400 hover:border-teal-500/30 cursor-pointer transition-all">
                <Upload size={14} />
                <input type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
              </label>
              <button onClick={handleConvert} disabled={converting}
                className="flex-1 btn-primary flex items-center justify-center gap-1.5 py-2 text-xs font-bold disabled:opacity-50">
                {converting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                {converting ? `Processing…` : `Download ${format.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
