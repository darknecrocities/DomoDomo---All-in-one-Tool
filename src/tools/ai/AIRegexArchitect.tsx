import React, { useState, useEffect } from 'react';
import { Code, Cpu, Activity, CheckCircle2 } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

export const AIRegexArchitectTool: React.FC = () => {
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

  const analyzeContent = async () => {
    if (!content.trim() || !selectedModel) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    const systemPrompt = `You are a master of Regular Expressions. 
If the user provides a Regular Expression, break it down and explain exactly what every part and capture group does in plain English. 
If the user provides a plain English description of a string pattern they want to match, generate the perfect Regex for it, and explain how it works. 
Use markdown formatting for clarity, highlighting the regex in a code block.`;

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
        <div className="bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 w-max p-2 rounded-lg">
          <Code size={24} />
        </div>
        <h3 className="font-bold text-[#ECEBE9] text-lg">AI Regex Explainer & Builder</h3>
        <p className="text-[#A3A09B] text-xs leading-relaxed">
          Paste a complex Regular Expression and the AI breaks down what every capture group does in plain English. Or, describe the exact string pattern you want to match, and the AI generates the perfect Regex.
        </p>
      </div>

      <div className="glass-card p-6 border-[#2A2D30] bg-[#111213] flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-2">
            Regex or Description
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
          placeholder="e.g. ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$ OR 'I need a regex that matches valid IPv4 addresses'"
          className="w-full h-40 bg-[#18191B] border border-[#2A2D30] rounded-xl p-4 text-[10px] font-mono text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] transition-all resize-none whitespace-pre"
          spellCheck={false}
        />
        
        <button
          onClick={analyzeContent}
          disabled={isAnalyzing || !content.trim() || models.length === 0}
          className="bg-emerald-600 hover:bg-emerald-500 text-white w-full py-3 font-bold text-sm flex items-center justify-center gap-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Activity size={16} className="animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Code size={16} />
              <span>Explain or Build Regex Locally</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-xs text-rose-450 font-semibold flex items-start gap-2">
          <Code size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="glass-card p-6 border-[#3C6B4D]/30 bg-[#18191B] flex flex-col gap-4 text-left">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={18} className="text-[#3C6B4D]" />
            <h4 className="font-bold text-[#ECEBE9] text-sm uppercase tracking-wider">Analysis Result</h4>
          </div>
          <div 
            dangerouslySetInnerHTML={{ __html: parseMarkdown(result) }} 
            className="markdown-chat-content" 
          />
        </div>
      )}
    </div>
  );
};
