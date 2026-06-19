import { useState, useRef, useEffect } from 'react';
import { Send, Cpu, Loader2, Sparkles } from 'lucide-react';
import { aiService } from '../../utils/aiService';

interface Message {
  sender: 'ai' | 'user';
  text: string;
}

export const LocalAIChatTool = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: 'Hello! I am Panda, your offline AI Assistant. I run 100% locally on your browser. Once the model is loaded, I can answer your questions with zero cloud tracking!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat window
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadModel = async () => {
    setStatusMsg('Initializing model...');
    try {
      await aiService.initLLM('Xenova/LaMini-Flan-T5-78M', (status, prog) => {
        setStatusMsg(status);
        setProgress(prog);
      });
      setModelLoaded(true);
    } catch (err: any) {
      setStatusMsg(`Error loading model: ${err.message || err}`);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      // Lazy load model if not loaded yet
      if (!modelLoaded) {
        await loadModel();
      }

      // Format direct instruction for Seq2Seq T5 model
      const prompt = `You are Panda, a helpful offline AI Assistant. Respond briefly and friendly. User query: ${userText}`;

      const response = await aiService.generateText(prompt, 120, (status, prog) => {
        setStatusMsg(status);
        setProgress(prog);
      });

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
          <span>Local Panda Assistant</span>
        </h3>
        <span className="text-[10px] bg-slate-800 text-slate-350 px-2 py-0.5 rounded border border-slate-750">
          LaMini-Flan-T5 (78M parameters)
        </span>
      </div>

      {/* Model Loader Screen */}
      {!modelLoaded && (
        <div className="bg-slate-950/80 border border-slate-850/60 rounded-lg p-4 my-3 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Sparkles size={14} className="text-teal-400" />
            <span>LLM Download & initialization required</span>
          </div>
          <p className="text-[11px] text-slate-400 text-center max-w-sm">
            This will download the AI model directly to your browser's local cache (~240MB). Subsequent visits will load instantly without downloading.
          </p>
          {statusMsg ? (
            <div className="w-full flex flex-col gap-2.5 items-center mt-1">
              <div className="text-[10px] font-mono text-slate-400 text-center truncate max-w-full">
                {statusMsg}
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-slate-300">{progress}%</span>
            </div>
          ) : (
            <button 
              onClick={loadModel}
              className="btn-primary py-1.5 px-4 text-xs mt-1 flex items-center gap-1.5"
            >
              Load Offline Model
            </button>
          )}
        </div>
      )}

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
            <span>{statusMsg} {progress > 0 ? `(${progress}%)` : ''}</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Inputs */}
      <div className="flex gap-2.5 mt-auto pt-3 border-t border-slate-850">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
          className="flex-1 bg-slate-900/80 border border-slate-800 focus:border-teal-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-200" 
          placeholder="Ask Panda anything..."
          disabled={loading}
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim()}
          className="btn-primary py-2 px-4 text-xs flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  );
};
