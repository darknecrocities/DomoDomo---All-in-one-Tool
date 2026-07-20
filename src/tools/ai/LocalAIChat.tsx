import { useState, useRef, useEffect } from 'react';
import { Send, Cpu, Loader2, Download, Trash2, Copy, Check, RefreshCw, XCircle, Type } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { handleTextCopy } from '../../utils/sharedHelpers';
import { parseMarkdown } from '../../utils/markdownParser';
import { LocalAIConfigPanel } from '../../components/LocalAIConfigPanel';

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

const SYSTEM_PRESETS: Record<string, string> = {
  general: "You are Domo, a helpful offline AI Assistant. Respond briefly and friendly.",
  coder: "You are a professional software engineering mentor. Provide clean, correct, and modern code examples with clear explanations.",
  writer: "You are an imaginative and creative writer. Provide engaging, expressive, and detailed creative responses.",
  interviewer: "You are a senior technical interviewer. Ask insightful follow-up questions and evaluate candidate responses critically but constructively."
};

export const LocalAIChatTool = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: 'Hello! I am Domo, your offline AI Assistant powered by local Ollama. Ask me anything!', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Configuration settings
  const [selectedModel, setSelectedModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PRESETS.general);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(120);

  // Appearance & metrics states
  const [activePreset, setActivePreset] = useState('general');
  const [textSize, setTextSize] = useState(12);
  const [fontFamily, setFontFamily] = useState<'sans' | 'mono'>('sans');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [metrics, setMetrics] = useState<{ words: number; chars: number; durationMs: number } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortFlagRef = useRef(false);

  // Auto-scroll chat window
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handlePresetChange = (preset: string) => {
    setActivePreset(preset);
    if (SYSTEM_PRESETS[preset]) {
      setSystemPrompt(SYSTEM_PRESETS[preset]);
    }
  };

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim() || loading) return;

    abortFlagRef.current = false;
    const userText = textToSend.trim();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!customInput) {
      setMessages(prev => [...prev, { sender: 'user', text: userText, timestamp: nowStr }]);
      setInput('');
    }
    setLoading(true);
    setStatusMsg('Preparing response...');
    const startTime = performance.now();

    // Append a placeholder message for the AI's streaming response
    setMessages(prev => [...prev, { sender: 'ai', text: '', timestamp: nowStr }]);

    try {
      const response = await aiService.generateText(
        userText,
        maxTokens,
        (status) => {
          setStatusMsg(status);
        },
        selectedModel || undefined,
        {
          systemPrompt,
          temperature,
          onStream: (streamText) => {
            if (abortFlagRef.current) return;
            setMessages(prev => {
              const updated = [...prev];
              if (updated.length > 0) {
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  text: streamText
                };
              }
              return updated;
            });
          }
        }
      );

      if (abortFlagRef.current) {
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              text: 'Generation cancelled by user.'
            };
          }
          return updated;
        });
        return;
      }

      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);
      const cleanResponse = response.trim() || "I processed your request, but returned an empty response.";

      // Compute analytics
      const words = cleanResponse.split(/\s+/).filter(Boolean).length;
      setMetrics({
        words,
        chars: cleanResponse.length,
        durationMs
      });

      // Update the placeholder message with the final cleaned response
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            text: cleanResponse
          };
        }
        return updated;
      });
    } catch (err: any) {
      if (!abortFlagRef.current) {
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              text: `Sorry, I encountered an error: ${err.message || err}`
            };
          }
          return updated;
        });
      }
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  const handleStop = () => {
    abortFlagRef.current = true;
    setLoading(false);
    setStatusMsg('');
  };

  const handleRegenerate = () => {
    const userMsgs = messages.filter(m => m.sender === 'user');
    if (userMsgs.length === 0) return;
    const lastUserMsg = userMsgs[userMsgs.length - 1].text;
    handleSend(lastUserMsg);
  };

  const handleClearChat = () => {
    setMessages([
      { sender: 'ai', text: 'Chat cleared. How can I help you now?', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setMetrics(null);
    setShowClearConfirm(false);
  };

  const handleExportChat = (format: 'md' | 'json') => {
    let content = '';
    let filename = `chat-history.${format}`;

    if (format === 'json') {
      content = JSON.stringify(messages, null, 2);
    } else {
      content = `# Local AI Chat Session History\n\n`;
      messages.forEach(m => {
        const sender = m.sender === 'user' ? 'User' : 'Assistant';
        content += `### [${m.timestamp}] ${sender}\n${m.text}\n\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyMessage = (text: string, index: number) => {
    handleTextCopy(text, () => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
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

      <div className="glass-card p-5 flex flex-col h-[560px] relative">
        {/* Header bar */}
        <div className="flex justify-between items-center border-b border-slate-850 pb-3">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-teal-400 animate-pulse" />
            <h3 className="font-bold text-teal-400 text-sm">Domo Local Chat</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* System Presets */}
            <select
              value={activePreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-[10px] text-slate-350 rounded px-2 py-0.5 focus:outline-none"
            >
              <option value="general">Role: General</option>
              <option value="coder">Role: Coding Mentor</option>
              <option value="writer">Role: Creative Writer</option>
              <option value="interviewer">Role: Interviewer</option>
            </select>

            {/* Clear Button */}
            {showClearConfirm ? (
              <div className="flex gap-1.5 items-center">
                <button
                  onClick={handleClearChat}
                  className="text-[9px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded"
                >
                  Confirm Clear
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-slate-400 hover:text-red-400 p-1 rounded"
                title="Wipe conversation history"
              >
                <Trash2 size={13} />
              </button>
            )}

            {/* Export Buttons */}
            <button
              onClick={() => handleExportChat('md')}
              className="text-slate-400 hover:text-teal-400 p-1"
              title="Download Markdown Transcript"
            >
              <Download size={13} />
            </button>
          </div>
        </div>

        {/* Text styling & appearance ribbon */}
        <div className="flex justify-between items-center bg-slate-950/20 border-b border-slate-850 px-2 py-1.5 text-[10px] text-slate-450 gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Type size={11} /> Size:
            </span>
            <input
              type="range"
              min="10"
              max="16"
              value={textSize}
              onChange={(e) => setTextSize(parseInt(e.target.value))}
              className="w-16 accent-teal-500 bg-slate-800 rounded h-1 cursor-pointer"
            />
            <span className="font-mono">{textSize}px</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontFamily(f => f === 'sans' ? 'mono' : 'sans')}
              className={`px-1.5 py-0.5 rounded font-mono border ${
                fontFamily === 'mono'
                  ? 'bg-teal-950/40 text-teal-400 border-teal-900/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              Aa (Mono)
            </button>
          </div>
        </div>

        {/* Chat messages viewport */}
        <div className="flex-1 overflow-y-auto my-3 flex flex-col gap-3.5 pr-1 leading-relaxed">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl max-w-[85%] border relative group transition-all ${
                m.sender === 'user'
                  ? 'bg-teal-950/25 text-teal-200 ml-auto border-teal-900/20 shadow-sm'
                  : 'bg-slate-900/60 text-slate-350 mr-auto border-slate-850/80 shadow-sm'
              }`}
              style={{ fontSize: `${textSize}px`, fontFamily: fontFamily === 'mono' ? 'monospace' : 'sans-serif' }}
            >
              {/* Message Context */}
              <div 
                dangerouslySetInnerHTML={{ __html: parseMarkdown(m.text) }} 
                className="markdown-chat-content" 
              />

              {/* Utility overlay (Copy/Timestamp) */}
              <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-900/40 text-[9px] text-slate-500 font-mono">
                <span>{m.timestamp}</span>
                <button
                  onClick={() => copyMessage(m.text, idx)}
                  className="opacity-0 group-hover:opacity-100 hover:text-teal-400 transition-opacity p-0.5"
                  title="Copy message contents"
                >
                  {copiedIndex === idx ? <Check size={10} className="text-green-400" /> : <Copy size={10} />}
                </button>
              </div>
            </div>
          ))}

          {loading && statusMsg && (
            <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-900 self-start animate-pulse">
              <Loader2 size={12} className="animate-spin text-teal-400" />
              <span>{statusMsg}</span>
              <button
                onClick={handleStop}
                className="ml-2 text-red-400 hover:text-red-300 font-semibold uppercase text-[8px] border border-red-900/30 px-1 rounded bg-red-950/30"
              >
                Cancel
              </button>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Metrics banner */}
        {metrics && (
          <div className="bg-slate-950/50 border border-slate-850 px-3 py-1.5 rounded-lg text-[9px] font-mono text-slate-500 flex justify-between mb-3 items-center">
            <span>Last Response Metrics:</span>
            <span>{metrics.words} words | {metrics.chars} chars | {metrics.durationMs}ms</span>
          </div>
        )}

        {/* Inputs section */}
        <div className="flex gap-2.5 mt-auto pt-3 border-t border-slate-850">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-slate-950 border border-slate-850 focus:border-teal-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-200"
            placeholder={loading ? "Generating..." : "Ask Domo anything..."}
            disabled={loading}
          />

          {messages.length > 1 && !loading && (
            <button
              onClick={handleRegenerate}
              className="border border-slate-800 bg-slate-900 text-slate-400 hover:text-teal-400 rounded-lg p-2 flex items-center justify-center transition-colors"
              title="Regenerate last response"
            >
              <RefreshCw size={14} />
            </button>
          )}

          {loading ? (
            <button
              onClick={handleStop}
              className="bg-red-600/20 border border-red-900/40 text-red-400 hover:bg-red-600/35 rounded-lg px-4 py-2 text-xs flex items-center justify-center transition-all"
            >
              <XCircle size={14} />
            </button>
          ) : (
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="btn-primary py-2 px-4 text-xs flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none"
            >
              <Send size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
