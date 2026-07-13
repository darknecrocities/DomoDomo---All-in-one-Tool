import React, { useState } from 'react';
import { aiService } from '../../utils/aiService';
import { Play, Plus, Trash2, ArrowRight, Sparkles, Cpu, Settings, FileText, CheckCircle, RefreshCw } from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'input' | 'summarize' | 'translate' | 'rewriter' | 'sentiment' | 'email' | 'code-review';
  label: string;
  config: Record<string, any>;
  output: string;
  status: 'idle' | 'running' | 'completed' | 'error';
}

export const DomoFlowEditor: React.FC = () => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { 
      id: 'step_1', 
      type: 'input', 
      label: '1. Text Input Source', 
      config: { value: 'DomoDomo is an offline-first browser utility toolbox. It performs optical character recognition (OCR), voice synthesis (TTS), video transcoding via FFmpeg.wasm, and local LLM execution using Ollama endpoints.' }, 
      output: '', 
      status: 'idle' 
    },
    { 
      id: 'step_2', 
      type: 'summarize', 
      label: '2. Local Summarizer', 
      config: { maxTokens: 200 }, 
      output: '', 
      status: 'idle' 
    },
    { 
      id: 'step_3', 
      type: 'translate', 
      label: '3. Local Translator', 
      config: { targetLang: 'Spanish' }, 
      output: '', 
      status: 'idle' 
    }
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [workflowOutput, setWorkflowOutput] = useState('');

  const addNode = (type: WorkflowNode['type']) => {
    const nextId = `step_${nodes.length + 1}`;
    let label = '';
    let config = {};

    switch (type) {
      case 'summarize':
        label = `${nodes.length + 1}. Local Summarizer`;
        config = { maxTokens: 200 };
        break;
      case 'translate':
        label = `${nodes.length + 1}. Local Translator`;
        config = { targetLang: 'Spanish' };
        break;
      case 'rewriter':
        label = `${nodes.length + 1}. Text Rewriter`;
        config = { tone: 'Corporate/Professional' };
        break;
      case 'sentiment':
        label = `${nodes.length + 1}. Mood Analyzer`;
        config = {};
        break;
      case 'email':
        label = `${nodes.length + 1}. Email Draft Composer`;
        config = { senderName: 'Domo Agent' };
        break;
      case 'code-review':
        label = `${nodes.length + 1}. Code Reviewer`;
        config = {};
        break;
    }

    setNodes([...nodes, { id: nextId, type, label, config, output: '', status: 'idle' }]);
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
  };

  const updateNodeConfig = (id: string, key: string, val: any) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, config: { ...n.config, [key]: val } } : n));
  };

  const executeWorkflow = async () => {
    setIsExecuting(true);
    setWorkflowOutput('');
    const updatedNodes = [...nodes];
    for (const node of updatedNodes) {
      node.status = 'idle';
      node.output = '';
    }
    setNodes(updatedNodes);

    let activeData = '';

    for (let i = 0; i < updatedNodes.length; i++) {
      const node = updatedNodes[i];
      node.status = 'running';
      setNodes([...updatedNodes]);

      try {
        if (node.type === 'input') {
          activeData = node.config.value || '';
          node.output = activeData;
        } else if (node.type === 'summarize') {
          const prompt = `Summarize the following text concisely. Target length: maximum 2 sentences.\n\nInput Text:\n${activeData}`;
          activeData = await aiService.generateText(prompt, node.config.maxTokens || 200, undefined, undefined, {
            systemPrompt: 'You are a professional text summarizer. Write a concise summary.'
          });
          node.output = activeData;
        } else if (node.type === 'translate') {
          const prompt = `Translate the following text to ${node.config.targetLang || 'French'}. Preserve the tone. Do not write any introduction.\n\nText:\n${activeData}`;
          activeData = await aiService.generateText(prompt, 300, undefined, undefined, {
            systemPrompt: 'You are an accurate offline translator.'
          });
          node.output = activeData;
        } else if (node.type === 'rewriter') {
          const prompt = `Rewrite the following text in a ${node.config.tone || 'casual'} tone. Do not write any conversational preamble.\n\nText:\n${activeData}`;
          activeData = await aiService.generateText(prompt, 300, undefined, undefined, {
            systemPrompt: 'You are a professional text rewriter.'
          });
          node.output = activeData;
        } else if (node.type === 'sentiment') {
          const prompt = `Analyze the emotional sentiment, mood, and core theme of the text below. List the top emotions detected.\n\nText:\n${activeData}`;
          activeData = await aiService.generateText(prompt, 200, undefined, undefined, {
            systemPrompt: 'You are a cognitive sentiment evaluator.'
          });
          node.output = activeData;
        } else if (node.type === 'email') {
          const prompt = `Compose a draft email incorporating the following instructions and text details. Sign it off as ${node.config.senderName || 'Domo'}.\n\nContext details:\n${activeData}`;
          activeData = await aiService.generateText(prompt, 400, undefined, undefined, {
            systemPrompt: 'You are a professional email drafting secretary.'
          });
          node.output = activeData;
        } else if (node.type === 'code-review') {
          const prompt = `Perform a static security and code review of this input block. Detail potential bugs or structural cleanups.\n\nSource:\n${activeData}`;
          activeData = await aiService.generateText(prompt, 600, undefined, undefined, {
            systemPrompt: 'You are an expert static auditor.'
          });
          node.output = activeData;
        }

        node.status = 'completed';
      } catch (err: any) {
        node.status = 'error';
        node.output = `Error during processing: ${err.message || String(err)}`;
        activeData = '';
      }
      setNodes([...updatedNodes]);
      
      // Artificial delay for visualization smoothness
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setIsExecuting(false);
    setWorkflowOutput(activeData);
  };

  return (
    <div className="flex flex-col h-full bg-[#111213] text-[#ECEBE9] font-sans p-6 rounded-3xl border border-[#2A2D30] overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[#2A2D30] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20">
              <Cpu size={20} className="animate-pulse" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Domo AI Flow Orchestrator</h1>
          </div>
          <p className="text-xs text-[#A3A09B]">
            Construct, wire, and execute automated multi-stage local LLM processing pipelines entirely offline.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Node Adders */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#18191B] border border-[#2A2D30] rounded-xl hover:border-[#3C6B4D] hover:text-[#3C6B4D] text-xs font-bold transition-all">
              <Plus size={14} />
              Add Pipeline Node
            </button>
            <div className="absolute right-0 top-full mt-2 w-52 bg-[#18191B] border border-[#2A2D30] rounded-xl shadow-2xl p-2 hidden group-hover:block hover:block z-30">
              <button onClick={() => addNode('summarize')} className="w-full text-left px-3 py-2 text-[11px] hover:bg-[#2A2D30] rounded-lg transition-colors flex items-center gap-2"><Sparkles size={12} /> Summarizer</button>
              <button onClick={() => addNode('translate')} className="w-full text-left px-3 py-2 text-[11px] hover:bg-[#2A2D30] rounded-lg transition-colors flex items-center gap-2"><ArrowRight size={12} /> Translator</button>
              <button onClick={() => addNode('rewriter')} className="w-full text-left px-3 py-2 text-[11px] hover:bg-[#2A2D30] rounded-lg transition-colors flex items-center gap-2"><FileText size={12} /> Rewriter</button>
              <button onClick={() => addNode('sentiment')} className="w-full text-left px-3 py-2 text-[11px] hover:bg-[#2A2D30] rounded-lg transition-colors flex items-center gap-2"><Sparkles size={12} /> Mood Analyzer</button>
              <button onClick={() => addNode('email')} className="w-full text-left px-3 py-2 text-[11px] hover:bg-[#2A2D30] rounded-lg transition-colors flex items-center gap-2"><Settings size={12} /> Email Composer</button>
              <button onClick={() => addNode('code-review')} className="w-full text-left px-3 py-2 text-[11px] hover:bg-[#2A2D30] rounded-lg transition-colors flex items-center gap-2"><Cpu size={12} /> Code Reviewer</button>
            </div>
          </div>

          <button
            onClick={executeWorkflow}
            disabled={isExecuting || nodes.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#3C6B4D] hover:bg-[#467c59] disabled:opacity-50 text-[#ECEBE9] text-xs font-bold rounded-xl transition-all shadow-md shadow-[#3C6B4D]/10"
          >
            {isExecuting ? <RefreshCw className="animate-spin" size={14} /> : <Play size={14} />}
            Execute Flow
          </button>
        </div>
      </div>

      {/* Workspace Panel */}
      <div className="flex flex-col lg:flex-row flex-grow gap-6 min-h-0 overflow-hidden">
        {/* Nodes Timeline Canvas */}
        <div className="flex-grow bg-[#18191B]/40 rounded-3xl border border-[#2A2D30] p-6 overflow-y-auto flex flex-col gap-8 relative select-none">
          <div className="absolute inset-0 bg-[radial-gradient(#2A2D30_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

          {nodes.map((node, index) => {
            const isFirst = index === 0;
            return (
              <React.Fragment key={node.id}>
                {/* Arrow connector wire between steps */}
                {!isFirst && (
                  <div className="flex justify-center -my-4 z-10">
                    <div className={`p-1.5 rounded-full border ${
                      nodes[index - 1].status === 'completed' && node.status === 'running' 
                        ? 'border-[#3C6B4D] bg-[#3C6B4D]/10 text-[#3C6B4D] animate-bounce' 
                        : 'border-[#2A2D30] bg-[#18191B] text-[#A3A09B]'
                    }`}>
                      <ArrowRight size={14} className="rotate-90" />
                    </div>
                  </div>
                )}

                {/* Node Box card */}
                <div className={`relative bg-[#18191B] border rounded-3xl p-5 shadow-lg transition-all ${
                  node.status === 'running' ? 'border-[#3C6B4D] shadow-[#3C6B4D]/5 ring-1 ring-[#3C6B4D]' :
                  node.status === 'completed' ? 'border-[#3C6B4D]/50 bg-[#18191B]' : 'border-[#2A2D30]'
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        node.status === 'running' ? 'bg-[#3C6B4D] animate-ping' :
                        node.status === 'completed' ? 'bg-[#3C6B4D]' :
                        node.status === 'error' ? 'bg-red-400' : 'bg-[#A3A09B]'
                      }`} />
                      <span className="text-xs font-black tracking-wider text-[#ECEBE9]">{node.label}</span>
                    </div>
                    
                    {!isFirst && (
                      <button 
                        onClick={() => removeNode(node.id)}
                        className="text-[#A3A09B] hover:text-red-400 transition-colors p-1"
                        title="Delete Step"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {/* Config Block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#111213]/40 p-3.5 rounded-2xl border border-[#2A2D30]/40">
                    {node.type === 'input' && (
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-[#A3A09B] block mb-1">Source Payload (Text)</label>
                        <textarea
                          value={node.config.value || ''}
                          onChange={(e) => updateNodeConfig(node.id, 'value', e.target.value)}
                          rows={2}
                          className="w-full bg-[#18191B] border border-[#2A2D30] rounded-xl text-xs font-semibold px-3 py-2 text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
                        />
                      </div>
                    )}

                    {node.type === 'summarize' && (
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-[#A3A09B] block mb-1">Max Summary Tokens</label>
                        <input
                          type="number"
                          value={node.config.maxTokens || 200}
                          onChange={(e) => updateNodeConfig(node.id, 'maxTokens', parseInt(e.target.value) || 100)}
                          className="w-full bg-[#18191B] border border-[#2A2D30] rounded-xl text-xs font-semibold px-3 py-1.5 text-[#ECEBE9] focus:outline-none"
                        />
                      </div>
                    )}

                    {node.type === 'translate' && (
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-[#A3A09B] block mb-1">Language Target</label>
                        <select
                          value={node.config.targetLang || 'French'}
                          onChange={(e) => updateNodeConfig(node.id, 'targetLang', e.target.value)}
                          className="w-full bg-[#18191B] border border-[#2A2D30] rounded-xl text-xs font-semibold px-3 py-1.5 text-[#ECEBE9] focus:outline-none"
                        >
                          <option>French</option>
                          <option>Spanish</option>
                          <option>German</option>
                          <option>Japanese</option>
                          <option>Tagalog</option>
                        </select>
                      </div>
                    )}

                    {node.type === 'rewriter' && (
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-[#A3A09B] block mb-1">Target Tone</label>
                        <select
                          value={node.config.tone || 'Casual'}
                          onChange={(e) => updateNodeConfig(node.id, 'tone', e.target.value)}
                          className="w-full bg-[#18191B] border border-[#2A2D30] rounded-xl text-xs font-semibold px-3 py-1.5 text-[#ECEBE9] focus:outline-none"
                        >
                          <option>Corporate/Professional</option>
                          <option>Casual</option>
                          <option>Academic</option>
                          <option>Sarcastic/Funny</option>
                        </select>
                      </div>
                    )}

                    {node.type === 'email' && (
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-[#A3A09B] block mb-1">Sign-off Signature</label>
                        <input
                          type="text"
                          value={node.config.senderName || 'Domo Agent'}
                          onChange={(e) => updateNodeConfig(node.id, 'senderName', e.target.value)}
                          className="w-full bg-[#18191B] border border-[#2A2D30] rounded-xl text-xs font-semibold px-3 py-1.5 text-[#ECEBE9] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Output Node preview */}
                  {node.output && (
                    <div className="mt-3 bg-[#111213] rounded-2xl p-3.5 border border-[#2A2D30]/40 text-xs">
                      <div className="text-[9px] font-black text-[#A3A09B] mb-1.5 uppercase">Node Output Token Stream</div>
                      <p className="font-mono text-[#ECEBE9]/90 leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">
                        {node.output}
                      </p>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Workflow Final Output Sidebar */}
        <div className="w-full lg:w-96 bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 flex flex-col justify-between select-text overflow-hidden">
          <div className="flex-grow flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={16} className="text-[#3C6B4D]" />
              <span className="text-xs font-black tracking-wider text-[#ECEBE9]">Workflow Summary</span>
            </div>
            
            <p className="text-[10px] text-[#A3A09B] mb-4">
              Inspect the finalized results compiled at the end of the sequential local model pipeline.
            </p>

            <hr className="border-[#2A2D30] mb-4" />

            <div className="flex-grow bg-[#111213] border border-[#2A2D30]/60 rounded-2xl p-4 overflow-y-auto max-h-96">
              {workflowOutput ? (
                <p className="font-mono text-xs leading-relaxed text-[#ECEBE9]/95 whitespace-pre-wrap">
                  {workflowOutput}
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-[#A3A09B] p-4">
                  <Cpu size={32} className="text-[#2A2D30] mb-3 animate-pulse" />
                  <div className="text-xs font-bold text-[#ECEBE9]">No flow outputs compiled yet</div>
                  <p className="text-[10px] text-[#A3A09B] mt-1 max-w-[180px]">
                    Configure your nodes, input text, and click "Execute Flow" to run local automation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DomoFlowEditor;
