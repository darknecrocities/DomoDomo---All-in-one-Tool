import { useState, useRef } from 'react';
import { useAutoPilotEngine } from './AutoPilotProvider';
import { MissionConsole } from './components/MissionConsole';
import { Mic, Send, ShieldAlert, BookOpen, Layers, RefreshCw, FileDown, FolderSync, Trash2, ShieldCheck, Terminal, Upload, Paperclip, X } from 'lucide-react';
import { triggerTextDownload } from '../../utils/sharedHelpers';

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
    setVoiceEnabled,
    mcpOnline,
    availableMcpTools,
    syncMcp,
    clearMission,
    uploadedFiles,
    addUploadedFile,
    removeUploadedFile,
    inputGoal,
    setInputGoal,
    isListening,
    toggleListen,
    autoApproveLevel3,
    setAutoApproveLevel3
  } = useAutoPilotEngine();

  const [isSyncing, setIsSyncing] = useState(false);
  const isSubmittingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStart = () => {
    const goal = inputGoal.trim();
    if (!goal || isSubmittingRef.current) return;
    
    isSubmittingRef.current = true;
    setInputGoal('');
    startMission(goal);
    
    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 1000);
  };

  const handleSyncMcp = async () => {
    setIsSyncing(true);
    await syncMcp();
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const fileType = file.type;
    const isImage = fileType.startsWith('image/');

    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (isImage) {
        const rawBase64 = result.split(',')[1];
        addUploadedFile({
          name: file.name,
          type: fileType,
          size: file.size,
          content: result,
          base64Raw: rawBase64
        });
      } else {
        addUploadedFile({
          name: file.name,
          type: fileType,
          size: file.size,
          content: result
        });
      }
    };

    if (isImage) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  return (
    <div className="h-full flex gap-4 p-4 text-left">
      
      {/* Left Sidebar */}
      <div className="w-80 flex flex-col gap-4 overflow-y-auto shrink-0 select-none pr-1">
        
        {/* Permission Levels / Modes */}
        <div className="glass-card p-4">
          <h3 className="font-bold text-[#3C6B4D] mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Layers size={16} /> Permission Level
          </h3>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setPermissionLevel(1)}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${permissionLevel === 1 ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/25 shadow-[0_0_10px_rgba(60,107,77,0.1)]' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-[#3C6B4D]">
                <BookOpen size={12} /> Level 1: Research & Chat
              </div>
              <span className="text-[10px] text-slate-400 leading-relaxed">
                Safe mode. Conversational assistant, deep web search, and generating text/markdown findings.
              </span>
            </button>
            
            <button 
              onClick={() => setPermissionLevel(2)}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${permissionLevel === 2 ? 'bg-blue-950/20 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                <Terminal size={12} /> Level 2: App & File Access
              </div>
              <span className="text-[10px] text-slate-400 leading-relaxed">
                Reads/writes local workspace files. UI interaction support. Requires approval for writes.
              </span>
            </button>
            
            <button 
              onClick={() => setPermissionLevel(3)}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${permissionLevel === 3 ? 'bg-rose-950/20 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.1)]' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                <ShieldAlert size={12} /> Level 3: Terminal Control
              </div>
              <span className="text-[10px] text-slate-400 leading-relaxed">
                Raw terminal commands execution on host machine. High privilege. Confirmation required.
              </span>
            </button>
          </div>
        </div>

        {/* Model and Voice Options */}
        <div className="glass-card p-4 grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Model</span>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg p-2 outline-none focus:border-[#3C6B4D]/50 transition-colors"
            >
              <option value="llama3.2">Llama 3.2</option>
              <option value="qwen2.5">Qwen 2.5</option>
              <option value="gemma2">Gemma 2</option>
              <option value="llava">Llava</option>
              <option value="mistral">Mistral</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voice Speech</span>
            <div className="flex items-center justify-between h-[34px] bg-slate-900 border border-slate-800 rounded-lg px-2">
              <span className="text-[10px] text-slate-400">TTS Output</span>
              <button 
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${voiceEnabled ? 'bg-[#3C6B4D]' : 'bg-slate-700'}`}
              >
                <span className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${voiceEnabled ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level 3 Control</span>
            <div className="flex items-center justify-between h-[34px] bg-slate-900 border border-slate-800 rounded-lg px-2">
              <span className="text-[10px] text-slate-400">Auto-Run</span>
              <button 
                onClick={() => setAutoApproveLevel3(!autoApproveLevel3)}
                className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${autoApproveLevel3 ? 'bg-rose-600' : 'bg-slate-700'}`}
                title="Bypass confirmation approvals for all Level 3 actions"
              >
                <span className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${autoApproveLevel3 ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* MCP Server Integration Status */}
        <div className="glass-card p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FolderSync size={14} className="text-slate-500" /> Domo MCP Bridge
            </h3>
            <button 
              onClick={handleSyncMcp}
              disabled={isSyncing}
              title="Sync tools from MCP server"
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-[#3C6B4D] transition-all disabled:opacity-50"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-900 p-2.5 rounded-xl">
            <span className={`relative flex h-2 w-2`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${mcpOnline ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${mcpOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-[11px] font-bold text-slate-300">
              {mcpOnline ? 'Local Server Connected (3001)' : 'Offline / Simulated Mode'}
            </span>
          </div>

          {mcpOnline ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] text-slate-500 uppercase font-bold">Active MCP Tools</span>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {availableMcpTools.map(t => (
                  <span key={t} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 font-mono text-[9px] text-[#3C6B4D] rounded-md">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 leading-relaxed">
              No local server detected. To run real terminal commands and file edits, start the server in your command prompt: 
              <code className="block bg-slate-900 p-1 text-[9px] text-[#3C6B4D] font-mono mt-1 border border-slate-800 rounded">npm run mcp</code>
            </p>
          )}
        </div>

        {/* Session Files & Images */}
        <div className="glass-card p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center select-none">
            <h3 className="font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Paperclip size={14} className="text-[#3C6B4D]" /> Session Context Files
            </h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-[#3C6B4D] hover:bg-[#3C6B4D]/10 rounded text-[9px] flex items-center gap-1 font-sans transition-all"
            >
              <Upload size={10} /> Upload
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.txt,.json,.csv,.md,.js,.ts,.html,.css"
            />
          </div>

          {uploadedFiles.length === 0 ? (
            <p className="text-[10px] text-slate-500 italic leading-relaxed">No files uploaded. Files uploaded here are automatically referenced by the LLM Planner.</p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
              {uploadedFiles.map(file => (
                <div key={file.name} className="flex justify-between items-center p-2 bg-slate-900/60 border border-slate-850 rounded-xl text-[10px]">
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    {file.type.startsWith('image/') ? (
                      <img src={file.content} className="w-5 h-5 rounded object-cover border border-slate-750 shrink-0" alt="" />
                    ) : (
                      <div className="w-5 h-5 bg-[#3C6B4D]/10 border border-[#3C6B4D]/25 rounded flex items-center justify-center font-bold text-[8px] text-[#3C6B4D] font-mono shrink-0">
                        DOC
                      </div>
                    )}
                    <span className="text-slate-350 truncate font-mono text-[9px]" title={file.name}>{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeUploadedFile(file.name)}
                    className="p-1 hover:bg-slate-850 rounded text-slate-500 hover:text-red-400 transition-all shrink-0"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security & Guardrails Panel */}
        <div className="glass-card p-4 flex flex-col gap-2">
          <h3 className="font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-500" /> Security Guardrails
          </h3>
          <div className="flex flex-col gap-1.5 text-[10px] text-slate-400">
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span>Execution Approval:</span>
              <span className="font-bold text-[#3C6B4D]">Required</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span>Write Confirmation:</span>
              <span className="font-bold text-[#3C6B4D]">{permissionLevel >= 2 ? 'Enabled' : 'Restricted'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1">
              <span>Hazardous Commands:</span>
              <span className="font-bold text-rose-400">Blocked</span>
            </div>
            <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/50 mt-1">
              <span className="text-[9px] font-bold text-slate-500 block uppercase mb-1">Blocked Signatures</span>
              <code className="text-[9px] font-mono text-rose-300 leading-relaxed block">
                rm -rf, del /s, format, rmdir, shred, mkfs, dd
              </code>
            </div>
          </div>
        </div>

        {/* Generated Artifacts / Findings */}
        <div className="glass-card p-4 flex-1 flex flex-col gap-3 min-h-[150px]">
          <h3 className="font-bold text-slate-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <FileDown size={14} className="text-slate-400" /> Research Findings
          </h3>
          
          {mission?.artifacts && mission.artifacts.length > 0 ? (
            <div className="flex flex-col gap-2 overflow-y-auto flex-1 max-h-[220px] pr-1">
              {mission.artifacts.map(art => (
                <div key={art.id} className="flex justify-between items-center p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all">
                  <div className="flex flex-col gap-0.5 overflow-hidden pr-2">
                    <span className="text-[11px] font-bold text-slate-200 truncate" title={art.name}>
                       {art.name}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {art.type.toUpperCase()} • {new Date(art.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <button 
                    onClick={() => triggerTextDownload(art.content, art.name)}
                    className="p-1.5 bg-[#3C6B4D]/10 border border-[#3C6B4D]/25 hover:bg-[#3C6B4D]/25 text-[#3C6B4D] hover:text-[#4D8B63] transition-all shrink-0"
                    title="Download Report"
                  >
                    <FileDown size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-slate-500 italic text-center py-8 flex-1 flex items-center justify-center border border-dashed border-slate-800 rounded-xl">
              No reports generated yet. Ask me to "research" a topic!
            </div>
          )}
        </div>

      </div>

      {/* Center Console */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
        <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
          
          {/* Header Action Bar */}
          {mission && (
            <button 
              onClick={clearMission}
              className="absolute top-3 right-3 z-10 p-1.5 bg-slate-900 border border-slate-800 hover:border-rose-900/40 hover:text-rose-400 rounded-lg text-slate-500 text-xs flex items-center gap-1.5 transition-all shadow-md"
              title="Reset conversation and start fresh"
            >
              <Trash2 size={12} /> Clear Chat
            </button>
          )}

          <MissionConsole 
            mission={mission} 
            permissionLevel={permissionLevel} 
            approvalRequest={approvalRequest}
          />
        </div>

        {/* Input Area */}
        <div className={`glass-card p-3 flex items-center gap-3 transition-all ${isListening ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}>
          <button 
            onClick={toggleListen}
            className={`p-2.5 rounded-xl transition-all ${isListening ? 'bg-red-650 hover:bg-red-550 text-white animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-350'}`}
            title="Speech-to-text input"
          >
            <Mic size={18} />
          </button>
          <input
            type="text"
            value={inputGoal}
            onChange={(e) => setInputGoal(e.target.value)}
            placeholder={
              mission && (mission.status === 'completed' || mission.status === 'failed' || mission.status === 'idle')
                ? "Enter follow-up request or refine results..."
                : "What is our mission today? e.g., 'Research machine learning and generate findings'"
            }
            className="flex-1 bg-transparent border-none focus:outline-none text-xs text-slate-200 placeholder-slate-500"
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          />
          {isListening ? (
            <button
              onClick={toggleListen}
              className="px-3.5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-[10px] flex items-center gap-1.5 font-sans transition-all shrink-0 animate-bounce cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.4)]"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-ping shrink-0" />
              Done Speaking
            </button>
          ) : (
            <button 
              onClick={handleStart}
              disabled={!inputGoal.trim() || mission?.status === 'running' || mission?.status === 'planning'}
              className="p-2.5 bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-30 disabled:hover:bg-[#3C6B4D] rounded-xl text-white transition-all shadow-[0_0_15px_rgba(60,107,77,0.15)] disabled:shadow-none"
            >
              <Send size={18} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
