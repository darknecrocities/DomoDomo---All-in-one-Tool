import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { Music, Upload, Download, Check, ShieldAlert } from 'lucide-react';

export const Mp3WavTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [duration, setDuration] = useState<string>('');

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setSuccess(false);
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      
      // Decode source audio (supports mp3, wav, ogg, etc.)
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setDuration(audioBuffer.duration.toFixed(1) + ' seconds');

      // Encode AudioBuffer to WAV format locally
      const wavBlob = audioBufferToWav(audioBuffer);

      triggerBlobDownload(
        wavBlob,
        `${file.name.replace(/\.[^/.]+$/, "")}_converted.wav`
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Error decoding or converting audio stream. Ensure it is a valid audio file.');
    } finally {
      setLoading(false);
    }
  };

  // Binary WAV Encoder Helper
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // raw PCM
    const bitDepth = 16;
    
    let result;
    if (numOfChan === 2) {
      result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
    } else {
      result = buffer.getChannelData(0);
    }
    
    const bufferLength = result.length * 2;
    const arrayBuffer = new ArrayBuffer(44 + bufferLength);
    const view = new DataView(arrayBuffer);
    
    // Write RIFF identifier
    writeString(view, 0, 'RIFF');
    // File length minus RIFF identifier length (8)
    view.setUint32(4, 36 + bufferLength, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // Format chunk identifier
    writeString(view, 12, 'fmt ');
    // Format chunk length
    view.setUint32(16, 16, true);
    // Sample format (raw PCM = 1)
    view.setUint16(20, format, true);
    // Channel count
    view.setUint16(22, numOfChan, true);
    // Sample rate
    view.setUint32(24, sampleRate, true);
    // Byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * numOfChan * (bitDepth / 8), true);
    // Block align (channel count * bytes per sample)
    view.setUint16(32, numOfChan * (bitDepth / 8), true);
    // Bits per sample
    view.setUint16(34, bitDepth, true);
    // Data chunk identifier
    writeString(view, 36, 'data');
    // Data chunk length
    view.setUint32(40, bufferLength, true);
    
    // Write PCM audio samples
    floatTo16BitPCM(view, 44, result);
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  const interleave = (inputL: Float32Array, inputR: Float32Array): Float32Array => {
    const length = inputL.length + inputR.length;
    const result = new Float32Array(length);
    
    let index = 0;
    let inputIndex = 0;
    
    while (index < length) {
      result[index++] = inputL[inputIndex];
      result[index++] = inputR[inputIndex];
      inputIndex++;
    }
    return result;
  };

  const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Editor Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 min-h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Music className="text-[#4E8E5E]" size={22} />
              <span>MP3 ↔ WAV Transcoder</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Decodes audio streams offline</span>
          </div>

          {!file ? (
            <div className="border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-950/20 text-center flex flex-col items-center gap-3">
              <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
                <Upload size={32} />
              </div>
              <label className="btn-primary cursor-pointer mt-1">
                <span>Choose Audio File</span>
                <input
                  type="file"
                  accept="audio/mp3, audio/wav, audio/mpeg, audio/ogg"
                  onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <p className="text-slate-500 text-xs">Supports MP3, WAV, OGG, and AAC files</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center bg-slate-900/30 p-3 rounded-xl border border-slate-850 text-xs">
                <div className="flex items-center gap-2">
                  <Music className="text-[#4E8E5E]" size={20} />
                  <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button onClick={() => { setFile(null); setDuration(''); }} className="text-rose-455 hover:underline font-bold">Remove</button>
              </div>

              {duration && (
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 text-xs text-slate-350">
                  🎵 Decoded Stream Duration: <b>{duration}</b>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Control panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">PCM conversion</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pipes audio samples through the browser Audio Context parser, and encodes raw 16-bit linear PCM WAV formats.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleConvert}
              disabled={!file || loading}
              className="btn-primary w-full py-3"
            >
              {success ? <Check size={18} /> : <Download size={18} />}
              <span>{loading ? 'Decoding samples...' : success ? 'WAV Saved!' : 'Convert to WAV'}</span>
            </button>
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Offline Audio Processing</span>
            <span className="text-[10px] leading-relaxed">Audio buffer samplings map entirely in RAM, without uploading streams to servers.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
