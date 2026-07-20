import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Activity, CheckCircle2 } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

export const AIDevOpsArchitectTool: React.FC = () => {
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

    const systemPrompt = `You are an expert DevOps engineer and sysadmin.
The user will describe a complex operation they need to perform in plain English (e.g., finding specific files, writing a cron job, or configuring a Docker container).
Generate the precise, safe, and efficient bash, crontab, or Docker command(s) required to accomplish the task.
Briefly explain how the command works step-by-step.
Use markdown formatting for clarity, highlighting the commands in code blocks.`;

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
          <Terminal size={24} />
        </div>
        <h3 className="font-bold text-[#ECEBE9] text-lg">AI DevOps Command Architect</h3>
        <p className="text-[#A3A09B] text-xs leading-relaxed">
          Describe complex DevOps operations in plain English ("find all pngs modified in the last 7 days and convert them to webp" or "run a docker container mapping port 8080 to 80") and the AI generates the precise bash, crontab, or Docker commands locally.
        </p>
      </div>

      <div className="glass-card p-6 border-[#2A2D30] bg-[#111213] flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-2">
            Operation Description
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
          placeholder="e.g. Find all empty directories in /var/log and delete them safely..."
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
              <span>Generating Commands...</span>
            </>
          ) : (
            <>
              <Terminal size={16} />
              <span>Architect Command Locally</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl text-xs text-rose-450 font-semibold flex items-start gap-2">
          <Terminal size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="glass-card p-6 border-[#3C6B4D]/30 bg-[#18191B] flex flex-col gap-4 text-left">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={18} className="text-[#3C6B4D]" />
            <h4 className="font-bold text-[#ECEBE9] text-sm uppercase tracking-wider">Generated Solution</h4>
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
