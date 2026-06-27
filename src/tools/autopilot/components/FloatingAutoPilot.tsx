import React from 'react';
import { useAutoPilotEngine } from '../AutoPilotProvider';
import { MissionConsole } from './MissionConsole';
import { X, Minimize2, Maximize2 } from 'lucide-react';

export const FloatingAutoPilot = () => {
  const { 
    mission, 
    permissionLevel, 
    approvalRequest, 
    isFloatingVisible, 
    setFloatingVisible,
    isListening,
    toggleListen,
    inputGoal
  } = useAutoPilotEngine();
  
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  
  const dragRef = React.useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    
    // Prevent dragging if clicking buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;

    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragRef.current.isDragging) return;
    
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    
    setPosition({
      x: dragRef.current.posX + deltaX,
      y: dragRef.current.posY + deltaY
    });
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // If there's no mission active, don't show the widget unless an approval or voice recording is active
  if (!mission && !approvalRequest && !isListening) return null;
  if (!isFloatingVisible) return null;
  
  // Do not render the floating widget if the user is already on the dedicated auto-pilot workspace page
  if (window.location.hash.includes('/tools/auto-pilot')) return null;

  return (
    <div 
      className="fixed z-[9999] shadow-2xl transition-shadow duration-300 select-none" 
      style={{ 
        width: isMinimized ? '300px' : '600px', 
        height: isMinimized ? 'auto' : '400px',
        bottom: '16px',
        right: '16px',
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col h-full shadow-2xl">
        {/* Drag Handle / Header */}
        <div 
          onMouseDown={handleMouseDown}
          className="bg-slate-800 p-2 flex justify-between items-center cursor-move border-b border-slate-700 select-none active:bg-slate-750"
        >
          <div className="flex items-center gap-2 px-2 pointer-events-none">
            <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-[#3C6B4D] animate-pulse'}`}></span>
            <span className="text-xs font-bold text-slate-300">{isListening ? 'Speech Lock Active' : 'Auto-Pilot Active'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <button onClick={() => setIsMinimized(!isMinimized)} className="hover:text-white p-1">
              {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
            <button onClick={() => setFloatingVisible(false)} className="hover:text-red-400 p-1">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <MissionConsole 
              mission={mission} 
              permissionLevel={permissionLevel} 
              approvalRequest={approvalRequest} 
            />
          </div>
        )}

        {/* Continuous Voice Lock Footer */}
        {isListening && (
          <div className="bg-slate-950 border-t border-slate-800 p-2.5 flex items-center justify-between gap-3 select-none">
            <div className="flex items-center gap-2 pr-2 text-left min-w-0">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping shrink-0" />
              <div className="overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Listening lock active</span>
                <span className="text-[9px] text-slate-500 italic truncate block font-mono max-w-[180px] md:max-w-[350px]">
                  {inputGoal || 'Start speaking...'}
                </span>
              </div>
            </div>
            <button
              onClick={toggleListen}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-[9px] flex items-center gap-1 font-sans transition-all shrink-0 animate-bounce cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.3)]"
            >
              Done Speaking
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
