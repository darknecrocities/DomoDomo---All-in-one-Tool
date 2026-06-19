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
  const quality = 'high';
  
  // Audio Nodes Settings
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const autoGain = true;
  const [gainDb, setGainDb] = useState(0); // Boost gain in dB (0 to 20)

  // Silence Detection (Auto Pause)
  const [enableAutoPause, setEnableAutoPause] = useState(false);
  const [silenceThreshold, setSilenceThreshold] = useState(5); // 5% threshold
  const [isAutoPaused, setIsAutoPaused] = useState(false);

  const [levels, setLevels] = useState<number[]>(new Array(20).fill(0));
  const [editId, setEditId] = useState<string | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timerRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Web Audio Routing Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const destNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  const levelsAnimRef = useRef<number>(0);
  const silenceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const inputs = devices.filter(d => d.kind === 'audioinput');
      setInputDevices(inputs);
      if (inputs.length > 0) setSelectedDevice(inputs[0].deviceId);
    });
  }, []);

  const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  
  // Pause/Resume actions
  const pause = useCallback(() => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.pause();
      setPaused(true);
      clearInterval(timerRef.current);
    }
  }, []);

  const resume = useCallback(() => {
    if (mediaRecorder.current?.state === 'paused') {
      mediaRecorder.current.resume();
      setPaused(false);
      setIsAutoPaused(false);
      timerRef.current = window.setInterval(() => setElapsed(s => s + 1), 1000);
    }
  }, []);

  const drawLevels = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    
    const bars = 20;
    let totalAmp = 0;
    const newLevels = Array.from({ length: bars }, (_, i) => {
      const idx = Math.floor((i / bars) * data.length);
      const val = data[idx] / 255;
      totalAmp += val;
      return val;
    });
    setLevels(newLevels);

    // Auto-Pause Silence Detection logic
    if (enableAutoPause && recording && !paused) {
      const averageAmpPercent = (totalAmp / bars) * 100;
      if (averageAmpPercent < silenceThreshold) {
        // Start countdown to pause
        if (silenceTimerRef.current === null) {
          silenceTimerRef.current = window.setTimeout(() => {
            pause();
            setIsAutoPaused(true);
          }, 2200); // 2.2 seconds of silence triggers pause
        }
      } else {
        // Voice detected, reset silence timer
        if (silenceTimerRef.current !== null) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      }
    } else if (enableAutoPause && recording && paused && isAutoPaused) {
      // Auto-Resume logic
      const averageAmpPercent = (totalAmp / bars) * 100;
      if (averageAmpPercent >= silenceThreshold + 2) { // 2% hysteresis
        resume();
      }
    }

    levelsAnimRef.current = requestAnimationFrame(drawLevels);
  }, [enableAutoPause, silenceThreshold, recording, paused, isAutoPaused, pause, resume]);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          noiseSuppression,
          echoCancellation,
          autoGainControl: autoGain,
        },
      });
      streamRef.current = stream;

      // Audio Context pipeline
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const src = ctx.createMediaStreamSource(stream);
      const gainNode = ctx.createGain();
      // Translate dB boost to linear gain multiplier
      gainNode.gain.value = Math.pow(10, gainDb / 20);
      gainNodeRef.current = gainNode;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const dest = ctx.createMediaStreamDestination();
      destNodeRef.current = dest;

      // Connect nodes: mic -> gain -> analyser -> recorder destination
      src.connect(gainNode);
      gainNode.connect(analyser);
      analyser.connect(dest);

      levelsAnimRef.current = requestAnimationFrame(drawLevels);

      const mimeType = quality === 'high'
        ? (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm')
        : 'audio/webm';

      // Record boosted output stream
      const mr = new MediaRecorder(dest.stream, { mimeType });
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
            label: `Recorded Clip ${new Date().toLocaleTimeString()}`,
            size: blob.size,
          };
          setRecordings(prev => [rec, ...prev]);
        });
        
        // Cleanup Audio Nodes
        stream.getTracks().forEach(t => t.stop());
        cancelAnimationFrame(levelsAnimRef.current);
        audioCtxRef.current?.close();
        setLevels(new Array(20).fill(0));
      };

      mr.start(100);
      setRecording(true);
      setPaused(false);
      setIsAutoPaused(false);
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed(s => s + 1), 1000);
    } catch (e) {
      console.error(e);
      alert('Microphone access denied or device unavailable.');
    }
  }, [selectedDevice, quality, noiseSuppression, echoCancellation, autoGain, gainDb, drawLevels]);

  const stop = useCallback(() => {
    mediaRecorder.current?.stop();
    clearInterval(timerRef.current);
    if (silenceTimerRef.current !== null) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setRecording(false);
    setPaused(false);
    setIsAutoPaused(false);
  }, []);

  // Update Gain node dynamically while recording
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(Math.pow(10, gainDb / 20), audioCtxRef.current?.currentTime || 0);
    }
  }, [gainDb]);

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

  const fmtSize = (b: number) => b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;
  const fmtDur = (s: number) => s > 60 ? `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}` : `${Math.floor(s)}s`;

  return (
    <div className="max-w-3xl mx-auto glass-card p-6 flex flex-col gap-6 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Mic size={18} className="text-teal-400" />
        <div>
          <h3 className="font-bold text-teal-400 text-sm">Voice Recorder</h3>
          <p className="text-[10px] text-slate-500">Record microphone feeds, adjust input gain levels, and toggle silence filters</p>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">MediaStream API</span>
      </div>

      {/* Visual meter */}
      <div className="flex flex-col gap-3">
        <div className="flex items-end gap-1 h-20 w-full bg-slate-950/50 border border-slate-850 rounded-xl px-4 py-2">
          {levels.map((l, i) => (
            <div key={i}
              className="flex-1 rounded-sm transition-all duration-75"
              style={{
                height: `${Math.max(5, l * 100)}%`,
                background: recording && !paused
                  ? `hsl(${140 - l * 50}, 85%, 45%)`
                  : '#1e293b',
              }}
            />
          ))}
        </div>
        {recording && (
          <div className="flex items-center justify-center gap-3">
            <div className={`w-3 h-3 rounded-full ${paused ? 'bg-yellow-400' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-3xl font-mono font-bold text-slate-100">{fmtTime(elapsed)}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {isAutoPaused ? 'Auto Paused (Silence)' : paused ? 'Paused' : 'Recording'}
            </span>
          </div>
        )}
      </div>

      {/* Rec action buttons */}
      <div className="flex gap-3 justify-center">
        {!recording ? (
          <button onClick={start}
            className="flex items-center gap-2 btn-primary py-3 px-8 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-lg">
            <Mic size={15} /> Start Recording
          </button>
        ) : (
          <div className="flex gap-2">
            {paused ? (
              <button onClick={resume}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white py-2.5 px-6 rounded-full text-xs font-bold transition-all shadow-md">
                <Play size={13} /> Resume Recording
              </button>
            ) : (
              <button onClick={pause}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black py-2.5 px-6 rounded-full text-xs font-bold transition-all shadow-md">
                <Pause size={13} /> Pause Recording
              </button>
            )}
            <button onClick={stop}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white py-2.5 px-6 rounded-full text-xs font-bold transition-all shadow-md">
              <Square size={13} /> Stop & Save
            </button>
          </div>
        )}
      </div>

      {/* Configuration Settings */}
      {!recording && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/40 border border-slate-850 p-4 rounded-xl">
          <div className="flex flex-col gap-3">
            {inputDevices.length > 1 && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 uppercase">Input Microphone</label>
                <select value={selectedDevice} onChange={(e) => setSelectedDevice(e.target.value)}
                  className="bg-slate-950 border border-slate-850 text-xs px-2.5 py-1.5 rounded text-slate-200 focus:outline-none">
                  {inputDevices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic: ${d.deviceId.slice(0, 8)}`}</option>)}
                </select>
              </div>
            )}

            {/* Gain Boost */}
            <div className="flex flex-col gap-1.5 bg-slate-950/45 p-3 rounded border border-slate-850">
              <div className="flex justify-between text-[10px] text-slate-550">
                <span className="uppercase">Input Gain Boost</span>
                <span className="font-mono text-teal-400 font-bold">+{gainDb} dB</span>
              </div>
              <input type="range" min={0} max={20} step={1} value={gainDb} onChange={(e) => setGainDb(Number(e.target.value))} className="w-full accent-teal-500" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Auto Pause Silence filter */}
            <div className="flex flex-col gap-2 bg-slate-950/45 p-3 rounded border border-slate-850">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[10px] text-slate-550 uppercase">Auto-Pause (Silence Detection)</span>
                <input type="checkbox" checked={enableAutoPause} onChange={(e) => setEnableAutoPause(e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 rounded" />
              </label>
              {enableAutoPause && (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>Silence Threshold:</span>
                    <span>{silenceThreshold}%</span>
                  </div>
                  <input type="range" min={2} max={25} step={1} value={silenceThreshold} onChange={(e) => setSilenceThreshold(Number(e.target.value))} className="w-full accent-teal-500" />
                </div>
              )}
            </div>

            {/* Hardware filter switches */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-950/20 p-2 rounded border border-slate-850">
                <input type="checkbox" checked={noiseSuppression} onChange={(e) => setNoiseSuppression(e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 rounded" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-350">Denoising</span>
                  <span className="text-[8px] text-slate-500">Noise suppression</span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-950/20 p-2 rounded border border-slate-850">
                <input type="checkbox" checked={echoCancellation} onChange={(e) => setEchoCancellation(e.target.checked)} className="accent-teal-500 w-3.5 h-3.5 rounded" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-350">Echo Cancel</span>
                  <span className="text-[8px] text-slate-500">Acoustic cancellation</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Saved clip history deck */}
      {recordings.length > 0 && (
        <div className="flex flex-col gap-3">
          <label className="text-[10px] text-slate-500 uppercase font-semibold">{recordings.length} Recorded Files</label>
          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
            {recordings.map(r => (
              <div key={r.id} className="bg-slate-900/80 border border-slate-850 rounded-xl p-3 flex flex-col gap-2 relative">
                <div className="flex items-center gap-2">
                  {editId === r.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={r.label}
                      onChange={(e) => setRecordings(prev => prev.map(rec => rec.id === r.id ? { ...rec, label: e.target.value } : rec))}
                      onBlur={() => setEditId(null)}
                      className="flex-1 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-xs text-slate-200 font-semibold outline-none focus:border-teal-500"
                    />
                  ) : (
                    <button className="flex-1 text-left text-xs text-slate-200 font-semibold truncate hover:text-teal-400 transition-colors"
                      onClick={() => setEditId(r.id)}>
                      {r.label}
                    </button>
                  )}
                  <div className="flex items-center gap-1 shrink-0 text-[9px] text-slate-500 font-mono">
                    <Clock size={9} />{r.timestamp}
                  </div>
                </div>
                <audio src={r.url} controls className="w-full" style={{ height: '32px' }} />
                <div className="flex items-center justify-between border-t border-slate-850/80 pt-2 text-[10px]">
                  <div className="flex gap-2 text-slate-550 font-mono">
                    <span>Span: {fmtDur(r.duration)}</span>
                    <span>·</span>
                    <span>Size: {fmtSize(r.size)}</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => downloadRecording(r)}
                      className="flex items-center gap-1 text-[11px] font-bold text-teal-400 hover:text-teal-350">
                      <Download size={12} /> Save
                    </button>
                    <button onClick={() => deleteRecording(r.id)}
                      className="flex items-center gap-1 text-[11px] font-bold text-rose-450 hover:text-rose-400">
                      <Trash2 size={12} /> Delete
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
