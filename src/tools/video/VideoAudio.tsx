import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Upload, Music, Download, Loader2 } from 'lucide-react';

export const VideoAudioTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [outputFormat, setOutputFormat] = useState<'wav' | 'ogg'>('wav');
  const [sampleRate, setSampleRate] = useState(44100);
  const [channels, setChannels] = useState(2);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const onMeta = () => {
      setDuration(v.duration);
      setEndTime(v.duration);
    };
    v.addEventListener('loadedmetadata', onMeta);
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, [videoUrl]);

  const drawWaveform = useCallback((waveform: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 80;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(78,142,94,0.3)';
    const barW = canvas.width / waveform.length;
    waveform.forEach((amp, i) => {
      const barH = amp * canvas.height;
      ctx.fillRect(i * barW, (canvas.height - barH) / 2, Math.max(1, barW - 1), barH);
    });
  }, []);

  useEffect(() => {
    if (waveformData.length > 0) drawWaveform(waveformData);
  }, [waveformData, drawWaveform]);

  const encodeWav = (audioBuffer: AudioBuffer, channelCount: number): ArrayBuffer => {
    const ch = Math.min(channelCount, audioBuffer.numberOfChannels);
    const numSamples = audioBuffer.length;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = ch * bytesPerSample;
    const byteRate = audioBuffer.sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    const write = (offset: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
    write(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true);
    write(8, 'WAVE'); write(12, 'fmt ');
    view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, ch, true); view.setUint32(24, audioBuffer.sampleRate, true);
    view.setUint32(28, byteRate, true); view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true); write(36, 'data');
    view.setUint32(40, dataSize, true);
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      for (let c = 0; c < ch; c++) {
        const chData = audioBuffer.getChannelData(c);
        const s = Math.max(-1, Math.min(1, chData[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        offset += 2;
      }
    }
    return buffer;
  };

  const handleExtract = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setProgress(10);
    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(30);
      const audioCtx = new OfflineAudioContext(channels, 1, sampleRate);
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      setProgress(50);

      // Build waveform
      const ch0 = decoded.getChannelData(0);
      const buckets = 80;
      const bucketSize = Math.floor(ch0.length / buckets);
      const wf: number[] = Array.from({ length: buckets }, (_, i) => {
        let max = 0;
        for (let s = 0; s < bucketSize; s++) max = Math.max(max, Math.abs(ch0[i * bucketSize + s] || 0));
        return max;
      });
      setWaveformData(wf);
      setProgress(60);

      // Trim audio
      const sStart = Math.floor(startTime * decoded.sampleRate);
      const sEnd = Math.floor((endTime ?? decoded.duration) * decoded.sampleRate);
      const trimLen = sEnd - sStart;
      const trimCtx = new OfflineAudioContext(channels, trimLen, sampleRate);
      const trimBuffer = trimCtx.createBuffer(channels, trimLen, decoded.sampleRate);
      for (let c = 0; c < Math.min(channels, decoded.numberOfChannels); c++) {
        trimBuffer.copyToChannel(decoded.getChannelData(c).slice(sStart, sEnd), c);
      }

      const src = trimCtx.createBufferSource();
      src.buffer = trimBuffer;
      src.connect(trimCtx.destination);
      src.start();
      const rendered = await trimCtx.startRendering();
      setProgress(85);

      let blob: Blob;
      const baseName = file.name.replace(/\.[^.]+$/, '');
      if (outputFormat === 'wav') {
        const wavBuffer = encodeWav(rendered, channels);
        blob = new Blob([wavBuffer], { type: 'audio/wav' });
        triggerBlobDownload(blob, `${baseName}_audio.wav`);
      } else {
        // OGG via MediaRecorder on a canvas-captured stream (audio only)
        const offCtx = new AudioContext();
        const dest = offCtx.createMediaStreamDestination();
        const bufSrc = offCtx.createBufferSource();
        bufSrc.buffer = rendered;
        bufSrc.connect(dest);
        bufSrc.connect(offCtx.destination);
        const mr = new MediaRecorder(dest.stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') ? 'audio/ogg;codecs=opus' : 'audio/webm',
        });
        const chunks: BlobPart[] = [];
        mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        mr.onstop = () => {
          blob = new Blob(chunks, { type: 'audio/ogg' });
          triggerBlobDownload(blob, `${baseName}_audio.ogg`);
          offCtx.close();
          setProcessing(false);
          setProgress(0);
        };
        mr.start(100);
        bufSrc.start();
        bufSrc.onended = () => mr.stop();
        return;
      }

      setProgress(100);
      setProcessing(false);
      setProgress(0);
    } catch (err) {
      console.error(err);
      setProcessing(false);
    }
  }, [file, outputFormat, sampleRate, channels, startTime, endTime]);

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Music size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Extract Audio from Video</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">WebAudio API</span>
      </div>

      {!file ? (
        <label className="flex flex-col items-center gap-3 py-10 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-teal-500/50 transition-colors">
          <Upload size={32} className="text-teal-400" />
          <span className="text-slate-300 text-sm font-medium">Drop or click to upload video</span>
          <span className="text-slate-500 text-xs">MP4, WebM, MOV, AVI</span>
          <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
        </label>
      ) : (
        <>
          <video ref={videoRef} src={videoUrl} controls className="w-full rounded-lg bg-black aspect-video object-contain" preload="metadata" />

          {waveformData.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Audio Waveform</label>
              <canvas ref={canvasRef} className="w-full h-12 rounded bg-slate-900" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 bg-slate-900/50 rounded-lg p-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Output Format</label>
              <div className="flex gap-2">
                {(['wav', 'ogg'] as const).map(f => (
                  <button key={f}
                    onClick={() => setOutputFormat(f)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all uppercase ${
                      outputFormat === f ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 bg-slate-800 text-slate-400'
                    }`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Channels</label>
              <div className="flex gap-2">
                {[1, 2].map(c => (
                  <button key={c}
                    onClick={() => setChannels(c)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      channels === c ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 bg-slate-800 text-slate-400'
                    }`}>{c === 1 ? 'Mono' : 'Stereo'}</button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Sample Rate</label>
              <select value={sampleRate} onChange={(e) => setSampleRate(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
                <option value={22050}>22,050 Hz (Low)</option>
                <option value={44100}>44,100 Hz (CD Quality)</option>
                <option value={48000}>48,000 Hz (Studio)</option>
              </select>
            </div>
            {duration > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">Extract Range</label>
                <div className="flex items-center gap-1 text-xs text-slate-300">
                  <span>{fmt(startTime)}</span>
                  <span className="text-slate-500">→</span>
                  <span>{fmt(endTime ?? duration)}</span>
                </div>
              </div>
            )}
            {duration > 0 && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">Start: {fmt(startTime)}</label>
                  <input type="range" min={0} max={duration} step={0.1} value={startTime}
                    onChange={(e) => setStartTime(parseFloat(e.target.value))}
                    className="w-full accent-teal-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">End: {fmt(endTime ?? duration)}</label>
                  <input type="range" min={0} max={duration} step={0.1} value={endTime ?? duration}
                    onChange={(e) => setEndTime(parseFloat(e.target.value))}
                    className="w-full accent-teal-500" />
                </div>
              </>
            )}
          </div>

          {processing && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Extracting audio…</span><span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <button onClick={handleExtract} disabled={processing}
            className="btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-bold disabled:opacity-50">
            {processing ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {processing ? `Extracting… ${progress}%` : `Extract to ${outputFormat.toUpperCase()}`}
          </button>
        </>
      )}
    </div>
  );
};
