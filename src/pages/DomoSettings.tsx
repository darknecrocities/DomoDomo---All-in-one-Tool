import React, { useState, useEffect } from 'react';
import { aiService } from '../utils/aiService';
import { Settings, Cpu, Brain, Monitor, Download, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

export const DomoSettings: React.FC = () => {
  const [ollamaEndpoint, setOllamaEndpoint] = useState('http://localhost:11434');
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('llama3.2:1b');
  
  // RAG & memory state
  const [similarityThreshold, setSimilarityThreshold] = useState(0.35);
  const [maxChunks, setMaxChunks] = useState(4);
  const [enableHabitsLog, setEnableHabitsLog] = useState(true);

  // Floating assistant states
  const [showFloatingDomo, setShowFloatingDomo] = useState(true);
  const [ambientVoiceChat, setAmbientVoiceChat] = useState(false);
  const [assistantPersona, setAssistantPersona] = useState('You are Domo, a helpful offline AI assistant inside the DomoDomo application. Respond briefly and friendly.');
  const [glowEffect, setGlowEffect] = useState('regular');

  const checkOllamaConnection = async () => {
    setOllamaStatus('checking');
    try {
      const res = await aiService.checkOllama();
      if (res.status) {
        setOllamaStatus('online');
        setOllamaModels(res.models);
        const saved = aiService.getSelectedOllamaModel();
        if (saved && res.models.includes(saved)) {
          setSelectedModel(saved);
        } else if (res.models.length > 0) {
          setSelectedModel(res.models[0]);
          aiService.setSelectedOllamaModel(res.models[0]);
        }
      } else {
        setOllamaStatus('offline');
        setOllamaModels([]);
      }
    } catch {
      setOllamaStatus('offline');
      setOllamaModels([]);
    }
  };

  useEffect(() => {
    // Read local configs
    const savedEndpoint = aiService.getCustomEndpoint('ollama');
    if (savedEndpoint) setOllamaEndpoint(savedEndpoint);

    const savedThreshold = localStorage.getItem('domodomo_rag_threshold');
    if (savedThreshold) setSimilarityThreshold(parseFloat(savedThreshold));

    const savedChunks = localStorage.getItem('domodomo_rag_chunks');
    if (savedChunks) setMaxChunks(parseInt(savedChunks));

    const savedHabits = localStorage.getItem('domodomo_enable_habits');
    if (savedHabits !== null) setEnableHabitsLog(savedHabits === 'true');

    const savedFloating = localStorage.getItem('domodomo_show_floating_assistant');
    if (savedFloating !== null) setShowFloatingDomo(savedFloating === 'true');

    const savedAmbient = localStorage.getItem('domodomo_ambient_voice');
    if (savedAmbient !== null) setAmbientVoiceChat(savedAmbient === 'true');

    const savedPersona = localStorage.getItem('domodomo_assistant_persona');
    if (savedPersona) setAssistantPersona(savedPersona);

    const savedGlow = localStorage.getItem('domodomo_assistant_glow');
    if (savedGlow) setGlowEffect(savedGlow);

    checkOllamaConnection();
  }, []);

  const saveSettings = () => {
    aiService.setCustomEndpoint('ollama', ollamaEndpoint);
    aiService.setSelectedOllamaModel(selectedModel);
    localStorage.setItem('domodomo_rag_threshold', similarityThreshold.toString());
    localStorage.setItem('domodomo_rag_chunks', maxChunks.toString());
    localStorage.setItem('domodomo_enable_habits', enableHabitsLog.toString());
    localStorage.setItem('domodomo_show_floating_assistant', showFloatingDomo.toString());
    localStorage.setItem('domodomo_ambient_voice', ambientVoiceChat.toString());
    localStorage.setItem('domodomo_assistant_persona', assistantPersona);
    localStorage.setItem('domodomo_assistant_glow', glowEffect);

    // Dispatch global event for Floating assistant updates
    window.dispatchEvent(new Event('domodomo_settings_updated'));
    alert('Settings saved successfully!');
  };

  const purgeAllData = () => {
    if (window.confirm("Purge all local files context database, memory logs, and configurations? This cannot be undone.")) {
      localStorage.clear();
      alert("All data purged successfully! Page will reload.");
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-[#111213] text-[#ECEBE9] font-sans">
      <div className="flex items-center gap-3 mb-8 border-b border-[#2A2D30] pb-6">
        <div className="p-3 rounded-2xl bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20">
          <Settings size={28} className="animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">DomoDomo System Settings</h1>
          <p className="text-xs text-[#A3A09B]">
            Tune local server connections, configure cognitive memory pipelines, and set up the cross-site assistant extension.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Domo Assistant Offline Model settings */}
        <div className="bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 justify-between w-full">
              <div className="flex items-center gap-2">
                <Cpu size={18} className="text-[#3C6B4D]" />
                <h2 className="text-sm font-bold tracking-wide">Domo Assistant Offline Model Settings</h2>
              </div>
              <span className="text-[8px] font-black tracking-widest text-[#E29E2D] bg-[#E29E2D]/10 px-2 py-0.5 rounded border border-[#E29E2D]/25 uppercase">Offline Exclusive</span>
            </div>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-[#A3A09B] block mb-1">Ollama API Server Address</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ollamaEndpoint}
                    onChange={(e) => setOllamaEndpoint(e.target.value)}
                    className="flex-grow bg-[#111213] text-xs font-semibold px-4 py-2 border border-[#2A2D30] rounded-xl text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
                  />
                  <button
                    onClick={checkOllamaConnection}
                    className="p-2.5 bg-[#111213] border border-[#2A2D30] rounded-xl hover:text-[#3C6B4D] transition-colors"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A3A09B] block mb-1">Select Downloaded Assistant Local LLM Model</label>
                {ollamaStatus === 'online' ? (
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-[#111213] text-xs font-semibold px-4 py-2 border border-[#2A2D30] rounded-xl text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
                  >
                    {ollamaModels.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-[#111213] border border-red-500/20 text-red-400 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-semibold">
                    <ShieldAlert size={14} />
                    Ollama is offline. Start the Ollama app on port 11434 to retrieve models.
                  </div>
                )}
                <span className="text-[9px] text-[#A3A09B] mt-1.5 block leading-relaxed">
                  Select any downloaded model on your computer (e.g. Llama 3.2, Qwen 2.5, Gemma 2) to power the floating assistant widget.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#2A2D30]/60 flex items-center justify-between text-[11px]">
            <span className="text-[#A3A09B] font-bold">Ollama Status:</span>
            <span className={`px-2.5 py-1 rounded-lg font-black uppercase text-[9px] ${
              ollamaStatus === 'online' ? 'bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20' :
              ollamaStatus === 'offline' ? 'bg-red-400/10 text-red-400 border border-red-400/20' : 'bg-[#E29E2D]/10 text-[#E29E2D] border border-[#E29E2D]/20'
            }`}>
              {ollamaStatus}
            </span>
          </div>
        </div>

        {/* Local Memory & RAG Card */}
        <div className="bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 justify-between w-full">
              <div className="flex items-center gap-2">
                <Brain size={18} className="text-[#3C6B4D]" />
                <h2 className="text-sm font-bold tracking-wide">RAG & Local Cognitive Memory</h2>
              </div>
              <span className="text-[8px] font-black tracking-widest text-[#E29E2D] bg-[#E29E2D]/10 px-2 py-0.5 rounded border border-[#E29E2D]/25 uppercase">Offline Exclusive</span>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-[#A3A09B]">Cosine Similarity Threshold</label>
                  <span className="text-xs font-bold text-[#ECEBE9]">{similarityThreshold}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.8"
                  step="0.05"
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                  className="w-full h-1 bg-[#111213] rounded-lg appearance-none cursor-pointer accent-[#3C6B4D]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A3A09B] block mb-1">Max RAG Context Retrieval Chunks</label>
                <select
                  value={maxChunks}
                  onChange={(e) => setMaxChunks(parseInt(e.target.value))}
                  className="w-full bg-[#111213] text-xs font-semibold px-4 py-2 border border-[#2A2D30] rounded-xl text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
                >
                  <option value={2}>2 Chunks</option>
                  <option value={4}>4 Chunks (Recommended)</option>
                  <option value={6}>6 Chunks</option>
                  <option value={8}>8 Chunks</option>
                </select>
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] font-bold text-[#A3A09B]">Track & Log User Habit Timeline</span>
                <input
                  type="checkbox"
                  checked={enableHabitsLog}
                  onChange={(e) => setEnableHabitsLog(e.target.checked)}
                  className="w-4 h-4 accent-[#3C6B4D] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global Floating AI Assistant Settings */}
        <div className="bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 justify-between w-full">
              <div className="flex items-center gap-2">
                <Monitor size={18} className="text-[#3C6B4D]" />
                <h2 className="text-sm font-bold tracking-wide">Floating AI Assistant Configuration</h2>
              </div>
              <span className="text-[8px] font-black tracking-widest text-[#E29E2D] bg-[#E29E2D]/10 px-2 py-0.5 rounded border border-[#E29E2D]/25 uppercase">Offline Exclusive</span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#A3A09B]">Enable Global Floating AI Assistant</span>
                <input
                  type="checkbox"
                  checked={showFloatingDomo}
                  onChange={(e) => setShowFloatingDomo(e.target.checked)}
                  className="w-4 h-4 accent-[#3C6B4D] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#A3A09B]">Auto-Ambient Voice Chat Mode</span>
                <input
                  type="checkbox"
                  checked={ambientVoiceChat}
                  onChange={(e) => setAmbientVoiceChat(e.target.checked)}
                  className="w-4 h-4 accent-[#3C6B4D] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A3A09B] block mb-1">Glow Animation Intensity</label>
                <select
                  value={glowEffect}
                  onChange={(e) => setGlowEffect(e.target.value)}
                  className="w-full bg-[#111213] text-xs font-semibold px-4 py-2 border border-[#2A2D30] rounded-xl text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
                >
                  <option value="none">No Glow (Static)</option>
                  <option value="mini">Subtle Glow</option>
                  <option value="regular">Regular Glow (Standard)</option>
                  <option value="high">High Pulse Glow</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#A3A09B] block mb-1">Custom Assistant Persona / System Instructions</label>
                <textarea
                  value={assistantPersona}
                  onChange={(e) => setAssistantPersona(e.target.value)}
                  rows={3}
                  placeholder="e.g. You are Domo, a helpful offline AI assistant. Respond briefly with a friendly, coding-buddy tone."
                  className="w-full bg-[#111213] text-xs font-semibold px-4 py-3 border border-[#2A2D30] rounded-xl text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chrome Extension Template Deploy */}
        <div className="bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 justify-between w-full">
              <div className="flex items-center gap-2">
                <Download size={18} className="text-[#3C6B4D]" />
                <h2 className="text-sm font-bold tracking-wide">Cross-Site Floating AI Extension</h2>
              </div>
              <span className="text-[8px] font-black tracking-widest text-[#E29E2D] bg-[#E29E2D]/10 px-2 py-0.5 rounded border border-[#E29E2D]/25 uppercase">Offline Exclusive</span>
            </div>
            
            <p className="text-[10px] text-[#A3A09B] leading-relaxed mb-4">
              Domo can follow you across external tabs (like Wikipedia) to read active articles and answer questions offline.
            </p>

            <div className="bg-[#111213] border border-[#2A2D30]/60 p-3.5 rounded-2xl text-[10px] leading-relaxed text-[#ECEBE9]/90 font-semibold mb-4">
              <div className="font-bold text-[#E29E2D] mb-1">To Load the Extension:</div>
              1. Open Chrome and navigate to <code className="text-[#3C6B4D]">chrome://extensions/</code><br />
              2. Toggle <strong className="text-[#E29E2D]">Developer Mode</strong> in the top right.<br />
              3. Click <strong className="text-[#ECEBE9]">Load Unpacked</strong> and select the <code className="text-[#3C6B4D]">chrome-extension</code> folder in this project root directory.
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] text-[#A3A09B] bg-[#111213] border border-[#2A2D30]/30 px-3.5 py-2.5 rounded-2xl">
            <CheckCircle size={14} className="text-[#3C6B4D] flex-shrink-0" />
            <span>Extension files are generated in the repository root. Ready to load unpack!</span>
          </div>
        </div>
      </div>

      {/* Buttons bottom footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-[#2A2D30]">
        <button
          onClick={purgeAllData}
          className="w-full sm:w-auto py-3 px-6 bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20 hover:bg-[#f87171]/20 rounded-2xl text-xs font-bold transition-all text-center"
        >
          Purge Local Device Data
        </button>

        <button
          onClick={saveSettings}
          className="w-full sm:w-auto py-3 px-8 bg-[#3C6B4D] hover:bg-[#467c59] text-[#ECEBE9] text-xs font-bold rounded-2xl transition-all shadow-md shadow-[#3C6B4D]/10 text-center"
        >
          Save Configurations
        </button>
      </div>
    </div>
  );
};
export default DomoSettings;
