import { useRef, useEffect } from 'react';
import type { Mission, PermissionLevel } from '../types';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Play, ChevronRight, MessageSquare, FileDown } from 'lucide-react';
import { triggerTextDownload } from '../../../utils/sharedHelpers';

interface Props {
  mission: Mission | null;
  permissionLevel: PermissionLevel;
  approvalRequest: { prompt: string; resolve: (approved: boolean) => void } | null;
}

export const MissionConsole = ({ mission, permissionLevel, approvalRequest }: Props) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mission?.logs) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mission?.logs]);

  if (!mission) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 glass-card p-8 text-center select-none">
        <div className="p-4 bg-[#3C6B4D]/10 border border-[#3C6B4D]/25 text-[#3C6B4D] rounded-full mb-4 animate-pulse">
          <MessageSquare size={36} />
        </div>
        <h3 className="text-lg font-bold text-slate-200 mb-2">DomoDomo Auto-Pilot</h3>
        <p className="text-xs max-w-sm text-slate-400 leading-relaxed mb-6">
          I am your local agent. Type a goal or ask a research question in the chat input below, and I will outline and execute a workflow.
        </p>
        <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Permission Level: {permissionLevel === 1 ? 'Research & Chat' : permissionLevel === 2 ? 'App & Files' : 'Full Terminal'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col glass-card overflow-hidden h-full">
      {/* Header */}
      <div className="border-b border-slate-850 p-4 flex justify-between items-center bg-slate-900/40 select-none">
        <div className="overflow-hidden pr-4 text-left">
          <h3 className="font-bold text-[#3C6B4D] text-sm truncate" title={mission.goal}>Goal: {mission.goal}</h3>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status: {mission.status}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-400 font-mono">
            LVL {permissionLevel}
          </span>
        </div>
      </div>

      {/* Main Split */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Steps Column */}
        <div className="w-1/3 border-r border-slate-850 p-4 overflow-y-auto select-none bg-slate-900/10">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Execution Plan</h4>
          <div className="flex flex-col gap-3">
            {mission.steps.length === 0 ? (
              <span className="text-xs text-slate-500 italic">Planning workflow steps...</span>
            ) : (
              mission.steps.map((step, idx) => (
                <div key={step.id} className={`flex items-start gap-2 p-2.5 rounded-xl border border-transparent ${idx === mission.currentStepIndex ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/25' : ''}`}>
                  {idx < mission.currentStepIndex || step.status === 'completed' ? (
                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  ) : step.status === 'failed' ? (
                    <XCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                  ) : idx === mission.currentStepIndex && mission.status === 'running' ? (
                    <Loader2 size={14} className="text-[#3C6B4D] animate-spin mt-0.5 shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-700 mt-0.5 shrink-0" />
                  )}
                  <span className={`text-[11px] leading-relaxed text-left ${idx === mission.currentStepIndex ? 'text-[#3C6B4D] font-bold' : 'text-slate-400'}`}>
                    {step.description}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Logs Column */}
        <div className="w-2/3 p-4 bg-slate-950/70 overflow-y-auto font-mono text-[10px] leading-relaxed flex flex-col gap-2">
          {mission.logs.map((log) => {
            let color = 'text-slate-350';
            let icon = <ChevronRight size={11} className="text-slate-500 mt-0.5 shrink-0" />;
            
            if (log.type === 'error') { 
              color = 'text-red-400 font-semibold'; 
              icon = <XCircle size={11} className="text-red-400 mt-0.5 shrink-0" />; 
            } else if (log.type === 'success') { 
              color = 'text-emerald-400 font-semibold'; 
              icon = <CheckCircle2 size={11} className="text-emerald-400 mt-0.5 shrink-0" />; 
            } else if (log.type === 'reasoning') { 
              color = 'text-purple-300 italic'; 
              icon = <Loader2 size={11} className="text-purple-400 animate-spin mt-0.5 shrink-0" />; 
            } else if (log.type === 'action') { 
              color = 'text-[#3C6B4D] font-bold'; 
              icon = <Play size={11} className="text-[#3C6B4D] mt-0.5 shrink-0" />; 
            } else if (log.type === 'user') {
              color = 'text-blue-300 font-bold border-l-2 border-blue-900/50 pl-2 bg-blue-950/10 py-1 rounded-r-md';
              icon = <MessageSquare size={11} className="text-blue-400 mt-1 shrink-0" />;
            }

            return (
              <div key={log.id} className="flex flex-col gap-1 text-left">
                <div className="flex items-start gap-2">
                  <span className="text-slate-600 w-16 shrink-0 mt-0.5 text-[9px]">
                    [{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                  </span>
                  {icon}
                  <span className={`${color} flex-1 whitespace-pre-wrap`}>{log.message}</span>
                </div>
                {log.details && (
                  <div className="ml-18 mt-1 p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-2 max-w-full overflow-hidden">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 select-none">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Generated Report Output</span>
                      <button 
                        onClick={() => triggerTextDownload(log.details!, 'research_findings.md')}
                        className="px-2 py-1 bg-[#3C6B4D]/10 border border-[#3C6B4D]/25 hover:bg-[#3C6B4D]/25 text-[#3C6B4D] rounded-lg text-[9px] flex items-center gap-1 font-sans transition-all"
                      >
                        <FileDown size={11} /> Download Report
                      </button>
                    </div>
                    <pre className="w-full text-[9.5px] text-slate-400 overflow-x-auto whitespace-pre-wrap max-h-52 font-mono">
                      {log.details}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Approval Overlay */}
      {approvalRequest && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-amber-500/50 p-6 rounded-xl max-w-md w-full shadow-2xl text-left">
            <div className="flex items-center gap-3 mb-4 text-amber-400">
              <AlertCircle size={24} />
              <h3 className="font-bold text-lg">Permission Required</h3>
            </div>
            <p className="text-sm text-slate-300 mb-6">{approvalRequest.prompt}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => approvalRequest.resolve(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold text-sm"
              >
                Deny
              </button>
              <button 
                onClick={() => approvalRequest.resolve(true)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-bold text-sm"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

