import React from 'react';
import { useAutoPilotEngine } from '../AutoPilotProvider';
import { MissionConsole } from './MissionConsole';
import { X, Minimize2, Maximize2 } from 'lucide-react';

export const FloatingAutoPilot = () => {
  const { mission, permissionLevel, approvalRequest, isFloatingVisible, setFloatingVisible } = useAutoPilotEngine();
  const [isMinimized, setIsMinimized] = React.useState(false);

  // If there's no mission active, don't show the widget unless an approval is requested
  if (!mission && !approvalRequest) return null;
  if (!isFloatingVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] shadow-2xl transition-all duration-300 ease-in-out" 
         style={{ width: isMinimized ? '300px' : '600px', height: isMinimized ? 'auto' : '400px' }}>
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col h-full shadow-2xl">
        {/* Drag Handle / Header */}
        <div className="bg-slate-800 p-2 flex justify-between items-center cursor-move border-b border-slate-700">
          <div className="flex items-center gap-2 px-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-300">Auto-Pilot Active</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <button onClick={() => setIsMinimized(!isMinimized)} className="hover:text-white">
              {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
            <button onClick={() => setFloatingVisible(false)} className="hover:text-red-400">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="flex-1 overflow-hidden relative">
            <MissionConsole 
              mission={mission} 
              permissionLevel={permissionLevel} 
              approvalRequest={approvalRequest} 
            />
          </div>
        )}
      </div>
    </div>
  );
};
