import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Cpu, Activity, CheckCircle2, ShieldAlert, Upload } from 'lucide-react';
import { aiService } from '../../../utils/aiService';

export const AIDeepfakeDetectionTool: React.FC = () => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchModels = async () => {
      const { status, models } = await aiService.checkOllama();
      if (status && models.length > 0) {
        setModels(models);
        // Default to a vision model like llava if it exists, otherwise use whatever is default
        const visionModel = models.find(m => m.includes('llava') || m.includes('vision'));
        if (visionModel) {
          setSelectedModel(visionModel);
        } else {
          const saved = aiService.getSelectedOllamaModel();
          if (saved && models.includes(saved)) {
            setSelectedModel(saved);
          } else {
            setSelectedModel(models[0]);
          }
        }
      }
    };
    fetchModels();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = (event.target?.result as string).split(',')[1];
      setImageBase64(base64String);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!imageBase64 || !selectedModel) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const systemPrompt = `You are an expert Digital Forensics Analyst.
Examine this image for signs that it is an AI-generated Deepfake.
Look for:
1. Anatomical inconsistencies (extra fingers, weird teeth, asymmetrical eyes).
2. Lighting and shadow errors.
3. Background blurring or nonsensical text.
Provide your verdict and outline the specific artifacts that led to your conclusion.
NOTE: If you are not a vision model, please tell the user they need to select a model like 'llava'.`;

    try {
      const endpoint = aiService.getCustomEndpoint('ollama') || 'http://localhost:11434';
      const res = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: 'Analyze this image for deepfake artifacts.',
          system: systemPrompt,
          images: [imageBase64],
          stream: false
        })
      });

      if (!res.ok) throw new Error('Ollama failed to generate text');
      const data = await res.json();
      setResult(data.response || 'No response from model.');
    } catch (err: any) {
      setError(err.message || 'Failed to connect to local AI. Ensure Ollama is running and you have selected a Vision model like Llava.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left">
        <h3 className="font-bold text-[#ECEBE9] text-lg flex items-center gap-2">
          <ImageIcon size={20} className="text-[#3C6B4D]" />
          DomoGuard Deepfake Detection
        </h3>
        <p className="text-[#A3A09B] text-xs leading-relaxed">
          Upload an image to a local Vision model (e.g., <strong>llava</strong>) to check for AI generation artifacts 
          like extra fingers, mismatched lighting, or asymmetrical features.
        </p>
      </div>

      <div className="glass-card p-6 border-[#2A2D30] bg-[#111213] flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-2">
            Suspect Image
          </label>
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[#E29E2D]" />
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                aiService.setSelectedOllamaModel(e.target.value);
              }}
              className="bg-[#18191B] text-[#ECEBE9] border border-[#E29E2D]/50 rounded-lg px-2 py-1 text-[10px] font-mono focus:outline-none focus:border-[#E29E2D]"
            >
              {models.length === 0 ? (
                <option value="">No Models Found</option>
              ) : (
                models.map(m => <option key={m} value={m}>{m}</option>)
              )}
            </select>
          </div>
        </div>

        {!selectedModel.includes('llava') && !selectedModel.includes('vision') && models.length > 0 && (
          <div className="bg-[#E29E2D]/10 border border-[#E29E2D]/25 p-3 rounded-xl text-[10px] text-[#E29E2D] font-semibold flex items-center gap-2">
            <ShieldAlert size={14} />
            <span>Warning: You have not selected a vision model. Please install and select <strong>llava</strong> in Ollama for image analysis.</span>
          </div>
        )}

        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 bg-[#18191B] border-2 border-dashed border-[#2A2D30] rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#3C6B4D] transition-colors relative overflow-hidden"
        >
          {imageBase64 ? (
            <img src={`data:image/jpeg;base64,${imageBase64}`} className="w-full h-full object-contain absolute inset-0 z-0 opacity-40" alt="Uploaded" />
          ) : null}
          <div className="z-10 flex flex-col items-center gap-2">
            <div className="p-3 bg-[#3C6B4D]/10 text-[#3C6B4D] rounded-full">
              <Upload size={24} />
            </div>
            <span className="text-sm font-bold text-[#ECEBE9]">{imageBase64 ? 'Image Uploaded. Click to replace.' : 'Upload Image to Analyze'}</span>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
          />
        </div>
        
        <button
          onClick={analyzeImage}
          disabled={isAnalyzing || !imageBase64 || models.length === 0}
          className="btn-primary py-3 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Activity size={16} className="animate-spin" />
              <span>Running Vision Analysis...</span>
            </>
          ) : (
            <>
              <ImageIcon size={16} />
              <span>Detect Deepfake Artifacts</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-xs text-rose-450 font-semibold flex items-start gap-2">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="glass-card p-6 border-[#3C6B4D]/30 bg-[#18191B] flex flex-col gap-4 text-left">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={18} className="text-[#3C6B4D]" />
            <h4 className="font-bold text-[#ECEBE9] text-sm uppercase tracking-wider">Vision Analysis Result</h4>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-[#A3A09B] leading-relaxed">
            {result.split('\n').map((line, i) => {
              if (line.startsWith('###')) return <h5 key={i} className="text-white font-bold mt-4 mb-2">{line.replace('###', '')}</h5>;
              if (line.startsWith('##')) return <h4 key={i} className="text-white font-bold text-base mt-4 mb-2">{line.replace('##', '')}</h4>;
              if (line.startsWith('#')) return <h3 key={i} className="text-[#3C6B4D] font-bold text-lg mt-4 mb-2">{line.replace('#', '')}</h3>;
              if (line.startsWith('-')) return <li key={i} className="ml-4">{line.substring(1)}</li>;
              return <p key={i} className="mb-2 break-words whitespace-pre-wrap">{line}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
