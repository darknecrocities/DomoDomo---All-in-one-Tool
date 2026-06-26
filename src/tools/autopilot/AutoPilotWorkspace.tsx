import { useState } from 'react';
import { useAutoPilotEngine } from './AutoPilotProvider';
import { MissionConsole } from './components/MissionConsole';
import { Mic, Send, ShieldAlert, BookOpen, Layers } from 'lucide-react';

export const AutoPilotWorkspace = () => {
  const {
    mission,
    permissionLevel,
    setPermissionLevel,
    approvalRequest,
    startMission,
    selectedModel,
    setSelectedModel,
    voiceEnabled,
    setVoiceEnabled
  } = useAutoPilotEngine();

  const [inputGoal, setInputGoal] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleStart = () => {
    if (!inputGoal.trim()) return;
    startMission(inputGoal);
    setInputGoal('');
  };

  const toggleListen = () => {
    if (isListening) return; // Currently handling stop inherently via onend
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => setIsListening(true);
    
    rec.onresult = (e: any) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final) {
        setInputGoal(prev => prev + ' ' + final.trim());
      }
    };

    rec.onend = () => {
      setIsListening(false);
      // Wait a tick, then start mission if we captured something
      setTimeout(() => {
        setInputGoal((currentVal) => {
          if (currentVal.trim() && currentVal.length > 3) {
            startMission(currentVal.trim());
            return '';
          }
          return currentVal;
        });
      }, 500);
    };

    rec.onerror = (e: any) => {
      console.error('Speech error:', e);
      setIsListening(false);
    };

    rec.start();
  };

  return (
    <div className="h-full flex gap-4 p-4 text-left">
      
      {/* Left Sidebar */}
      <div className="w-64 flex flex-col gap-4">
        <div className="glass-card p-4">
          <h3 className="font-bold text-teal-400 mb-4 flex items-center gap-2">
            <Layers size={18} /> Modes
          </h3>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setPermissionLevel(1)}
              className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-colors ${permissionLevel === 1 ? 'bg-teal-900/30 border-teal-500/50' : 'bg-slate-900 border-slate-800'}`}
            >
              <div className="flex items-center gap-2 text-sm font-bold text-teal-300"><BookOpen size={14} /> Level 1 (Research)</div>
              <span className="text-[10px] text-slate-400">Conversational AI. Answers questions about Domo and the web. Safe mode.</span>
            </button>
            <button 
              onClick={() => setPermissionLevel(2)}
              className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-colors ${permissionLevel === 2 ? 'bg-blue-900/30 border-blue-500/50' : 'bg-slate-900 border-slate-800'}`}
            >
              <div className="flex items-center gap-2 text-sm font-bold text-blue-300"><Layers size={14} /> Level 2 (App Mastery)</div>
              <span className="text-[10px] text-slate-400">Command Domo, edit/read files, and use UI tools virtually.</span>
            </button>
            <button 
              onClick={() => setPermissionLevel(3)}
              className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-colors ${permissionLevel === 3 ? 'bg-rose-900/30 border-rose-500/50' : 'bg-slate-900 border-slate-800'}`}
            >
              <div className="flex items-center gap-2 text-sm font-bold text-rose-300"><ShieldAlert size={14} /> Level 3 (OS Control)</div>
              <span className="text-[10px] text-slate-400">Physical computer control. Live tabbing, clicking, writing. DANGEROUS.</span>
            </button>
          </div>
        </div>

        <div className="glass-card p-4">
          <h3 className="font-bold text-slate-300 mb-3 text-sm flex items-center gap-2">
            <ShieldAlert size={16} className="text-slate-500" /> Planner Model
          </h3>
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-sm text-slate-300 rounded p-2 outline-none focus:border-teal-500 transition-colors"
          >
            <option value="llama3.2">Llama 3.2</option>
            <option value="qwen2.5">Qwen 2.5</option>
            <option value="gemma2">Gemma 2</option>
            <option value="llava">Llava</option>
            <option value="mistral">Mistral</option>
          </select>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-300 text-sm flex items-center gap-2">
              <Mic size={16} className="text-slate-500" /> Voice Output
            </h3>
            <button 
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${voiceEnabled ? 'bg-teal-500' : 'bg-slate-700'}`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${voiceEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Auto-Pilot will speak its final response aloud.</p>
        </div>

        <div className="glass-card p-4 flex-1">
          <h3 className="font-bold text-slate-300 mb-4 text-sm">Recent Missions</h3>
          <div className="text-xs text-slate-500 italic text-center py-4">No recent missions</div>
        </div>
      </div>

      {/* Center Console */}
      <div className="flex-1 flex flex-col gap-4">
        <MissionConsole 
          mission={mission} 
          permissionLevel={permissionLevel} 
          approvalRequest={approvalRequest}
        />

        {/* Input Area */}
        <div className={`glass-card p-3 flex items-center gap-3 transition-all ${isListening ? 'border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]' : ''}`}>
          <button 
            onClick={toggleListen}
            className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`}
          >
            <Mic size={18} />
          </button>
          <input
            type="text"
            value={inputGoal}
            onChange={(e) => setInputGoal(e.target.value)}
            placeholder="What is our mission today? e.g., 'Research the latest React updates and create a summary file'"
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-200 placeholder-slate-500"
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          />
          <button 
            onClick={handleStart}
            disabled={!inputGoal.trim() || mission?.status === 'running' || mission?.status === 'planning'}
            className="p-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:hover:bg-teal-600 rounded-full text-white transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

    </div>
  );
};
