import React, { useState, useEffect } from 'react';
import { FileText, Cpu, Activity, CheckCircle2, ShieldAlert } from 'lucide-react';
import { aiService } from '../../../utils/aiService';

export const AIIncidentReportTool: React.FC = () => {
  const [content, setContent] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      const { status, models } = await aiService.checkOllama();
      if (status && models.length > 0) {
        setModels(models);
        const saved = aiService.getSelectedOllamaModel();
        if (saved && models.includes(saved)) {
          setSelectedModel(saved);
        } else {
          setSelectedModel(models[0]);
        }
      }
    };
    fetchModels();
  }, []);

  const generateReport = async () => {
    if (!content.trim() || !selectedModel) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const systemPrompt = `You are a Senior Security Operations Center (SOC) Manager.
The user will provide raw notes, log snippets, or brief findings from a security incident.
Your task is to transform these raw notes into a professional, formal Incident Response Executive Summary Report.
The report must include:
# Executive Summary
# Timeline of Events (inferred or explicit)
# Indicators of Compromise (IOCs)
# Impact Assessment
# Recommended Remediation Steps
Maintain a highly professional, clinical tone.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, content, 2048, systemPrompt);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to local AI. Ensure Ollama is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left">
        <h3 className="font-bold text-[#ECEBE9] text-lg flex items-center gap-2">
          <FileText size={20} className="text-[#3C6B4D]" />
          DomoGuard Incident Report
        </h3>
        <p className="text-[#A3A09B] text-xs leading-relaxed">
          Paste your messy, raw notes or tool outputs from a cyber incident. Your local AI will rewrite them into a 
          professional, structured SOC Executive Summary suitable for C-Level executives and compliance documentation.
        </p>
      </div>

      <div className="glass-card p-6 border-[#2A2D30] bg-[#111213] flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-2">
            Raw Incident Notes / Findings
          </label>
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[#3C6B4D]" />
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                aiService.setSelectedOllamaModel(e.target.value);
              }}
              className="bg-[#18191B] text-[#ECEBE9] border border-[#2A2D30] rounded-lg px-2 py-1 text-[10px] font-mono focus:outline-none focus:border-[#3C6B4D]"
            >
              {models.length === 0 ? (
                <option value="">No Models Found</option>
              ) : (
                models.map(m => <option key={m} value={m}>{m}</option>)
              )}
            </select>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="e.g. User bob clicked a link at 10am, downloaded payload.exe (hash: 8d2b...), EDR blocked it, wiped machine."
          className="w-full h-48 bg-[#18191B] border border-[#2A2D30] rounded-xl p-4 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] transition-all resize-none"
        />
        
        <button
          onClick={generateReport}
          disabled={isAnalyzing || !content.trim() || models.length === 0}
          className="btn-primary py-3 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Activity size={16} className="animate-spin" />
              <span>Drafting SOC Report...</span>
            </>
          ) : (
            <>
              <FileText size={16} />
              <span>Generate Executive Summary</span>
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
        <div className="glass-card p-8 border-[#3C6B4D]/30 bg-[#18191B] flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between mb-4 border-b border-[#2A2D30] pb-4">
            <h4 className="font-bold text-[#ECEBE9] text-xl uppercase tracking-widest text-[#3C6B4D]">INCIDENT RESPONSE REPORT</h4>
            <CheckCircle2 size={24} className="text-[#3C6B4D]" />
          </div>
          <div className="prose prose-invert max-w-none text-[#ECEBE9] leading-loose">
            {result.split('\n').map((line, i) => {
              if (line.startsWith('###')) return <h5 key={i} className="text-white font-bold mt-6 mb-2 uppercase text-sm tracking-widest">{line.replace('###', '')}</h5>;
              if (line.startsWith('##')) return <h4 key={i} className="text-white font-bold text-base mt-6 mb-3 border-b border-[#2A2D30] pb-1">{line.replace('##', '')}</h4>;
              if (line.startsWith('#')) return <h3 key={i} className="text-[#3C6B4D] font-bold text-xl mt-8 mb-4">{line.replace('#', '')}</h3>;
              if (line.startsWith('-')) return <li key={i} className="ml-6 list-disc mb-1">{line.substring(1)}</li>;
              return <p key={i} className="mb-4">{line}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
