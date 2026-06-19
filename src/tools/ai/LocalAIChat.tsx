import { useState } from 'react';
import { Send, Cpu } from 'lucide-react';

export const LocalAIChatTool = () => {
  const [messages, setMessages] = useState<{ sender: 'ai' | 'user'; text: string }[]>([
    { sender: 'ai', text: 'Hello! I am Panda, your offline AI Assistant. I run 100% locally on your browser. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user' as const, text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'ai', text: 'That sounds great! As an offline assistant, I process your inquiries locally with zero latency or cloud tracking.' }]);
      setLoading(false);
    }, 700);
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col h-[400px] text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2 flex items-center gap-2">
        <Cpu size={16} /> Local Panda Chat
      </h3>
      <div className="flex-1 overflow-y-auto my-3 flex flex-col gap-3 pr-1 text-xs">
        {messages.map((m, idx) => (
          <div key={idx} className={`p-2.5 rounded-lg max-w-[85%] ${m.sender === 'user' ? 'bg-indigo-950/40 text-indigo-300 ml-auto border border-indigo-900/30' : 'bg-slate-900/60 text-slate-350 mr-auto border border-slate-850'}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="text-slate-500 animate-pulse">Panda is thinking...</div>}
      </div>
      <div className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" placeholder="Type here..." />
        <button onClick={handleSend} className="btn-primary py-1.5 px-3 text-xs"><Send size={12} /></button>
      </div>
    </div>
  );
};
