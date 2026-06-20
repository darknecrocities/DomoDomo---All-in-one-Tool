import { useState, useRef, useEffect } from 'react';
import { Eye, FileText, Loader2, Copy, Check, Sparkles, RefreshCw, Layers, Code, Download } from 'lucide-react';
import { handleTextCopy, triggerTextDownload } from '../../utils/sharedHelpers';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';
import { aiService } from '../../utils/aiService';

export const AIOCRAssistantTool = () => {
  const [imagePreview, setImagePreview] = useState<string>('');
  const [extractedText, setExtractedText] = useState('');
  const [refinedText, setRefinedText] = useState('');
  const [refinedJson, setRefinedJson] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [progressPct, setProgressPct] = useState(0);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedRefined, setCopiedRefined] = useState(false);

  // Model settings panel configs
  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are an expert text editor. Clean up OCR noise, preserve formatting, and format key-value pairs.');
  const [temperature, setTemperature] = useState(0.4);
  const [maxTokens, setMaxTokens] = useState(150);

  // Expanded UI states
  const [ocrLanguage, setOcrLanguage] = useState('eng');
  const [rotation, setRotation] = useState<number>(0);
  const [binarize, setBinarize] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [invert, setInvert] = useState(false);

  // Metrics & Entities
  const [metrics, setMetrics] = useState<{ words: number; sentences: number; readTime: string } | null>(null);
  const [entities, setEntities] = useState<{ emails: string[]; phones: string[]; urls: string[] }>({ emails: [], phones: [], urls: [] });
  const [ocrConfidence, setOcrConfidence] = useState<number | null>(null);


  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Redraw processed canvas preview when filters change
  useEffect(() => {
    if (!imagePreview) return;
    const img = new Image();
    img.onload = () => {
      drawCanvas(img);
    };
    img.src = imagePreview;
  }, [imagePreview, rotation, binarize, contrast, invert]);

  const drawCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (rotation === 90 || rotation === 270) {
      canvas.width = img.height;
      canvas.height = img.width;
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    // Apply rotation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Apply filters
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      if (contrast) {
        r = Math.min(255, Math.max(0, (r - 128) * 1.5 + 128));
        g = Math.min(255, Math.max(0, (g - 128) * 1.5 + 128));
        b = Math.min(255, Math.max(0, (b - 128) * 1.5 + 128));
      }

      if (binarize) {
        const v = 0.299 * r + 0.587 * g + 0.114 * b;
        const binary = v > 128 ? 255 : 0;
        r = g = b = binary;
      }

      if (invert) {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    ctx.putImageData(imgData, 0, 0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setExtractedText('');
    setRefinedText('');
    setRefinedJson('');
    setOcrConfidence(null);
    setMetrics(null);
    setEntities({ emails: [], phones: [], urls: [] });
    setRotation(0);
    setBinarize(false);
    setContrast(false);
    setInvert(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(selected);
  };

  const handleRunOCR = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoading(true);
    setProgressMsg('Loading Tesseract.js OCR engine...');
    setProgressPct(10);

    try {
      const ocrModuleUrl = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/tesseract.esm.min.js';
      const { createWorker } = await import(/* @vite-ignore */ ocrModuleUrl);

      const worker = await createWorker(ocrLanguage, 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setProgressMsg('Recognizing text characters...');
            setProgressPct(Math.round(m.progress * 100));
          } else {
            setProgressMsg(m.status || 'Loading weights...');
          }
        }
      });

      // Transcribe directly from the visual canvas (with rotation/binarization/contrast)
      const dataUrl = canvas.toDataURL('image/png');
      const ret = await worker.recognize(dataUrl);
      const text = ret.data.text || '';
      
      setExtractedText(text || 'No readable text found in image.');
      setOcrConfidence(ret.data.confidence || 0);

      // Extract entities using regex Heuristics
      const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      const phones = text.match(/(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g) || [];
      const urls = text.match(/https?:\/\/[^\s$.?#].[^\s]*/g) || [];
      setEntities({ emails, phones, urls });

      // Compute statistics
      const words = text.split(/\s+/).filter(Boolean).length;
      const sentences = text.split(/[.!?]+/).filter(Boolean).length;
      const readTime = words > 0 ? `${Math.ceil(words / 200)} min` : '0 min';
      setMetrics({ words, sentences, readTime });

      await worker.terminate();

    } catch (err: any) {
      setExtractedText(`OCR Error: ${err.message || err}`);
    } finally {
      setLoading(false);
      setProgressMsg('');
      setProgressPct(0);
    }
  };

  // Typo fixer LLM corrector
  const handleRefineText = async () => {
    if (!extractedText.trim()) return;
    setRefining(true);
    setProgressMsg('Refining OCR output via LLM...');

    try {
      const prompt = `Clean up spelling typos, fix word boundaries, formatting errors, and rebuild correct spacing for this OCR text:
"${extractedText}"

Output only the cleaned and polished text document.`;

      const result = await aiService.generateText(prompt, maxTokens, () => {}, selectedModel || undefined, {
        systemPrompt,
        temperature
      });
      setRefinedText(result.trim());
    } catch (err: any) {
      setRefinedText(`Refine Error: ${err.message || err}`);
    } finally {
      setRefining(false);
      setProgressMsg('');
    }
  };

  // Convert parsed document text to structured JSON schema
  const handleConvertJson = async () => {
    if (!extractedText.trim()) return;
    setRefining(true);
    setProgressMsg('Formatting text to JSON...');

    try {
      const prompt = `Structure the following document text into a raw valid JSON object. Extract names, addresses, amounts, dates, list items, and main values:
"${extractedText}"

Provide ONLY valid JSON. Do not write markdown tags or preambles.`;

      const result = await aiService.generateText(prompt, maxTokens, () => {}, selectedModel || undefined, {
        systemPrompt: 'You are a strict data formatting assistant. Output raw JSON object structures.',
        temperature: 0.1
      });
      setRefinedJson(result.trim());
    } catch (err: any) {
      setRefinedJson(`JSON Error: ${err.message || err}`);
    } finally {
      setRefining(false);
      setProgressMsg('');
    }
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
            <Eye size={18} />
            <span>Local OCR Text Assistant</span>
          </h3>
        </div>

        {/* Upload & OCR Language row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400">Select File</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="bg-slate-900 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-350 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400">Tesseract OCR Language</label>
            <select
              value={ocrLanguage}
              onChange={(e) => setOcrLanguage(e.target.value)}
              className="bg-slate-900 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="eng">English (eng)</option>
              <option value="spa">Spanish (spa)</option>
              <option value="fra">French (fra)</option>
              <option value="deu">German (deu)</option>
              <option value="jpn">Japanese (jpn)</option>
            </select>
          </div>
        </div>

        {imagePreview && (
          <div className="flex flex-col gap-3.5 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
            {/* Visual Canvas editor */}
            <div className="flex items-center justify-center border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60 max-h-48">
              <canvas ref={canvasRef} className="max-h-full max-w-full object-contain rounded" />
            </div>

            {/* Custom Preprocessing Filters & Rotation */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-850/60 pt-2.5">
              <div className="flex gap-2.5">
                <button
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="bg-slate-900 hover:text-teal-400 border border-slate-800 rounded px-2.5 py-1 flex items-center gap-1.5 font-medium"
                >
                  <RefreshCw size={12} />
                  <span>Rotate ({rotation}°)</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-3.5 font-semibold text-slate-450">
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={binarize}
                    onChange={(e) => setBinarize(e.target.checked)}
                    className="accent-teal-500"
                  />
                  <span>B&W Binarize</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={contrast}
                    onChange={(e) => setContrast(e.target.checked)}
                    className="accent-teal-500"
                  />
                  <span>Boost Contrast</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={invert}
                    onChange={(e) => setInvert(e.target.checked)}
                    className="accent-teal-500"
                  />
                  <span>Invert Colors</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {imagePreview && (
          <button
            onClick={handleRunOCR}
            disabled={loading}
            className="btn-primary py-2.5 text-xs flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin text-teal-400" />
                <span>{progressMsg} {progressPct > 0 ? `(${progressPct}%)` : ''}</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Run Character Transcription</span>
              </>
            )}
          </button>
        )}

        {/* Text metrics & Confidence Rating */}
        {ocrConfidence !== null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-850 text-xs text-slate-400">
            <div className="flex justify-between sm:flex-col"><span className="text-[10px] uppercase font-bold text-slate-500">Confidence</span> <span className={`font-bold ${ocrConfidence > 80 ? 'text-green-400' : ocrConfidence > 50 ? 'text-amber-400' : 'text-red-400'}`}>{ocrConfidence}%</span></div>
            {metrics && (
              <>
                <div className="flex justify-between sm:flex-col"><span className="text-[10px] uppercase font-bold text-slate-500">Words count</span> <span className="text-slate-200 font-semibold">{metrics.words}</span></div>
                <div className="flex justify-between sm:flex-col"><span className="text-[10px] uppercase font-bold text-slate-500">Sentences</span> <span className="text-slate-200 font-semibold">{metrics.sentences}</span></div>
                <div className="flex justify-between sm:flex-col"><span className="text-[10px] uppercase font-bold text-slate-500">Est. Read Time</span> <span className="text-slate-200 font-semibold">{metrics.readTime}</span></div>
              </>
            )}
          </div>
        )}

        {/* Actionable Entity Extractions */}
        {(entities.emails.length > 0 || entities.phones.length > 0 || entities.urls.length > 0) && (
          <div className="bg-slate-950/60 border border-slate-900 rounded-lg p-3 text-xs flex flex-col gap-2">
            <span className="font-semibold text-slate-400 flex items-center gap-1.5"><Layers size={13} className="text-teal-400" /> Extracted Entities</span>
            {entities.emails.length > 0 && <div className="flex flex-wrap gap-1.5"><span className="text-slate-500 font-mono">Emails:</span>{entities.emails.map((e, idx) => <span key={idx} className="bg-teal-950/20 text-teal-400 border border-teal-900/30 px-2 py-0.5 rounded">{e}</span>)}</div>}
            {entities.phones.length > 0 && <div className="flex flex-wrap gap-1.5"><span className="text-slate-500 font-mono">Phones:</span>{entities.phones.map((p, idx) => <span key={idx} className="bg-indigo-950/20 text-indigo-400 border border-indigo-900/30 px-2 py-0.5 rounded">{p}</span>)}</div>}
            {entities.urls.length > 0 && <div className="flex flex-wrap gap-1.5"><span className="text-slate-500 font-mono">Links:</span>{entities.urls.map((u, idx) => <a href={u} target="_blank" rel="noreferrer" key={idx} className="bg-blue-950/20 text-blue-400 border border-blue-900/30 px-2 py-0.5 rounded hover:underline truncate max-w-[200px]">{u}</a>)}</div>}
          </div>
        )}

        {/* Text views */}
        {extractedText && (
          <div className="flex flex-col gap-4 border-t border-slate-850 pt-4">
            {/* Raw transcribed view */}
            <div className="flex flex-col gap-2 animate-fadeIn">
              <div className="flex justify-between items-center pb-1">
                <label className="text-xs font-semibold text-slate-400 font-mono flex items-center gap-1.5">
                  <FileText size={13} className="text-teal-400" />
                  <span>Raw Extracted Text</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTextCopy(extractedText, setCopiedRaw)}
                    className="text-slate-400 hover:text-slate-200 p-1 flex items-center gap-1 text-[10px]"
                  >
                    {copiedRaw ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => triggerTextDownload(extractedText, 'extracted-ocr.txt')}
                    className="text-slate-450 hover:text-slate-350 p-1 text-[10px]"
                  >
                    Download (.txt)
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={extractedText}
                className="w-full h-32 bg-slate-900/50 border border-slate-850 rounded-lg p-3 text-xs text-slate-350 focus:outline-none font-mono resize-none leading-relaxed"
              />
            </div>

            {/* AI refinement triggers */}
            <div className="grid grid-cols-2 gap-3.5">
              <button
                onClick={handleRefineText}
                disabled={refining}
                className="bg-slate-900 border border-slate-800 hover:text-teal-400 text-slate-300 font-semibold p-2 rounded text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                {refining ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>Fix Spelling & Grammar</span>
              </button>

              <button
                onClick={handleConvertJson}
                disabled={refining}
                className="bg-slate-900 border border-slate-800 hover:text-teal-400 text-slate-300 font-semibold p-2 rounded text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                {refining ? <Loader2 size={13} className="animate-spin" /> : <Code size={13} />}
                <span>Structure to JSON</span>
              </button>
            </div>

            {/* Refined Text View */}
            {refinedText && (
              <div className="flex flex-col gap-2 bg-slate-900/40 p-4 border border-slate-850 rounded-xl animate-fadeIn">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={11} /> Cleaned AI Output
                  </span>
                  <button
                    onClick={() => handleTextCopy(refinedText, setCopiedRefined)}
                    className="text-slate-400 hover:text-slate-200 p-1 flex items-center gap-1 text-[10px]"
                  >
                    {copiedRefined ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    <span>Copy Cleaned</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap mt-2">
                  {refinedText}
                </p>
              </div>
            )}

            {/* Structured JSON View */}
            {refinedJson && (
              <div className="flex flex-col gap-2 bg-slate-900/40 p-4 border border-slate-850 rounded-xl animate-fadeIn">
                <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
                  <span className="text-[10px] font-mono text-teal-400 uppercase tracking-wider flex items-center gap-1">
                    <Code size={11} /> Extracted JSON Object
                  </span>
                  <button
                    onClick={() => triggerTextDownload(refinedJson, 'document-schema.json')}
                    className="text-teal-400 hover:text-teal-350 p-1 flex items-center gap-1 text-[10px] font-medium"
                  >
                    <Download size={12} />
                    <span>Download JSON</span>
                  </button>
                </div>
                <pre className="bg-slate-950/80 border border-slate-800 p-2.5 rounded text-[10px] font-mono text-teal-300 overflow-x-auto mt-2">
                  <code>{refinedJson}</code>
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
