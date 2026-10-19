export interface GenerateWavParams {
  waveform: 'sine' | 'square' | 'sawtooth' | 'triangle';
  baseFreq: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  duration?: number;
}

export const generateSynthWavBuffer = ({
  waveform,
  baseFreq,
  attack,
  decay,
  sustain,
  release,
  duration = 1.0,
}: GenerateWavParams): ArrayBuffer => {
  const sampleRate = 44100;
  const totalDuration = duration + attack + decay + release;
  const numSamples = Math.floor(sampleRate * totalDuration);
  const buffer = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    if (waveform === 'sine') sample = Math.sin(2 * Math.PI * baseFreq * t);
    else if (waveform === 'square') sample = Math.sin(2 * Math.PI * baseFreq * t) >= 0 ? 0.7 : -0.7;
    else if (waveform === 'sawtooth') sample = 2 * (t * baseFreq - Math.floor(0.5 + t * baseFreq));
    else if (waveform === 'triangle') sample = 2 * Math.abs(2 * (t * baseFreq - Math.floor(0.5 + t * baseFreq))) - 1;

    let env = 0;
    if (t < attack) env = t / attack;
    else if (t < attack + decay) env = 1 - (1 - sustain) * ((t - attack) / decay);
    else env = Math.max(0, sustain * (1 - (t - attack - decay) / release));

    buffer[i] = sample * env * 0.7;
  }

  // Build 44-byte WAV Header + 16-bit PCM Audio Data
  const wavBuffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(wavBuffer);
  const writeString = (offset: number, str: string) => {
    for (let j = 0; j < str.length; j++) view.setUint8(offset + j, str.charCodeAt(j));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono channel
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); // 16-bit
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return wavBuffer;
};
