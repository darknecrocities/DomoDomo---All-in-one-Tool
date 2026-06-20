import { useState, useRef, useEffect } from 'react';
import { Send, Cpu, Loader2 } from 'lucide-react';
import { aiService } from '../../utils/aiService';

interface Message {
  sender: 'ai' | 'user';
  text: string;
}

export const LocalAIChatTool = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: 'Hello! I am Domo, your offline AI Assistant powered by local Ollama. Ask me anything!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat window
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Check Ollama on mount
  useEffect(() => {
    const checkOllamaStatus = async () => {
      try {
        const res = await aiService.checkOllama();
        if (res.status && res.models.length > 0) {
          setOllamaModels(res.models);
          const saved = aiService.getSelectedOllamaModel();
          const initial = saved && res.models.includes(saved) ? saved : res.models[0];
          setSelectedModel(initial);
        }
      } catch (err) {
        console.warn('Failed to detect local Ollama runtime:', err);
      }
    };
    checkOllamaStatus();
  }, []);

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    aiService.setSelectedOllamaModel(model);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);
    setStatusMsg('Generating response...');

    try {
      const prompt = `You are Domo, a helpful offline AI Assistant. Respond briefly and friendly. User query: ${userText}`;

      const response = await aiService.generateText(prompt, 120, (status) => {
        setStatusMsg(status);
      }, selectedModel || undefined);

      const cleanResponse = response.trim() || "I processed your request, but returned an empty response. Please try again.";

      setMessages(prev => [...prev, { sender: 'ai', text: cleanResponse }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { sender: 'ai', text: `Sorry, I encountered an error: ${err.message || err}` }]);
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="max-w-xl mx-auto glass-card p-6 flex flex-col h-[520px] text-left">
      <div className="flex justify-between items-center border-b border-slate-850 pb-3">
        <h3 className="font-bold text-teal-400 flex items-center gap-2 text-base">
          <Cpu size={18} className="animate-pulse" />
          <span>Local Domo Assistant</span>
        </h3>
        {ollamaModels.length > 0 ? (
          <select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-0.5 text-[10px] font-semibold focus:outline-none"
          >
            {ollamaModels.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        ) : (
          <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded border border-slate-750 font-mono">
            No Ollama Models Found
          </span>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto my-3 flex flex-col gap-3.5 pr-1 text-xs">
        {messages.map((m, idx) => (
          <div 
            key={idx} 
            className={`p-3 rounded-xl max-w-[85%] leading-relaxed border transition-all ${
              m.sender === 'user' 
                ? 'bg-teal-950/20 text-teal-300 ml-auto border-teal-900/30' 
                : 'bg-slate-900/60 text-slate-300 mr-auto border-slate-850'
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && statusMsg && (
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-900 self-start animate-pulse">
            <Loader2 size={12} className="animate-spin text-teal-400" />
            <span>{statusMsg}</span>
          </div>
        )}
      </div>

      {/* Inputs */}
      <div className="flex gap-2.5 mt-auto pt-3 border-t border-slate-850">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
          className="flex-1 bg-slate-900/80 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-200" 
          placeholder={ollamaModels.length === 0 ? "Ollama model required. Download one on Dashboard." : "Ask Domo anything..."}
          disabled={loading || ollamaModels.length === 0}
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim() || ollamaModels.length === 0}
          className="btn-primary py-2 px-4 text-xs flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  );
};
