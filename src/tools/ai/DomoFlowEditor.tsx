import React, { useState } from 'react';
import { N8nFlowCanvas } from './components/N8nFlowCanvas';
import { Cpu, Layers, ListFilter } from 'lucide-react';

export const DomoFlowEditor: React.FC = () => {
  const [viewMode, setViewMode] = useState<'n8n-canvas' | 'classic'>('n8n-canvas');

  return (
    <div className="flex flex-col h-full bg-[#111213] text-[#ECEBE9] font-sans p-4 sm:p-6 rounded-3xl border border-[#2A2D30] overflow-hidden space-y-4">
      {/* Top Selector Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A2D30] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-[#3C6B4D]/20 text-[#3C6B4D] border border-[#3C6B4D]/30">
              <Cpu size={20} className="animate-pulse" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#ECEBE9]">Domo AI Flow Orchestrator &amp; n8n Canvas</h1>
          </div>
          <p className="text-xs text-[#A3A09B]">
            Construct, drag, wire, and execute automated multi-stage local LLM processing pipelines on an n8n-style visual graph canvas.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#18191B] border border-[#2A2D30] p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setViewMode('n8n-canvas')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'n8n-canvas' ? 'bg-[#3C6B4D] text-white shadow-md' : 'text-[#72706C] hover:text-[#ECEBE9]'
            }`}
          >
            <Layers size={13} />
            <span>n8n Visual Board</span>
          </button>
          <button
            onClick={() => setViewMode('classic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'classic' ? 'bg-[#3C6B4D] text-white shadow-md' : 'text-[#72706C] hover:text-[#ECEBE9]'
            }`}
          >
            <ListFilter size={13} />
            <span>Sequential View</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Component View */}
      <div className="flex-1 min-h-[700px]">
        {viewMode === 'n8n-canvas' ? (
          <N8nFlowCanvas initialWorkflowId="battlecard-bot" />
        ) : (
          <N8nFlowCanvas initialWorkflowId="document-rag" />
        )}
      </div>
    </div>
  );
};

export default DomoFlowEditor;

