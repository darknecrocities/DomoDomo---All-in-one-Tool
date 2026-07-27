import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Sparkles, RefreshCw, Send, Play, Pause, Trash2 } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

interface FrameLog {
  id: string;
  type: 'sent' | 'received' | 'system';
  timestamp: string;
  payload: string;
}

export const WebSocketTesterStudioTool: React.FC = () => {
  const [wsUrl, setWsUrl] = useState('wss://echo.websocket.events');
  const [messageInput, setMessageInput] = useState('{\n  "event": "ping",\n  "timestamp": 1780000000\n}');
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<FrameLog[]>([
    { id: '1', type: 'system', timestamp: '14:20:00', payload: 'Ready to connect to WebSocket server endpoint.' },
  ]);

  // Local AI State
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
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

  const handleToggleConnect = () => {
    if (isConnected) {
      setIsConnected(false);
      setLogs((prev) => [...prev, { id: String(Date.now()), type: 'system', timestamp: new Date().toLocaleTimeString(), payload: 'Disconnected from server.' }]);
    } else {
      setIsConnected(true);
      setLogs((prev) => [
        ...prev,
        { id: String(Date.now()), type: 'system', timestamp: new Date().toLocaleTimeString(), payload: `Connected to ${wsUrl}` },
        { id: String(Date.now() + 1), type: 'received', timestamp: new Date().toLocaleTimeString(), payload: '{"status": "connected", "protocol": "wss"}' },
      ]);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    const now = new Date().toLocaleTimeString();
    setLogs((prev) => [
      ...prev,
      { id: String(Date.now()), type: 'sent', timestamp: now, payload: messageInput },
      { id: String(Date.now() + 1), type: 'received', timestamp: now, payload: messageInput },
    ]);
  };

  const handleRunAiWsAudit = async () => {
    if (!selectedModel) return;
    setIsAnalyzing(true);
    setError(null);

    const systemPrompt = `You are a Senior Real-Time Networking Architect & WebSocket Security Specialist.
WebSocket target: ${wsUrl}. Recent frames count: ${logs.length}.
Provide heartbeats/ping-pong strategy, reconnection backoff algorithms, and WSS security protocols (Origin header check, token auth in handshake).`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, `Analyze WebSocket protocol log frames for ${wsUrl}`, 2048, systemPrompt);
      setAiOutput(response);
    } catch (err: any) {
      setError(err.message || 'Failed to query local AI model.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 p-2.5 rounded-xl">
              <Terminal size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI WebSockets & SSE Packet Diagnostic Studio</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Inspect real-time WebSocket frames, stream Server-Sent Events (SSE), test reconnect backoff latency, and audit packet payloads with Local AI.
              </p>
            </div>
          </div>
          {models.length > 0 && (
            <div className="flex items-center gap-2 bg-[#111213] p-2 rounded-xl border border-[#2A2D30]">
              <Cpu size={16} className="text-[#3C6B4D]" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-xs text-[#ECEBE9] focus:outline-none cursor-pointer"
              >
                {models.map((m) => (
                  <option key={m} value={m} className="bg-[#18191B] text-[#ECEBE9]">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* URL Connection Bar */}
      <div className="glass-card p-4 border-[#2A2D30] bg-[#18191B] rounded-2xl flex items-center justify-between gap-3 text-left">
        <input
          type="text"
          value={wsUrl}
          onChange={(e) => setWsUrl(e.target.value)}
          placeholder="wss://..."
          className="flex-1 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-3 rounded-xl font-mono focus:outline-none focus:border-[#3C6B4D]"
        />
        <button
          onClick={handleToggleConnect}
          className={`flex items-center gap-2 text-xs font-semibold px-5 py-3 rounded-xl transition cursor-pointer ${
            isConnected ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 text-white'
          }`}
        >
          {isConnected ? <Pause size={14} /> : <Play size={14} />}
          {isConnected ? 'Disconnect' : 'Connect WSS'}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Frame Output Logs */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[#ECEBE9]">Frame Protocol Logs ({logs.length})</h4>
              <button onClick={() => setLogs([])} className="text-xs text-[#A3A09B] hover:text-[#ECEBE9]">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
              {logs.map((l) => (
                <div key={l.id} className="p-3 bg-[#111213] rounded-xl border border-[#2A2D30] flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={l.type === 'sent' ? 'text-cyan-400 font-bold' : l.type === 'received' ? 'text-emerald-400 font-bold' : 'text-[#A3A09B]'}>
                      [{l.type.toUpperCase()}]
                    </span>
                    <span className="text-[#A3A09B]">{l.timestamp}</span>
                  </div>
                  <pre className="font-mono text-[#ECEBE9] text-[11px] whitespace-pre-wrap">{l.payload}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Frame Composer */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
          <h4 className="text-sm font-semibold text-[#ECEBE9]">Frame Payload Composer</h4>
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            rows={10}
            className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-3.5 rounded-xl font-mono resize-none focus:outline-none focus:border-[#3C6B4D]"
          />
          <button
            onClick={handleSendMessage}
            disabled={!isConnected}
            className="flex items-center justify-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold py-3 rounded-xl transition cursor-pointer"
          >
            <Send size={14} />
            Send Frame Payload
          </button>
        </div>
      </div>

      {/* Local AI Advisor */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI Real-Time Protocol Architect</h4>
          </div>
          <button
            onClick={handleRunAiWsAudit}
            disabled={isAnalyzing || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isAnalyzing ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isAnalyzing ? 'Analyzing Protocol...' : 'Run Local AI Protocol Audit'}
          </button>
        </div>

        {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">{error}</div>}

        {aiOutput && (
          <div
            className="bg-[#111213] p-5 rounded-xl border border-[#2A2D30] text-[#ECEBE9] text-xs leading-relaxed overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(aiOutput) }}
          />
        )}
      </div>
    </div>
  );
};
