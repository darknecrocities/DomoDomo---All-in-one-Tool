import type { Mission, PermissionLevel } from '../types';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Play, ChevronRight } from 'lucide-react';

interface Props {
  mission: Mission | null;
  permissionLevel: PermissionLevel;
  approvalRequest: { prompt: string; resolve: (approved: boolean) => void } | null;
}

export const MissionConsole = ({ mission, permissionLevel, approvalRequest }: Props) => {
  if (!mission) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 glass-card p-6 text-center">
        <h3 className="text-xl font-bold mb-3">DomoDomo Auto-Pilot</h3>
        <p className="text-sm max-w-md">How can I assist you further today? Is there something on your mind that you'd like to chat about or any tasks you need help with?</p>
        <p className="text-xs mt-6 text-slate-600">Current Permission Level: {permissionLevel}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col glass-card overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-800 p-4 flex justify-between items-center bg-slate-900/50">
        <div>
          <h3 className="font-bold text-teal-400">Mission: {mission.goal}</h3>
          <span className="text-xs text-slate-400">Status: {mission.status.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-slate-800 rounded text-xs">Level {permissionLevel}</span>
        </div>
      </div>

      {/* Main Split */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Steps Column */}
        <div className="w-1/3 border-r border-slate-800 p-4 overflow-y-auto">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Execution Plan</h4>
          <div className="flex flex-col gap-3">
            {mission.steps.length === 0 ? (
              <span className="text-xs text-slate-500 italic">Planning...</span>
            ) : (
              mission.steps.map((step, idx) => (
                <div key={step.id} className={`flex items-start gap-2 p-2 rounded ${idx === mission.currentStepIndex ? 'bg-teal-900/20 border border-teal-900/30' : ''}`}>
                  {idx < mission.currentStepIndex ? <CheckCircle2 size={14} className="text-green-500 mt-0.5" /> : 
                   idx === mission.currentStepIndex && mission.status === 'running' ? <Loader2 size={14} className="text-teal-400 animate-spin mt-0.5" /> : 
                   <div className="w-3.5 h-3.5 rounded-full border border-slate-600 mt-0.5" />}
                  <span className={`text-xs ${idx === mission.currentStepIndex ? 'text-teal-300 font-bold' : 'text-slate-400'}`}>
                    {step.description}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Logs Column */}
        <div className="w-2/3 p-4 bg-slate-950/80 overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col gap-1.5">
          {mission.logs.map((log) => {
            let color = 'text-slate-300';
            let icon = <ChevronRight size={12} className="text-slate-500" />;
            if (log.type === 'error') { color = 'text-red-400'; icon = <XCircle size={12} className="text-red-500" />; }
            if (log.type === 'success') { color = 'text-green-400'; icon = <CheckCircle2 size={12} className="text-green-500" />; }
            if (log.type === 'reasoning') { color = 'text-purple-300 italic'; icon = <Loader2 size={12} className="text-purple-400" />; }
            if (log.type === 'action') { color = 'text-teal-300 font-bold'; icon = <Play size={12} className="text-teal-500" />; }

            return (
              <div key={log.id} className="flex items-start gap-2">
                <span className="text-slate-600 w-16 shrink-0 mt-0.5">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className="shrink-0 mt-0.5">{icon}</span>
                <span className={color}>{log.message}</span>
                {log.details && <pre className="w-full text-[9px] text-slate-500 bg-slate-900 p-1 mt-1 rounded">{log.details}</pre>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Approval Overlay */}
      {approvalRequest && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-amber-500/50 p-6 rounded-xl max-w-md w-full shadow-2xl">
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
