import { useState } from 'react';
import { Sparkles, Image as ImageIcon, Loader2, Copy, Check } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';

export const AICaptionTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // Image analysis metrics
  const [metrics, setMetrics] = useState<{
    brightness: string;
    colors: string;
    aspectRatio: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setCaption('');
    setMetrics(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      analyzeImage(event.target?.result as string);
    };
    reader.readAsDataURL(selected);
  };

  // Extract pixel-level metrics locally via HTML5 Canvas
  const analyzeImage = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Downsample for speed
      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);

      const imgData = ctx.getImageData(0, 0, 50, 50);
      const data = imgData.data;

      let rSum = 0, gSum = 0, bSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        rSum += data[i];
        gSum += data[i + 1];
        bSum += data[i + 2];
      }

      const pixelCount = data.length / 4;
      const rAvg = rSum / pixelCount;
      const gAvg = gSum / pixelCount;
      const bAvg = bSum / pixelCount;

      // Estimate brightness
      const brightnessVal = 0.299 * rAvg + 0.587 * gAvg + 0.114 * bAvg;
      const brightness = brightnessVal > 180 ? 'Light/Bright' : brightnessVal < 80 ? 'Dark/Moody' : 'Medium lighting';

      // Estimate dominant color tone
      let colors = 'Neutral/Grayscale';
      if (Math.abs(rAvg - gAvg) > 10 || Math.abs(gAvg - bAvg) > 10) {
        if (rAvg > gAvg && rAvg > bAvg) colors = 'Warm tones (Red/Orange/Peach)';
        else if (gAvg > rAvg && gAvg > bAvg) colors = 'Natural tones (Green/Olive/Earth)';
        else if (bAvg > rAvg && bAvg > gAvg) colors = 'Cool tones (Blue/Cyan/Indigo)';
        else if (Math.abs(rAvg - gAvg) < 15 && rAvg > bAvg) colors = 'Warm golden tones';
      }

      // Aspect ratio
      const ratio = img.width / img.height;
      const aspectRatio = ratio > 1.2 ? 'Landscape' : ratio < 0.8 ? 'Portrait' : 'Square';

      setMetrics({ brightness, colors, aspectRatio });
    };
    img.src = dataUrl;
  };

  const handleGenerateCaption = async () => {
    if (!file || !metrics) return;
    setLoading(true);
    setStatusMsg('Initializing LLM...');

    try {
      const prompt = `<|im_start|>system\nYou are an artistic visual describer. Write a single elegant, poetic sentence describing the image based on its properties. Keep it to one sentence.<|im_end|>\n<|im_start|>user\nWrite a caption for a file named "${file.name}" with the following characteristics:\n- Layout/Aspect Ratio: ${metrics.aspectRatio}\n- Lighting: ${metrics.brightness}\n- Dominant Tones: ${metrics.colors}\n<|im_end|>\n<|im_start|>assistant\n`;

      const result = await aiService.generateText(prompt, 60, (status, prog) => {
        setStatusMsg(status);
        setProgress(prog);
      });

      let cleanCaption = result;
      const lastAss = result.lastIndexOf('<|im_start|>assistant');
      if (lastAss !== -1) {
        cleanCaption = result.substring(lastAss + 21);
      }
      cleanCaption = cleanCaption
        .replace(/<\|im_end\|>/g, '')
        .replace(/<\|im_start\|>/g, '')
        .trim();

      setCaption(cleanCaption || 'A beautiful photography composition capturing refined local visual dimensions.');
    } catch (err: any) {
      setCaption(`Error generating caption: ${err.message || err}`);
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="max-w-xl mx-auto glass-card p-6 flex flex-col gap-5 text-left">
      <div className="flex justify-between items-center border-b border-slate-850 pb-3">
        <h3 className="font-bold text-teal-400 flex items-center gap-2 text-base">
          <ImageIcon size={18} />
          <span>Local Image Caption Generator</span>
        </h3>
        <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded border border-slate-750">
          Canvas Analyzer + Qwen LLM
        </span>
      </div>

      {/* File Upload Section */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400">Select Image</label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="flex-1 bg-slate-900 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
          />
        </div>
      </div>

      {imagePreview && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
          <div className="flex items-center justify-center border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60 max-h-40">
            <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain" />
          </div>

          {metrics && (
            <div className="flex flex-col gap-2 justify-center text-xs">
              <div className="font-semibold text-slate-300 pb-1 border-b border-slate-800">Visual Metrics</div>
              <div className="flex justify-between py-0.5"><span className="text-slate-400">Layout:</span> <span className="text-slate-200">{metrics.aspectRatio}</span></div>
              <div className="flex justify-between py-0.5"><span className="text-slate-400">Lighting:</span> <span className="text-slate-200">{metrics.brightness}</span></div>
              <div className="flex justify-between py-0.5"><span className="text-slate-400">Color Profile:</span> <span className="text-slate-200 truncate pl-2 max-w-[150px]">{metrics.colors}</span></div>
            </div>
          )}
        </div>
      )}

      {file && metrics && (
        <button
          onClick={handleGenerateCaption}
          disabled={loading}
          className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>{statusMsg || 'Generating...'} {progress > 0 ? `(${progress}%)` : ''}</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Generate Creative Caption</span>
            </>
          )}
        </button>
      )}

      {caption && (
        <div className="bg-slate-900/80 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">AI Generated Caption</span>
            <button
              onClick={() => handleTextCopy(caption, setCopied)}
              className="text-slate-400 hover:text-slate-200 p-1"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          </div>
          <p className="text-xs text-slate-300 italic leading-relaxed text-center">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
};
