import { useState, useRef, useEffect, useCallback } from 'react';
import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { Mic, Square, Download, Pause, Play, Trash2, Clock } from 'lucide-react';

interface Recording {
  id: string;
  url: string;
  blob: Blob;
  duration: number;
  timestamp: string;
  label: string;
  size: number;
}

export const VoiceRecorderTool = () => {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [quality, setQuality] = useState<'standard' | 'high'>('high');
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGain, setAutoGain] = useState(true);
  const [levels, setLevels] = useState<number[]>(new Array(20).fill(0));
  const [editId, setEditId] = useState<string | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const levelsAnimRef = useRef<number>(0);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const inputs = devices.filter(d => d.kind === 'audioinput');
      setInputDevices(inputs);
      if (inputs.length > 0) setSelectedDevice(inputs[0].deviceId);
    });
  }, []);

  const drawLevels = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const bars = 20;
    const newLevels = Array.from({ length: bars }, (_, i) => {
      const idx = Math.floor((i / bars) * data.length);
      return data[idx] / 255;
    });
    setLevels(newLevels);
    levelsAnimRef.current = requestAnimationFrame(drawLevels);
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          noiseSuppression,
          echoCancellation,
          autoGainControl: autoGain,
          sampleRate: quality === 'high' ? 48000 : 22050,
        },
      });
      streamRef.current = stream;

      // Analyser for levels
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const src = ctx.createMediaStreamSource(stream);
      src.connect(analyser);
      analyserRef.current = analyser;
      levelsAnimRef.current = requestAnimationFrame(drawLevels);

      const mimeType = quality === 'high'
        ? (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm')
        : 'audio/webm';

      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorder.current = mr;
      chunks.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunks.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunks.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.addEventListener('loadedmetadata', () => {
          const rec: Recording = {
            id: Date.now().toString(),
            url,
            blob,
            duration: audio.duration,
            timestamp: new Date().toLocaleTimeString(),
            label: `Recording ${new Date().toLocaleTimeString()}`,
            size: blob.size,
          };
          setRecordings(prev => [rec, ...prev]);
        });
        stream.getTracks().forEach(t => t.stop());
        cancelAnimationFrame(levelsAnimRef.current);
        audioCtxRef.current?.close();
        setLevels(new Array(20).fill(0));
      };
      mr.start(100);
      setRecording(true);
      setPaused(false);
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed(s => s + 1), 1000);
    } catch (e) {
      console.error(e);
      alert('Microphone access denied or device unavailable.');
    }
  }, [selectedDevice, quality, noiseSuppression, echoCancellation, autoGain, drawLevels]);

  const pause = () => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.pause();
      setPaused(true);
      clearInterval(timerRef.current);
    }
  };

  const resume = () => {
    if (mediaRecorder.current?.state === 'paused') {
      mediaRecorder.current.resume();
      setPaused(false);
      timerRef.current = window.setInterval(() => setElapsed(s => s + 1), 1000);
    }
  };

  const stop = useCallback(() => {
    mediaRecorder.current?.stop();
    clearInterval(timerRef.current);
    setRecording(false);
    setPaused(false);
  }, []);

  useEffect(() => () => { stop(); }, [stop]);

  const deleteRecording = (id: string) => {
    setRecordings(prev => {
      const r = prev.find(r => r.id === id);
      if (r) URL.revokeObjectURL(r.url);
      return prev.filter(r => r.id !== id);
    });
  };

  const downloadRecording = (r: Recording) => {
    triggerBlobDownload(r.blob, `${r.label.replace(/[^a-z0-9]/gi, '_')}.webm`);
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const fmtSize = (b: number) => b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;
  const fmtDur = (s: number) => s > 60 ? `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}` : `${Math.floor(s)}s`;

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Mic size={18} className="text-teal-400" />
        <h3 className="font-bold text-teal-400 text-sm">Voice Recorder</h3>
        <span className="ml-auto text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">MediaRecorder API</span>
      </div>

      {/* Level meter */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-end gap-0.5 h-16 w-full bg-slate-900 rounded-xl px-3 py-2">
          {levels.map((l, i) => (
            <div key={i}
              className="flex-1 rounded-sm transition-all duration-75"
              style={{
                height: `${Math.max(4, l * 100)}%`,
                background: recording && !paused
                  ? `hsl(${160 - l * 60},70%,${40 + l * 30}%)`
                  : '#1e293b',
              }}
            />
          ))}
        </div>
        {recording && (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${paused ? 'bg-yellow-400' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-2xl font-mono font-bold text-white">{fmtTime(elapsed)}</span>
            <span className="text-xs text-slate-500">{paused ? 'PAUSED' : 'REC'}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        {!recording ? (
          <button onClick={start}
            className="flex items-center gap-2 btn-primary py-3 px-8 rounded-full text-sm font-bold">
            <Mic size={18} /> Start Recording
          </button>
        ) : (
          <>
            {paused ? (
              <button onClick={resume}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white py-2.5 px-5 rounded-full text-xs font-bold transition-colors">
                <Play size={14} /> Resume
              </button>
            ) : (
              <button onClick={pause}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black py-2.5 px-5 rounded-full text-xs font-bold transition-colors">
                <Pause size={14} /> Pause
              </button>
            )}
            <button onClick={stop}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white py-2.5 px-5 rounded-full text-xs font-bold transition-colors">
              <Square size={14} /> Stop
            </button>
          </>
        )}
      </div>

      {/* Settings */}
      {!recording && (
        <div className="grid grid-cols-2 gap-3 bg-slate-900/50 rounded-lg p-3">
          {inputDevices.length > 1 && (
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs text-slate-400">Microphone</label>
              <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs px-2 py-1.5 rounded text-slate-200">
                {inputDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 8)}`}</option>)}
              </select>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Quality</label>
            <div className="flex gap-2">
              {(['standard', 'high'] as const).map(q => (
                <button key={q} onClick={() => setQuality(q)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded capitalize border transition-all ${
                    quality === q ? 'border-teal-500 bg-teal-500/10 text-teal-400' : 'border-slate-700 bg-slate-800 text-slate-400'
                  }`}>{q}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={noiseSuppression} onChange={(e) => setNoiseSuppression(e.target.checked)} className="accent-teal-500" />
              <span className="text-xs text-slate-400">Noise Suppression</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={echoCancellation} onChange={(e) => setEchoCancellation(e.target.checked)} className="accent-teal-500" />
              <span className="text-xs text-slate-400">Echo Cancellation</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={autoGain} onChange={(e) => setAutoGain(e.target.checked)} className="accent-teal-500" />
              <span className="text-xs text-slate-400">Auto Gain Control</span>
            </label>
          </div>
        </div>
      )}

      {/* Recordings list */}
      {recordings.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-400 font-medium">{recordings.length} Recording{recordings.length !== 1 ? 's' : ''}</label>
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
            {recordings.map(r => (
              <div key={r.id} className="bg-slate-900/80 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {editId === r.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={r.label}
                      onChange={(e) => setRecordings(prev => prev.map(rec => rec.id === r.id ? { ...rec, label: e.target.value } : rec))}
                      onBlur={() => setEditId(null)}
                      className="flex-1 bg-transparent text-xs text-slate-200 font-medium outline-none border-b border-teal-500"
                    />
                  ) : (
                    <button className="flex-1 text-left text-xs text-slate-200 font-medium truncate hover:text-teal-400 transition-colors"
                      onClick={() => setEditId(r.id)}>
                      {r.label}
                    </button>
                  )}
                  <div className="flex items-center gap-1 shrink-0 text-[10px] text-slate-500">
                    <Clock size={9} />{r.timestamp}
                  </div>
                </div>
                <audio src={r.url} controls className="w-full" style={{ height: '32px' }} />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-[10px] text-slate-500">
                    <span>{fmtDur(r.duration)}</span>
                    <span>·</span>
                    <span>{fmtSize(r.size)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => downloadRecording(r)}
                      className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300">
                      <Download size={12} /> Save
                    </button>
                    <button onClick={() => deleteRecording(r.id)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
