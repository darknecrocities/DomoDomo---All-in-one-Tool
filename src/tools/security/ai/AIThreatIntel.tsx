import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Activity, ShieldCheck, Send, Info } from 'lucide-react';
import { aiService } from '../../../utils/aiService';

export const AIThreatIntelTool: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: "Hello! I'm your local Cyber Threat Intelligence (CTI) Assistant. You can ask me about APT groups, CVEs, ransomware behaviors, or general cybersecurity tactics." }
  ]);
  const [input, setInput] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !selectedModel) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    const systemPrompt = `You are an expert Cyber Threat Intelligence (CTI) analyst. 
You provide detailed, accurate information on Advanced Persistent Threats (APTs), malware families, TTPs (Tactics, Techniques, and Procedures), and CVEs.
If the user asks about a specific CVE or APT group, provide known details, usual targets, and associated malware.
Always maintain a professional, analytical tone.`;

    try {
      // Create chat history context
      const historyContext = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
      const fullPrompt = `${historyContext}\nUser: ${userMsg}\nAssistant:`;

      const response = await aiService.generateTextOllama(selectedModel, fullPrompt, 1024, systemPrompt);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message || 'Failed to connect to local AI.'}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full h-[80vh] min-h-[600px]">
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left shrink-0">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-[#ECEBE9] text-lg flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#3C6B4D]" />
            DomoGuard Threat Intel
          </h3>
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[#3C6B4D]" />
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                aiService.setSelectedOllamaModel(e.target.value);
              }}
              className="bg-[#111213] text-[#ECEBE9] border border-[#2A2D30] rounded-lg px-2 py-1 text-[10px] font-mono focus:outline-none focus:border-[#3C6B4D]"
            >
              {models.length === 0 ? (
                <option value="">No Models Found</option>
              ) : (
                models.map(m => <option key={m} value={m}>{m}</option>)
              )}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#111213] p-2 rounded border border-[#2A2D30]">
          <Info size={14} className="text-[#A3A09B]" />
          <p className="text-[11px] text-[#A3A09B]">
            This offline chatbot uses your local LLM's internal weights. It cannot browse the live internet for zero-days that occurred after its training cutoff.
          </p>
        </div>
      </div>

      <div className="glass-card border-[#2A2D30] bg-[#111213] flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
              <span className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${msg.role === 'user' ? 'text-right text-[#A3A09B]' : 'text-left text-[#3C6B4D]'}`}>
                {msg.role === 'user' ? 'You' : 'DomoGuard Intel'}
              </span>
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-[#2A2D30] text-[#ECEBE9] rounded-tr-none' 
                  : 'bg-[#18191B] border border-[#2A2D30] text-[#A3A09B] rounded-tl-none'
              }`}>
                <div className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed">
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className="mb-2 break-words whitespace-pre-wrap">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="self-start flex flex-col max-w-[85%]">
              <span className="text-[10px] uppercase font-bold tracking-wider mb-1 text-left text-[#3C6B4D]">
                DomoGuard Intel
              </span>
              <div className="p-4 rounded-2xl bg-[#18191B] border border-[#2A2D30] rounded-tl-none">
                <Activity size={16} className="text-[#3C6B4D] animate-pulse" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-[#2A2D30] bg-[#18191B]">
          <div className="relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about APT29, Log4j, or ransomware tactics..."
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl py-3 pl-4 pr-12 text-sm text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] transition-all resize-none max-h-32"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping || models.length === 0}
              className="absolute right-2 p-2 bg-[#3C6B4D] text-white rounded-lg disabled:opacity-50 hover:bg-[#4a825e] transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
