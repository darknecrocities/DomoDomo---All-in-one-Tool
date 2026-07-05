import { useState, useMemo } from 'react';
import { Sliders, Copy, Check, Play, Square, Circle } from 'lucide-react';

interface KeyframeProperties {
  rotate: number;
  scale: number;
  translateX: number;
  translateY: number;
  skewX: number;
  opacity: number;
  blur: number;
  color: string;
}

export const CSSKeyframeAnimatorTool = () => {
  const [keyframes, setKeyframes] = useState<Record<number, KeyframeProperties>>({
    0: { rotate: 0, scale: 1, translateX: 0, translateY: 0, skewX: 0, opacity: 1, blur: 0, color: '#3C6B4D' },
    50: { rotate: 180, scale: 1.5, translateX: 50, translateY: -30, skewX: 10, opacity: 0.8, blur: 4, color: '#D97706' },
    100: { rotate: 360, scale: 1, translateX: 0, translateY: 0, skewX: 0, opacity: 1, blur: 0, color: '#3C6B4D' }
  });
  
  const [activePercent, setActivePercent] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [duration, setDuration] = useState<number>(3); // seconds
  const [previewShape, setPreviewShape] = useState<'square' | 'circle'>('circle');
  const [copied, setCopied] = useState<boolean>(false);
  const [easingPreset, setEasingPreset] = useState<string>('ease-in-out');

  // Easing presets details
  const easingValues: Record<string, string> = {
    linear: 'linear',
    ease: 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
    bezier: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
  };

  const selectedProperties = keyframes[activePercent] || {
    rotate: 0, scale: 1, translateX: 0, translateY: 0, skewX: 0, opacity: 1, blur: 0, color: '#3C6B4D'
  };

  const handleUpdateProperty = (prop: keyof KeyframeProperties, value: any) => {
    setKeyframes(prev => ({
      ...prev,
      [activePercent]: {
        ...prev[activePercent],
        [prop]: value
      }
    }));
  };

  const handleAddKeyframe = (pct: number) => {
    if (keyframes[pct]) {
      setActivePercent(pct);
      return;
    }
    // Interpolate or duplicate closest keyframe values
    const sortedPct = Object.keys(keyframes).map(Number).sort((a,b) => a-b);
    let basePct = 50;
    for (let i = 0; i < sortedPct.length; i++) {
      if (sortedPct[i] <= pct) basePct = sortedPct[i];
    }
    setKeyframes(prev => ({
      ...prev,
      [pct]: { ...prev[basePct] }
    }));
    setActivePercent(pct);
  };

  const handleRemoveKeyframe = (pct: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pct === 0 || pct === 100) return; // keep bounds
    const next = { ...keyframes };
    delete next[pct];
    setKeyframes(next);
    setActivePercent(0);
  };

  // Generate CSS animations code dynamically
  const generatedKeyframesCode = useMemo(() => {
    const sortedPct = Object.keys(keyframes).map(Number).sort((a,b) => a-b);
    const rules = sortedPct.map(pct => {
      const k = keyframes[pct];
      return `  ${pct}% {
    transform: translate(${k.translateX}px, ${k.translateY}px) rotate(${k.rotate}deg) scale(${k.scale}) skewX(${k.skewX}deg);
    opacity: ${k.opacity};
    filter: blur(${k.blur}px);
    background-color: ${k.color};
  }`;
    }).join('\n');

    return `@keyframes custom-animation {
${rules}
}`;
  }, [keyframes]);

  const generatedUsageCode = useMemo(() => {
    const easing = easingValues[easingPreset] || easingPreset;
    return `.animated-box {
  animation: custom-animation ${duration}s ${easing} infinite;
}`;
  }, [duration, easingPreset]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${generatedKeyframesCode}\n\n${generatedUsageCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Parameter controller */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-[#ECEBE9] border-b border-[#2A2D30] pb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><Sliders size={15} className="text-[#3C6B4D]" /> Keyframe Editor</span>
            <span className="text-[10px] bg-[#3C6B4D]/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">{activePercent}% Selected</span>
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Translate X ({selectedProperties.translateX}px)</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={selectedProperties.translateX}
                  onChange={(e) => handleUpdateProperty('translateX', Number(e.target.value))}
                  className="accent-[#3C6B4D] w-full"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Translate Y ({selectedProperties.translateY}px)</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={selectedProperties.translateY}
                  onChange={(e) => handleUpdateProperty('translateY', Number(e.target.value))}
                  className="accent-[#3C6B4D] w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Rotate ({selectedProperties.rotate}°)</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={selectedProperties.rotate}
                  onChange={(e) => handleUpdateProperty('rotate', Number(e.target.value))}
                  className="accent-[#3C6B4D] w-full"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Scale ({selectedProperties.scale}x)</label>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={selectedProperties.scale}
                  onChange={(e) => handleUpdateProperty('scale', Number(e.target.value))}
                  className="accent-[#3C6B4D] w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Opacity ({selectedProperties.opacity})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={selectedProperties.opacity}
                  onChange={(e) => handleUpdateProperty('opacity', Number(e.target.value))}
                  className="accent-[#3C6B4D] w-full"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Blur ({selectedProperties.blur}px)</label>
                <input
                  type="range"
                  min="0"
                  max="16"
                  value={selectedProperties.blur}
                  onChange={(e) => handleUpdateProperty('blur', Number(e.target.value))}
                  className="accent-[#3C6B4D] w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Skew X ({selectedProperties.skewX}°)</label>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={selectedProperties.skewX}
                  onChange={(e) => handleUpdateProperty('skewX', Number(e.target.value))}
                  className="accent-[#3C6B4D] w-full"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedProperties.color}
                    onChange={(e) => handleUpdateProperty('color', e.target.value)}
                    className="w-8 h-8 rounded border border-[#2A2D30] cursor-pointer bg-[#111213]"
                  />
                  <input
                    type="text"
                    value={selectedProperties.color}
                    onChange={(e) => handleUpdateProperty('color', e.target.value)}
                    className="flex-1 bg-[#111213] border border-[#2A2D30] rounded-xl px-2 py-1 text-xs text-[#ECEBE9] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#2A2D30] pt-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Animation Duration (s)</label>
                <input
                  type="number"
                  min="0.5"
                  max="15"
                  step="0.5"
                  value={duration}
                  onChange={(e) => setDuration(Math.max(0.1, Number(e.target.value)))}
                  className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9] focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-[#A3A09B] font-bold uppercase">Easing Preset</label>
                <select
                  value={easingPreset}
                  onChange={(e) => setEasingPreset(e.target.value)}
                  className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9] focus:outline-none"
                >
                  <option value="linear">Linear</option>
                  <option value="ease">Ease</option>
                  <option value="ease-in">Ease In</option>
                  <option value="ease-out">Ease Out</option>
                  <option value="ease-in-out">Ease In Out</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview box */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Visual timeline */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-sm font-extrabold text-[#ECEBE9] border-b border-[#2A2D30] pb-2 flex items-center gap-1.5">
            <Play size={14} className="text-[#3C6B4D]" />
            <span>Interactive Animation Timeline</span>
          </h3>

          <div className="relative h-12 bg-[#111213] rounded-xl border border-[#2A2D30] flex items-center px-4">
            {/* Timeline track line */}
            <div className="absolute left-4 right-4 h-1.5 bg-[#2A2D30]/65 rounded"></div>
            
            {/* Renders dynamic click ticks */}
            {Array.from({ length: 9 }).map((_, idx) => {
              const pct = idx * 12.5;
              const hasFrame = keyframes[pct] !== undefined;
              return (
                <div
                  key={idx}
                  onClick={() => handleAddKeyframe(pct)}
                  style={{ left: `calc(${pct}% * 0.92 + 12px)` }}
                  className={`absolute transform -translate-x-1/2 w-4 h-4 rounded-full cursor-pointer flex items-center justify-center transition-all ${
                    activePercent === pct 
                      ? 'bg-emerald-500 scale-125 z-20 border border-white' 
                      : (hasFrame ? 'bg-[#3C6B4D] border border-[#2A2D30] z-10' : 'bg-[#2A2D30] hover:bg-slate-700 w-2 h-2')
                  }`}
                  title={`${pct}% keyframe`}
                >
                  {hasFrame && pct !== 0 && pct !== 100 && (
                    <button
                      onClick={(e) => handleRemoveKeyframe(pct, e)}
                      className="absolute -top-6 text-[8px] bg-rose-950/80 text-rose-450 border border-rose-500/25 px-1 py-0.2 rounded hover:bg-rose-900"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-[10px] text-[#72706C] italic">Click on the timeline track ticks to edit, add, or toggle keyframe nodes.</span>
        </div>

        {/* Live rendering output box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card bg-[#18191B] p-6 border border-[#2A2D30] rounded-2xl flex flex-col gap-4 items-center justify-center relative min-h-[250px]">
            <span className="absolute top-4 left-4 text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">Live Preview Sandbox</span>
            
            {/* Action buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setPreviewShape(previewShape === 'square' ? 'circle' : 'square')}
                className="p-1 bg-[#111213] border border-[#2A2D30] hover:bg-[#1E2022] rounded-lg text-[#A3A09B] hover:text-[#ECEBE9] transition-colors"
                title="Toggle shape"
              >
                {previewShape === 'square' ? <Circle size={13} /> : <Square size={13} />}
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-1 border rounded-lg text-xs font-bold transition-colors ${
                  isPlaying ? 'bg-[#3C6B4D]/15 border-[#3C6B4D]/40 text-emerald-400' : 'bg-[#111213] border-[#2A2D30] text-[#A3A09B]'
                }`}
              >
                {isPlaying ? 'PAUSE' : 'PLAY'}
              </button>
            </div>

            {/* Simulated target box */}
            <div className="w-24 h-24 flex items-center justify-center">
              <style>
                {`
                  @keyframes live-animator {
                    ${Object.keys(keyframes).map(pct => {
                      const k = keyframes[Number(pct)];
                      return `  ${pct}% {
                        transform: translate(${k.translateX}px, ${k.translateY}px) rotate(${k.rotate}deg) scale(${k.scale}) skewX(${k.skewX}deg);
                        opacity: ${k.opacity};
                        filter: blur(${k.blur}px);
                        background-color: ${k.color};
                      }`;
                    }).join('\n')}
                  }
                  .live-preview-box {
                    animation: ${isPlaying ? `live-animator ${duration}s ${easingValues[easingPreset]} infinite` : 'none'};
                  }
                `}
              </style>
              <div
                style={{
                  backgroundColor: selectedProperties.color,
                  transform: !isPlaying ? `translate(${selectedProperties.translateX}px, ${selectedProperties.translateY}px) rotate(${selectedProperties.rotate}deg) scale(${selectedProperties.scale}) skewX(${selectedProperties.skewX}deg)` : undefined,
                  opacity: !isPlaying ? selectedProperties.opacity : undefined,
                  filter: !isPlaying ? `blur(${selectedProperties.blur}px)` : undefined,
                }}
                className={`live-preview-box w-16 h-16 transition-all duration-100 ${
                  previewShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                }`}
              ></div>
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2">
              <span className="text-[10px] text-[#A3A09B] font-bold uppercase tracking-wider">CSS Styles Export</span>
              <button
                onClick={handleCopy}
                className="py-1 px-3 bg-[#111213] hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded-lg text-xs font-bold border border-[#2A2D30] flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>Copy Code</span>
              </button>
            </div>
            
            <div className="flex-1 max-h-[190px] overflow-y-auto bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
              <pre className="text-[10px] font-mono text-[#E29E2D] leading-relaxed break-all select-all">
                {`${generatedKeyframesCode}\n\n${generatedUsageCode}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
