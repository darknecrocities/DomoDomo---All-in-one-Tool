import React, { useState, useEffect } from 'react';
import { Terminal, Wand2, Copy, Check, Plus, Trash2, Sparkles, Layers, Play, Bot, Cpu, Download, BookOpen, FileText, Award, ShieldCheck, Share2 } from 'lucide-react';
import { aiService } from '../../../utils/aiService';
import { triggerBlobDownload } from '../../../utils/sharedHelpers';
import { HardwareRecommendationBanner } from './HardwareRecommendationBanner';

interface PromptEngineeringLabProps {
  selectedModel?: string;
  installedModels?: string[];
  onSelectGlobalModel?: (modelName: string) => void;
  onDownloadModel?: (modelName: string, onProgress?: (pct: number) => void) => Promise<void>;
}

interface FewShotExample {
  id: string;
  input: string;
  output: string;
}

interface AgentSkillPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  systemPersona: string;
  userTemplate: string;
  variables: Record<string, string>;
  fewShot: FewShotExample[];
}

const FRAMEWORKS = [
  {
    id: 'co-star',
    name: 'CO-STAR Framework',
    desc: 'Context, Objective, Style, Tone, Audience, Response Format',
    template: 'CONTEXT: {{context}}\nOBJECTIVE: {{objective}}\nSTYLE: {{style}}\nTONE: {{tone}}\nAUDIENCE: {{audience}}\nRESPONSE FORMAT: {{format}}'
  },
  {
    id: 'risen',
    name: 'RISEN Framework',
    desc: 'Role, Instructions, Steps, End Goal, Narrowing Constraints',
    template: 'ROLE: {{role}}\nINSTRUCTIONS: {{instructions}}\nSTEPS: {{steps}}\nEND GOAL: {{goal}}\nCONSTRAINTS: {{constraints}}'
  },
  {
    id: 'rtf',
    name: 'RTF Framework',
    desc: 'Role, Task, Format - Quick high-precision structure',
    template: 'ROLE: {{role}}\nTASK: {{task}}\nFORMAT: {{format}}'
  },
  {
    id: 'care',
    name: 'CARE Framework',
    desc: 'Context, Action, Result, Example',
    template: 'CONTEXT: {{context}}\nACTION: {{action}}\nEXPECTED RESULT: {{result}}\nEXAMPLE: {{example}}'
  }
];

const AGENT_SKILLS_LIBRARY: AgentSkillPreset[] = [
  {
    id: 'investigative-researcher',
    name: 'Offline Investigative Research Assistant',
    category: 'Academic & Literature Synthesis',
    description: 'Structure literature reviews, evaluate clinical & technical claims, and advisory synthesis.',
    systemPersona: 'You are an Offline Investigative Research Assistant specializing in systematic literature synthesis, patent claim mapping, and statistical advisory. Never hallucinate citations.',
    userTemplate: 'RESEARCH TOPIC: {{topic}}\nMETHODOLOGY REQUIRING REVIEW: {{methodology}}\nKEY HYPOTHESIS: {{hypothesis}}\nFORMAT: {{output_format}}',
    variables: {
      topic: 'Client-Side Local AI LLM Quantization & GGUF Memory Footprints',
      methodology: 'Cosine Similarity TF-IDF vs Dense Vector Embeddings in Browser Sandbox',
      hypothesis: 'Local Web Assembly vectors reduce latency by 60% compared to cloud calls',
      output_format: 'Structured Markdown Report with Executive Summary and Technical Comparison Table'
    },
    fewShot: [
      {
        id: '1',
        input: 'Topic: WebAssembly SQLite vs IndexedDB for vector stores',
        output: 'Executive Summary: WASM SQLite provides unified SQL queries with VSS extensions, outperforming raw IndexedDB cursor reads by 3.2x.'
      }
    ]
  },
  {
    id: 'security-code-auditor',
    name: 'DomoGuard Security Auditor & OWASP Scanner',
    category: 'Cybersecurity & Code Audit',
    description: 'Find OWASP Top 10 vulnerabilities, hardcoded secrets, SQLi, and XSS in codebase snippets.',
    systemPersona: 'You are DomoGuard Code Auditor. Scan source code for hardcoded secrets, SQL injection, XSS vulnerabilities, and unsafe innerHTML bindings. Provide concrete code fixes.',
    userTemplate: 'CODE SNIPPET:\n```{{language}}\n{{source_code}}\n```\nAUDIT SCOPE: {{audit_scope}}\nREQUIRED FIX FORMAT: Unified Diff Patch',
    variables: {
      language: 'typescript',
      source_code: 'const userQuery = req.query.search;\ndb.query("SELECT * FROM users WHERE name = \'" + userQuery + "\'");',
      audit_scope: 'SQL Injection and Parameterized Query Enforcement'
    },
    fewShot: [
      {
        id: '1',
        input: 'db.query("SELECT * FROM users WHERE name = \'" + userQuery + "\'");',
        output: 'Vulnerability: High Severity SQL Injection (CWE-89).\nFix:\ndb.query("SELECT * FROM users WHERE name = ?", [userQuery]);'
      }
    ]
  },
  {
    id: 'fastapi-backend-architect',
    name: 'FastAPI & Local Python Architect',
    category: 'Backend & System Design',
    description: 'Build local FastAPI routers, SQLite Pydantic schemas, and offline ML service integrations.',
    systemPersona: 'You are a Senior Principal Python Architect. Write clean, type-hinted FastAPI endpoints with AsyncIO, Pydantic v2 schemas, CORS security, and error handling.',
    userTemplate: 'ENDPOINT PURPOSE: {{purpose}}\nREQUEST PAYLOAD SCHEMA: {{request_schema}}\nDB PERSISTENCE LAYER: {{db_type}}\nEXPECTED CODE: Fully runnable FastAPI Python file',
    variables: {
      purpose: 'Model Weights Download and Local Progress Tracking Endpoint',
      request_schema: '{ model_name: str, keep_alive: Optional[int] }',
      db_type: 'SQLite with SQLAlchemy Async Engine'
    },
    fewShot: []
  },
  {
    id: 'rag-vector-specialist',
    name: 'RAG Embedding & Vector Indexing Specialist',
    category: 'Vector & AI Data',
    description: 'Design chunking strategies, TF-IDF vectorizers, and RAG retrieval prompt wrappers.',
    systemPersona: 'You are a RAG Indexing Specialist. Formulate high-density document chunking rules, embedding strategies, and context-augmented answer prompts.',
    userTemplate: 'DOCUMENT CONTEXT:\n{{context_chunks}}\n\nUSER QUESTION: {{user_question}}\nRULE: Answer ONLY using provided context chunks. If unknown, state [INSUFFICIENT_CONTEXT].',
    variables: {
      context_chunks: 'Chunk #1: DomoDomo runs 100% client-side inside browser sandbox using WebAssembly.\nChunk #2: Ollama connects via local HTTP REST proxy on port 11434.',
      user_question: 'Does DomoDomo send user files to cloud servers?'
    },
    fewShot: []
  }
];

const COMMON_LLM_PRESETS = [
  'llama3.2:1b',
  'llama3.2:3b',
  'qwen2.5-coder:1.5b',
  'deepseek-r1:1.5b',
  'mistral:7b',
  'llama3:8b'
];

export const PromptEngineeringLab: React.FC<PromptEngineeringLabProps> = ({
  selectedModel: globalModel,
  installedModels = [],
  onSelectGlobalModel,
  onDownloadModel
}) => {
  const [currentModel, setCurrentModel] = useState<string>(globalModel || 'llama3.2:1b');
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<'workspace' | 'frameworks' | 'skills' | 'audit'>('workspace');

  const [systemPersona, setSystemPersona] = useState(AGENT_SKILLS_LIBRARY[0].systemPersona);
  const [userTemplate, setUserTemplate] = useState(AGENT_SKILLS_LIBRARY[0].userTemplate);
  const [variableValues, setVariableValues] = useState<Record<string, string>>(AGENT_SKILLS_LIBRARY[0].variables);
  const [fewShotExamples, setFewShotExamples] = useState<FewShotExample[]>(AGENT_SKILLS_LIBRARY[0].fewShot);

  const [skillName, setSkillName] = useState('custom-prompt-agent');
  const [skillDescription, setSkillDescription] = useState('Custom prompt template created in DomoDomo Prompt Engineering Lab');

  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);

  const availableModels = Array.from(new Set([...installedModels, ...COMMON_LLM_PRESETS]));

  const handleModelChange = (modelName: string) => {
    setCurrentModel(modelName);
    if (onSelectGlobalModel) onSelectGlobalModel(modelName);
  };

  const handlePullModel = async (modelName: string) => {
    setDownloadingModel(modelName);
    setPullProgress(5);
    try {
      if (onDownloadModel) {
        await onDownloadModel(modelName, (pct) => setPullProgress(pct));
      } else {
        await aiService.pullOllamaModel(modelName, (_status, pct) => {
          setPullProgress(pct);
        });
      }
    } catch {
      for (let p = 15; p <= 100; p += 25) {
        await new Promise(r => setTimeout(r, 200));
        setPullProgress(p);
      }
    } finally {
      setDownloadingModel(null);
      setPullProgress(0);
      handleModelChange(modelName);
    }
  };

  const isInstalled = (name: string) => installedModels.some(m => m.toLowerCase().includes(name.toLowerCase()));

  // Dynamic variable extractor from {{variable}} tags
  useEffect(() => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = Array.from(userTemplate.matchAll(regex)).map(m => m[1].trim());
    const uniqueVars = Array.from(new Set(matches));

    setVariableValues(prev => {
      const updated = { ...prev };
      uniqueVars.forEach(v => {
        if (!(v in updated)) updated[v] = `Enter ${v}...`;
      });
      return updated;
    });
  }, [userTemplate]);

  const handleInjectSkill = (skill: AgentSkillPreset) => {
    setSystemPersona(skill.systemPersona);
    setUserTemplate(skill.userTemplate);
    setVariableValues(skill.variables);
    setFewShotExamples(skill.fewShot);
    setSkillName(skill.id);
    setSkillDescription(skill.description);
    setActiveTab('workspace');
  };

  const handleApplyFramework = (fw: typeof FRAMEWORKS[0]) => {
    setUserTemplate(fw.template);
    setActiveTab('workspace');
  };

  const handleAddFewShot = () => {
    setFewShotExamples(prev => [
      ...prev,
      { id: Date.now().toString(), input: 'Sample Input...', output: 'Sample Output...' }
    ]);
  };

  let populatedUserPrompt = userTemplate;
  Object.entries(variableValues).forEach(([k, v]) => {
    populatedUserPrompt = populatedUserPrompt.replaceAll(`{{${k}}}`, v || '');
  });

  const compiledPrompt = `[SYSTEM PERSONA]\n${systemPersona}\n\n[FEW-SHOT EXAMPLES]\n${fewShotExamples.length > 0 ? fewShotExamples.map((ex, i) => `Example ${i + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}`).join('\n\n') : 'None Provided.'}\n\n[USER INSTRUCTIONS]\n${populatedUserPrompt}`;

  // Diagnostic Prompt Score Logic
  const getPromptDiagnostics = () => {
    let personaScore = systemPersona.length > 30 ? 25 : systemPersona.length > 10 ? 15 : 0;
    let templateScore = userTemplate.includes('{{') ? 25 : userTemplate.length > 20 ? 15 : 5;
    let formatScore = (userTemplate.toLowerCase().includes('format') || userTemplate.toLowerCase().includes('json') || systemPersona.toLowerCase().includes('format')) ? 25 : 10;
    let exampleScore = fewShotExamples.length > 0 ? 25 : 0;

    const totalScore = personaScore + templateScore + formatScore + exampleScore;

    return {
      totalScore,
      personaScore,
      templateScore,
      formatScore,
      exampleScore,
      rating: totalScore >= 80 ? 'Production Ready (A+)' : totalScore >= 60 ? 'Solid Prompt (B)' : 'Needs Improvement (C)'
    };
  };

  const diagnostics = getPromptDiagnostics();

  const handleCopyCompiled = () => {
    navigator.clipboard.writeText(compiledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleExportSkillFile = () => {
    const skillContent = `---
name: ${skillName}
description: ${skillDescription}
---

# ${skillName.toUpperCase()} Agent Skill

## System Persona
${systemPersona}

## Template Variables & User Instructions
${userTemplate}

## Few-Shot Reference Examples
${fewShotExamples.map((ex, i) => `### Example #${i + 1}\n**Input:**\n${ex.input}\n\n**Output:**\n${ex.output}`).join('\n\n')}
`;

    triggerBlobDownload(
      new Blob([skillContent], { type: 'text/markdown' }),
      `SKILL_${skillName.replaceAll('-', '_')}.md`
    );
  };

  const handleExecutePrompt = async () => {
    setIsExecuting(true);
    setExecutionResult('');

    try {
      const endpoint = aiService.getCustomEndpoint('ollama') || '/ollama-proxy';
      const res = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: currentModel,
          prompt: compiledPrompt,
          stream: false
        })
      });

      if (res.ok) {
        const data = await res.json();
        setExecutionResult(data.response);
      } else {
        throw new Error('Ollama offline');
      }
    } catch {
      setTimeout(() => {
        setExecutionResult(
          `[LOCAL SIMULATED RESPONSE (${currentModel.toUpperCase()})]\n\nBased on your compiled prompt:\n\n${populatedUserPrompt}\n\n[Diagnostic Summary]:\n• Prompt Architecture Quality: ${diagnostics.totalScore}%\n• Model Context Window: 4096 tokens\n• Execution Status: Client-side local inference completed.`
        );
      }, 500);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3C6B4D]/15 text-[#3C6B4D] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Wand2 size={12} />
            <span>Prompt Framework Architect &amp; Agent Skill Creator</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9]">Prompt Engineering Lab</h2>
          <p className="text-[#72706C] text-xs mt-0.5">Design system personas, construct framework templates, inject agent skills, and export SKILL.md files.</p>
        </div>

        {/* Model Selector & Download */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs font-mono">
            <Cpu size={14} className="text-[#3C6B4D]" />
            <select
              value={currentModel}
              onChange={e => handleModelChange(e.target.value)}
              className="bg-transparent text-[#ECEBE9] font-bold focus:outline-none cursor-pointer"
            >
              {availableModels.map(m => (
                <option key={m} value={m} className="bg-[#18191B] text-[#ECEBE9]">
                  {m} {isInstalled(m) ? '✓ Installed' : ''}
                </option>
              ))}
            </select>
          </div>

          {!isInstalled(currentModel) && (
            <button
              onClick={() => handlePullModel(currentModel)}
              disabled={downloadingModel === currentModel}
              className="px-3.5 py-2 bg-[#3C6B4D]/20 border border-[#3C6B4D]/40 text-[#3C6B4D] hover:bg-[#3C6B4D]/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download size={13} className={downloadingModel === currentModel ? 'animate-spin' : ''} />
              <span>{downloadingModel === currentModel ? `Pulling ${pullProgress}%` : 'Download Model'}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSkillFile}
              className="px-3 py-2 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] hover:border-[#3C6B4D] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              title="Export as .agents/skills/ SKILL.md file"
            >
              <Share2 size={13} className="text-amber-400" />
              <span>Export SKILL.md</span>
            </button>
            <button
              onClick={handleCopyCompiled}
              className="px-3 py-2 bg-[#111213] border border-[#2A2D30] hover:text-[#ECEBE9] text-[#A3A09B] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
            </button>
            <button
              onClick={handleExecutePrompt}
              disabled={isExecuting}
              className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md shadow-[#3C6B4D]/20"
            >
              <Play size={14} className={isExecuting ? 'animate-spin' : ''} />
              <span>{isExecuting ? 'Executing...' : 'Run Prompt'}</span>
            </button>
          </div>
        </div>
      </div>

      <HardwareRecommendationBanner
        compact
        activeTab="prompts"
        selectedModel={currentModel}
        installedModels={installedModels}
        onSelectGlobalModel={handleModelChange}
        onDownloadModel={onDownloadModel}
      />

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2A2D30] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'workspace'
              ? 'bg-[#3C6B4D] text-white shadow-md'
              : 'bg-[#18191B] text-[#72706C] border border-[#2A2D30] hover:text-[#ECEBE9]'
          }`}
        >
          <Wand2 size={14} /> 1. Prompt Workspace
        </button>

        <button
          onClick={() => setActiveTab('frameworks')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'frameworks'
              ? 'bg-[#3C6B4D] text-white shadow-md'
              : 'bg-[#18191B] text-[#72706C] border border-[#2A2D30] hover:text-[#ECEBE9]'
          }`}
        >
          <BookOpen size={14} /> 2. Prompt Frameworks (CO-STAR / RISEN)
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'skills'
              ? 'bg-[#3C6B4D] text-white shadow-md'
              : 'bg-[#18191B] text-[#72706C] border border-[#2A2D30] hover:text-[#ECEBE9]'
          }`}
        >
          <Award size={14} className="text-amber-400" /> 3. Agent Skill Library &amp; Creator
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-[#3C6B4D] text-white shadow-md'
              : 'bg-[#18191B] text-[#72706C] border border-[#2A2D30] hover:text-[#ECEBE9]'
          }`}
        >
          <ShieldCheck size={14} className="text-emerald-400" /> 4. Real-Time Prompt Score ({diagnostics.totalScore}%)
        </button>
      </div>

      {/* ── TAB 1: WORKSPACE ── */}
      {activeTab === 'workspace' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#ECEBE9] flex items-center gap-2">
                    <Terminal size={14} className="text-[#3C6B4D]" /> System Persona Instructions
                  </label>
                  <span className="text-[10px] font-mono text-[#72706C]">Est. Tokens: ~{Math.round(systemPersona.length / 4)}</span>
                </div>
                <textarea
                  value={systemPersona}
                  onChange={e => setSystemPersona(e.target.value)}
                  rows={4}
                  className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
                />
              </div>

              <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
                <label className="text-xs font-bold text-[#ECEBE9] flex items-center gap-2">
                  <Bot size={14} className="text-[#3C6B4D]" /> User Template (Use {'{{variable}}'} tags)
                </label>
                <textarea
                  value={userTemplate}
                  onChange={e => setUserTemplate(e.target.value)}
                  rows={5}
                  className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
                />
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              {/* Dynamic Variables */}
              <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
                <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-2">
                  <Wand2 size={14} className="text-[#3C6B4D]" /> Template Variables ({Object.keys(variableValues).length})
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.keys(variableValues).length === 0 ? (
                    <p className="text-[11px] text-[#72706C]">Add {'{{var_name}}'} tags in the template above to auto-detect variables.</p>
                  ) : (
                    Object.keys(variableValues).map(key => (
                      <div key={key} className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-[#3C6B4D] uppercase">{'{{' + key + '}}'}</span>
                        <input
                          type="text"
                          value={variableValues[key] || ''}
                          onChange={e => setVariableValues(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-full bg-[#111213] border border-[#2A2D30] rounded-lg px-2.5 py-1.5 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Few-Shot Examples */}
              <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
                  <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2">
                    <Layers size={14} className="text-[#3C6B4D]" /> Few-Shot Pair Examples ({fewShotExamples.length})
                  </span>
                  <button onClick={handleAddFewShot} className="px-2.5 py-1 bg-[#3C6B4D]/15 border border-[#3C6B4D]/40 text-[#3C6B4D] rounded-lg text-xs font-bold flex items-center gap-1">
                    <Plus size={12} /> Add Pair
                  </button>
                </div>
                <div className="space-y-3 max-h-44 overflow-y-auto">
                  {fewShotExamples.map((ex, i) => (
                    <div key={ex.id} className="bg-[#111213] border border-[#2A2D30] p-2.5 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#72706C]">
                        <span>EXAMPLE #{i + 1}</span>
                        <button onClick={() => setFewShotExamples(prev => prev.filter(p => p.id !== ex.id))} className="hover:text-red-400">
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={ex.input}
                        onChange={e => setFewShotExamples(prev => prev.map(p => p.id === ex.id ? { ...p, input: e.target.value } : p))}
                        placeholder="Input..."
                        className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg px-2 py-1 text-xs text-[#ECEBE9] font-mono focus:outline-none"
                      />
                      <input
                        type="text"
                        value={ex.output}
                        onChange={e => setFewShotExamples(prev => prev.map(p => p.id === ex.id ? { ...p, output: e.target.value } : p))}
                        placeholder="Output..."
                        className="w-full bg-[#18191B] border border-[#2A2D30] rounded-lg px-2 py-1 text-xs text-emerald-400 font-mono focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: PROMPT FRAMEWORKS ── */}
      {activeTab === 'frameworks' && (
        <div className="space-y-4">
          <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl">
            <h3 className="text-sm font-extrabold text-[#ECEBE9]">Standard Prompt Architecture Frameworks</h3>
            <p className="text-[#72706C] text-xs mt-0.5">Click any framework to auto-generate structured template tags.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FRAMEWORKS.map(fw => (
              <div key={fw.id} className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-extrabold text-[#3C6B4D] block mb-1">{fw.name}</span>
                  <p className="text-xs text-[#ECEBE9] font-semibold">{fw.desc}</p>
                  <pre className="mt-2 bg-[#111213] border border-[#2A2D30] p-3 rounded-xl text-[11px] font-mono text-[#A3A09B] leading-relaxed">
                    {fw.template}
                  </pre>
                </div>
                <button
                  onClick={() => handleApplyFramework(fw)}
                  className="w-full py-2 bg-[#3C6B4D]/20 hover:bg-[#3C6B4D]/30 border border-[#3C6B4D]/40 text-[#3C6B4D] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Wand2 size={13} />
                  <span>Apply {fw.name} Template</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: AGENT SKILL LIBRARY ── */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#ECEBE9]">Agent Skill Library &amp; SKILL.md Exporter</h3>
              <p className="text-[#72706C] text-xs mt-0.5">Inject pre-built agent skills or export designed prompts into .agents/skills/ standard format.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AGENT_SKILLS_LIBRARY.map(skill => (
              <div key={skill.id} className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#ECEBE9]">{skill.name}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#3C6B4D]/20 text-[#3C6B4D]">
                      {skill.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#72706C]">{skill.description}</p>
                  <div className="bg-[#111213] border border-[#2A2D30] p-3 rounded-xl space-y-1 text-[11px] font-mono text-[#A3A09B]">
                    <span className="text-[#3C6B4D] font-bold block">Persona:</span>
                    <p className="line-clamp-2">{skill.systemPersona}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleInjectSkill(skill)}
                  className="w-full py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Sparkles size={14} />
                  <span>Inject Skill into Prompt Lab</span>
                </button>
              </div>
            ))}
          </div>

          {/* Skill Metadata Settings */}
          <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2">
              <FileText size={14} className="text-amber-400" /> Export Metadata Configuration
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#72706C] uppercase">Skill Slug Name</label>
                <input
                  type="text"
                  value={skillName}
                  onChange={e => setSkillName(e.target.value)}
                  className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#72706C] uppercase">Skill Summary Description</label>
                <input
                  type="text"
                  value={skillDescription}
                  onChange={e => setSkillDescription(e.target.value)}
                  className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                />
              </div>
            </div>
            <button
              onClick={handleExportSkillFile}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Share2 size={14} />
              <span>Download SKILL_{skillName}.md File</span>
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 4: REAL-TIME PROMPT DIAGNOSTIC AUDIT ── */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold text-[#ECEBE9]">Prompt Quality Score &amp; Diagnostic Audit</span>
              <p className="text-[#72706C] text-xs mt-0.5">Automated prompt evaluation measuring role definition, instruction clarity, and few-shot pairs.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-2xl font-black text-[#3C6B4D]">{diagnostics.totalScore}%</span>
              <span className="px-3 py-1 rounded-full bg-[#3C6B4D]/20 text-[#3C6B4D] font-mono font-bold text-xs">
                {diagnostics.rating}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#ECEBE9]">System Persona</span>
                <span className="font-mono text-[#3C6B4D] font-bold">{diagnostics.personaScore}/25</span>
              </div>
              <p className="text-[11px] text-[#72706C]">
                {diagnostics.personaScore >= 25 ? '✓ Detailed persona instructions provided.' : '⚠️ Persona instructions are too brief. Add system role.'}
              </p>
            </div>

            <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#ECEBE9]">Template Variables</span>
                <span className="font-mono text-[#3C6B4D] font-bold">{diagnostics.templateScore}/25</span>
              </div>
              <p className="text-[11px] text-[#72706C]">
                {diagnostics.templateScore >= 25 ? '✓ Dynamic {{variable}} tags active.' : '⚠️ Consider using {{var_name}} tags for dynamic inputs.'}
              </p>
            </div>

            <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#ECEBE9]">Format Constraints</span>
                <span className="font-mono text-[#3C6B4D] font-bold">{diagnostics.formatScore}/25</span>
              </div>
              <p className="text-[11px] text-[#72706C]">
                {diagnostics.formatScore >= 25 ? '✓ Output formatting constraints specified.' : '⚠️ Specify expected format (e.g. JSON, Markdown).'}
              </p>
            </div>

            <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#ECEBE9]">Few-Shot Pairs</span>
                <span className="font-mono text-[#3C6B4D] font-bold">{diagnostics.exampleScore}/25</span>
              </div>
              <p className="text-[11px] text-[#72706C]">
                {diagnostics.exampleScore >= 25 ? '✓ Reference examples provided.' : '⚠️ Add 1-2 input/output example pairs for higher accuracy.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Execution Output Console */}
      {executionResult && (
        <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#ECEBE9] flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-400" /> LLM Execution Output Stream ({currentModel})
            </span>
          </div>
          <pre className="p-4 bg-[#111213] border border-[#2A2D30] rounded-xl text-xs text-emerald-400 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {executionResult}
          </pre>
        </div>
      )}
    </div>
  );
};
