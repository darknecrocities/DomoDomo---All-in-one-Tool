import { useState } from 'react';
import { Sparkles, Image as ImageIcon, Loader2, Copy, Check, Palette, Clock, Download } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

interface HistoryItem {
  filename: string;
  caption: string;
  tone: string;
  timestamp: string;
}

export const AICaptionTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // Model selection configuration settings
  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a creative social media manager. Respond only with the image caption, no extra text.');
  const [temperature, setTemperature] = useState(0.8);
  const [maxTokens, setMaxTokens] = useState(100);

  // Expanded caption controls
  const [tone, setTone] = useState('poetic');
  const [extraInstructions, setExtraInstructions] = useState('');
  const [maxWords, setMaxWords] = useState(30);
  const [palette, setPalette] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [metrics, setMetrics] = useState<{
    brightness: string;
    colors: string;
    aspectRatio: string;
    contrast: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setCaption('');
    setHashtags([]);
    setMetrics(null);
    setPalette([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      analyzeImage(event.target?.result as string);
    };
    reader.readAsDataURL(selected);
  };

  // Canvas processing & analysis
  const analyzeImage = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);

      const imgData = ctx.getImageData(0, 0, 50, 50);
      const data = imgData.data;

      let rSum = 0, gSum = 0, bSum = 0;
      let minVal = 255, maxVal = 0;

      // Extract colors at grid points
      const colorsList: string[] = [];
      const gridCoords = [
        { x: 10, y: 10 },
        { x: 35, y: 10 },
        { x: 25, y: 25 },
        { x: 15, y: 40 },
        { x: 40, y: 40 }
      ];

      gridCoords.forEach(c => {
        const idx = (c.y * 50 + c.x) * 4;
        const r = data[idx];
        const g = data[idx+1];
        const b = data[idx+2];
        const hex = '#' + [r, g, b].map(v => {
          const str = v.toString(16);
          return str.length === 1 ? '0' + str : str;
        }).join('');
        colorsList.push(hex);
      });
      setPalette(colorsList);

      for (let i = 0; i < data.length; i += 4) {
        rSum += data[i];
        gSum += data[i + 1];
        bSum += data[i + 2];
        
        const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (brightness < minVal) minVal = brightness;
        if (brightness > maxVal) maxVal = brightness;
      }

      const pixelCount = data.length / 4;
      const rAvg = rSum / pixelCount;
      const gAvg = gSum / pixelCount;
      const bAvg = bSum / pixelCount;

      const brightnessVal = 0.299 * rAvg + 0.587 * gAvg + 0.114 * bAvg;
      const brightness = brightnessVal > 175 ? 'Bright/Overexposed' : brightnessVal < 70 ? 'Dark/Moody' : 'Balanced Exposure';

      // Simple contrast calculation
      const contrastVal = maxVal - minVal;
      const contrast = contrastVal > 180 ? 'High Contrast' : contrastVal < 75 ? 'Low Contrast/Flat' : 'Standard Contrast';

      let colors = 'Neutral/Grayscale';
      if (Math.abs(rAvg - gAvg) > 8 || Math.abs(gAvg - bAvg) > 8) {
        if (rAvg > gAvg && rAvg > bAvg) colors = 'Warm tones (Red/Orange/Peach)';
        else if (gAvg > rAvg && gAvg > bAvg) colors = 'Natural tones (Green/Olive/Earth)';
        else if (bAvg > rAvg && bAvg > gAvg) colors = 'Cool tones (Blue/Cyan/Indigo)';
        else if (Math.abs(rAvg - gAvg) < 15 && rAvg > bAvg) colors = 'Warm golden tones';
      }

      const ratio = img.width / img.height;
      const aspectRatio = ratio > 1.25 ? 'Landscape' : ratio < 0.75 ? 'Portrait' : 'Square';

      setMetrics({ brightness, colors, aspectRatio, contrast });
    };
    img.src = dataUrl;
  };

  const handleGenerateCaption = async () => {
    if (!file || !metrics) return;
    setLoading(true);
    setStatusMsg('Initializing LLM...');

    try {
      const prompt = `Write a caption for the image "${file.name}".
Aspect Ratio: ${metrics.aspectRatio}.
Lighting: ${metrics.brightness}.
Contrast: ${metrics.contrast}.
Dominant Colors: ${metrics.colors}.
Desired Tone: ${tone}.
Maximum Word Length: ${maxWords}.
${extraInstructions ? `Custom User Guide: "${extraInstructions}"` : ''}

Generate only the caption text. Do not write placeholders or explanations.`;

      const result = await aiService.generateText(prompt, maxTokens, (status, prog) => {
        setStatusMsg(status);
        setProgress(prog);
      }, selectedModel || undefined, {
        systemPrompt,
        temperature
      });

      const cleanCaption = result.trim() || 'A beautiful photography composition capturing refined local visual dimensions.';
      setCaption(cleanCaption);

      // Generate hashtags using local rule
      const tags = ['photography', tone, metrics.aspectRatio.toLowerCase(), metrics.brightness.split('/')[0].toLowerCase(), 'offline']
        .filter(Boolean)
        .map(t => `#${t.replace(/\s+/g, '')}`);
      setHashtags(tags);

      // Add to local history log
      setHistory(prev => [
        {
          filename: file.name,
          caption: cleanCaption,
          tone,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev.slice(0, 4) // cap history at 5 items
      ]);

    } catch (err: any) {
      setCaption(`Error generating caption: ${err.message || err}`);
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  // Text overlay canvas drawer & downloader
  const handleDownloadWithOverlay = () => {
    if (!imagePreview || !caption) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const pad = Math.max(10, Math.round(img.width * 0.04));
      const fontSize = Math.max(10, Math.round(img.width * 0.03));
      
      ctx.font = `italic ${fontSize}px sans-serif`;
      ctx.textBaseline = 'bottom';
      
      // Draw background bar
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, img.height - (pad * 2 + fontSize), img.width, pad * 2 + fontSize);

      // Draw text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(caption, img.width / 2, img.height - pad);

      const link = document.createElement('a');
      link.download = `captioned-${file?.name || 'image'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = imagePreview;
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-4 text-left">
      {/* Settings control panel */}
      <LocalAIConfigPanel
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        temperature={temperature}
        onTemperatureChange={setTemperature}
        maxTokens={maxTokens}
        onMaxTokensChange={setMaxTokens}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      <div className="glass-card p-6 flex flex-col gap-5">
        <div className="flex justify-between items-center border-b border-slate-850 pb-3">
          <h3 className="font-bold text-teal-400 flex items-center gap-2 text-base">
            <ImageIcon size={18} />
            <span>Local Image Caption Generator</span>
          </h3>
        </div>

        {/* File Upload Section */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400">Select Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full bg-slate-900 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-350 focus:outline-none"
          />
        </div>

        {imagePreview && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
            <div className="flex items-center justify-center border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60 max-h-44 relative">
              <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain" />
            </div>

            {/* Metrics column */}
            <div className="flex flex-col gap-2.5 justify-center text-xs">
              <div className="font-semibold text-slate-300 pb-1 border-b border-slate-800">Visual Metrics</div>
              {metrics && (
                <>
                  <div className="flex justify-between py-0.5"><span className="text-slate-400">Layout:</span> <span className="text-slate-200">{metrics.aspectRatio}</span></div>
                  <div className="flex justify-between py-0.5"><span className="text-slate-400">Lighting:</span> <span className="text-slate-200">{metrics.brightness}</span></div>
                  <div className="flex justify-between py-0.5"><span className="text-slate-400">Contrast:</span> <span className="text-slate-200">{metrics.contrast}</span></div>
                </>
              )}

              {/* Dominant Color Palette */}
              {palette.length > 0 && (
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Palette size={11} className="text-teal-400" /> Palette Swatches:
                  </span>
                  <div className="flex gap-1.5 mt-0.5">
                    {palette.map((c, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-md border border-slate-850 cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: c }}
                        title={c}
                        onClick={() => handleTextCopy(c, () => {})}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {file && metrics && (
          <div className="flex flex-col gap-4 border-t border-slate-850 pt-3.5">
            {/* Tuning settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Tone selection */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-400">Caption Style / Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="poetic">Poetic & Artistic</option>
                  <option value="hype">Energetic / Hype</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="funny">Witty / Humorous</option>
                  <option value="professional">Professional / Corporate</option>
                </select>
              </div>

              {/* Length constraint */}
              <div className="flex flex-col gap-1.5 justify-center">
                <div className="flex justify-between font-semibold text-slate-450">
                  <span>Max Word Count</span>
                  <span className="font-mono text-slate-350 bg-slate-900 px-1.5 rounded">{maxWords} words</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="5"
                  value={maxWords}
                  onChange={(e) => setMaxWords(parseInt(e.target.value))}
                  className="w-full accent-teal-500 bg-slate-900 h-1 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Custom Prompt Instructions */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-450">Target Theme / Extras (Optional)</label>
              <input
                type="text"
                value={extraInstructions}
                onChange={(e) => setExtraInstructions(e.target.value)}
                placeholder="e.g. Focus on coffee mug, make it feel adventurous..."
                className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              onClick={handleGenerateCaption}
              disabled={loading}
              className="btn-primary w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{statusMsg || 'Generating...'} {progress > 0 ? `(${progress}%)` : ''}</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Generate Custom Caption</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Output Area */}
        {caption && (
          <div className="bg-slate-900/80 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">AI Generated Output</span>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadWithOverlay}
                  className="text-teal-400 hover:text-teal-350 p-1 flex items-center gap-1 text-[10px] font-medium"
                  title="Download Image with Caption text overlayed at the bottom"
                >
                  <Download size={13} />
                  <span>Export Overlay PNG</span>
                </button>
                <button
                  onClick={() => handleTextCopy(caption, () => setCopied(true))}
                  className="text-slate-400 hover:text-slate-200 p-1"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-350 italic leading-relaxed text-center">
              "{caption}"
            </p>

            {/* Generated Hashtags */}
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center mt-1 pt-2 border-t border-slate-850/50">
                {hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold bg-teal-950/40 text-teal-400 border border-teal-900/35 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Panel */}
        {history.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-slate-850 pt-4">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Clock size={11} /> Generation Logs
            </span>
            <div className="flex flex-col gap-1.5">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="bg-slate-950/30 border border-slate-900 rounded p-2 text-[10px] flex justify-between items-center gap-4 hover:border-slate-800 transition-colors"
                >
                  <div className="flex flex-col text-slate-400 truncate">
                    <span className="text-slate-350 truncate">"{h.caption}"</span>
                    <span className="text-slate-500 text-[8px] mt-0.5">Style: {h.tone} | File: {h.filename}</span>
                  </div>
                  <span className="text-slate-500 text-[9px] whitespace-nowrap">{h.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
