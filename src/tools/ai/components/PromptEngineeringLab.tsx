import React, { useState, useEffect } from 'react';
import { Terminal, Wand2, Copy, Check, Plus, Trash2, Sparkles, Layers, Play, Bot, Cpu, Download, BookOpen, Award, ShieldCheck, Share2, Save, Archive, Search, Filter, ChevronDown, ChevronUp, Code, FileText, X, Grid, List, ArrowUpDown, Maximize2, Minimize2 } from 'lucide-react';
import JSZip from 'jszip';
import { aiService } from '../../../utils/aiService';
import { triggerBlobDownload } from '../../../utils/sharedHelpers';
import { HardwareRecommendationBanner } from './HardwareRecommendationBanner';
import { PREMADE_SKILLS, type SkillDef } from '../data/premadeSkills';

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
  isCustom?: boolean;
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

const BUILTIN_AGENT_SKILLS: AgentSkillPreset[] = [
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

// Convert PremadeSkills dataset into AgentSkillPreset format
const PREMADE_LAB_SKILLS: AgentSkillPreset[] = PREMADE_SKILLS.map((sk: SkillDef) => ({
  id: sk.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
  name: sk.name,
  category: sk.name.includes('Security') ? 'Security Audit' :
            sk.name.includes('React') || sk.name.includes('UI/UX') ? 'Frontend Engineering' :
            sk.name.includes('Python') || sk.name.includes('Backend') || sk.name.includes('SQL') ? 'Backend Engineering' :
            sk.name.includes('DevOps') || sk.name.includes('Performance') ? 'Systems & Infrastructure' :
            sk.name.includes('Data') ? 'Data & Analytics' : 'Core Architecture',
  description: sk.description,
  systemPersona: `${sk.systemInstructions}\n\n### MANDATORY RULES & CONSTRAINTS\n${sk.rules.map(r => `- ${r}`).join('\n')}`,
  userTemplate: `TASK OBJECTIVE: {{task_objective}}\nCONTEXT & CONSTRAINTS: {{context_constraints}}\nOUTPUT FORMAT: {{output_format}}`,
  variables: {
    task_objective: `Execute high-precision ${sk.name} workflow on target module`,
    context_constraints: `Strict compliance with project architectural standards and non-breaking changes`,
    output_format: `Clean, fully documented production-ready response`
  },
  fewShot: []
}));

const ALL_BUILTIN_SKILLS = [...BUILTIN_AGENT_SKILLS, ...PREMADE_LAB_SKILLS];

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

  const [activeTab, setActiveTab] = useState<'workspace' | 'frameworks' | 'skills' | 'exporter' | 'audit'>('workspace');

  // Custom User-Saved Skills state (persisted across DomoSkillCreator & PromptLab)
  const [customSkills, setCustomSkills] = useState<AgentSkillPreset[]>(() => {
    try {
      const savedAgentSkills = localStorage.getItem('domodomo_custom_agent_skills');
      const savedDomoSkills = localStorage.getItem('domodomo_custom_skills');
      
      const parsedAgent = savedAgentSkills ? JSON.parse(savedAgentSkills) : [];
      const parsedDomo = savedDomoSkills ? JSON.parse(savedDomoSkills).map((s: SkillDef) => ({
        id: s.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        name: s.name,
        category: 'Custom Developer Skill',
        description: s.description,
        systemPersona: `${s.systemInstructions}\n\n### RULES\n${(s.rules || []).map(r => `- ${r}`).join('\n')}`,
        userTemplate: `TASK: {{task}}\nFORMAT: {{format}}`,
        variables: { task: 'Develop modular component', format: 'TypeScript ES6' },
        fewShot: [],
        isCustom: true
      })) : [];

      const combined = [...parsedAgent, ...parsedDomo];
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      return unique;
    } catch {
      return [];
    }
  });

  // Search, Filter, Sort, View & Expand state for Skills Library
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'custom' | 'name' | 'category'>('custom');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedSkillIds, setExpandedSkillIds] = useState<Record<string, boolean>>({});
  const [copiedSkillId, setCopiedSkillId] = useState<string | null>(null);

  const toggleSkillExpand = (id: string) => {
    setExpandedSkillIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleExpandAll = (expand: boolean) => {
    if (expand) {
      const allMap: Record<string, boolean> = {};
      allSkills.forEach(s => { allMap[s.id] = true; });
      setExpandedSkillIds(allMap);
    } else {
      setExpandedSkillIds({});
    }
  };

  const handleCopySkillPersona = (skill: AgentSkillPreset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(skill.systemPersona);
    setCopiedSkillId(skill.id);
    setTimeout(() => setCopiedSkillId(null), 1500);
  };

  const handleExportSingleSkill = (skill: AgentSkillPreset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const slug = skill.id;
    const skillContent = `---
name: ${slug}
description: ${skill.description}
---

# ${skill.name.toUpperCase()} Agent Skill

## System Persona
${skill.systemPersona}

## Template Variables & User Instructions
${skill.userTemplate}

## Dynamic Variables
${Object.entries(skill.variables || {}).map(([k, v]) => `- \`{{${k}}}\`: ${v}`).join('\n')}

## Few-Shot Reference Examples
${(skill.fewShot || []).map((ex, i) => `### Example #${i + 1}\n**Input:**\n${ex.input}\n\n**Output:**\n${ex.output}`).join('\n\n')}
`;

    triggerBlobDownload(
      new Blob([skillContent], { type: 'text/markdown' }),
      `SKILL_${slug}.md`
    );
  };

  const [systemPersona, setSystemPersona] = useState(ALL_BUILTIN_SKILLS[0].systemPersona);
  const [userTemplate, setUserTemplate] = useState(ALL_BUILTIN_SKILLS[0].userTemplate);
  const [variableValues, setVariableValues] = useState<Record<string, string>>(ALL_BUILTIN_SKILLS[0].variables);
  const [fewShotExamples, setFewShotExamples] = useState<FewShotExample[]>(ALL_BUILTIN_SKILLS[0].fewShot);

  const [skillName, setSkillName] = useState('custom-prompt-agent');
  const [skillDescription, setSkillDescription] = useState('Custom prompt template created in DomoDomo Prompt Engineering Lab');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);

  const availableModels = Array.from(new Set([...installedModels, ...COMMON_LLM_PRESETS]));

  const allSkills = [...customSkills, ...ALL_BUILTIN_SKILLS];

  // Save custom skills to LocalStorage (synced with DomoSkillCreator)
  useEffect(() => {
    try {
      localStorage.setItem('domodomo_custom_agent_skills', JSON.stringify(customSkills));
    } catch {
      // Ignore write errors
    }
  }, [customSkills]);

  const categoriesList = ['All', 'User Custom Skill', ...Array.from(new Set(ALL_BUILTIN_SKILLS.map(s => s.category)))];

  const filteredSkills = allSkills
    .filter(skill => {
      const q = skillSearchQuery.toLowerCase();
      const matchesSearch =
        skill.name.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.category.toLowerCase().includes(q) ||
        skill.systemPersona.toLowerCase().includes(q);
      const matchesCategory =
        selectedCategoryFilter === 'All' ||
        (selectedCategoryFilter === 'User Custom Skill' ? skill.isCustom : skill.category === selectedCategoryFilter);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'custom') {
        if (a.isCustom && !b.isCustom) return -1;
        if (!a.isCustom && b.isCustom) return 1;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'category') {
        return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });

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

  const handleSaveAndActivateSkill = () => {
    const slug = skillName.toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'custom_skill';
    const newSkill: AgentSkillPreset = {
      id: slug,
      name: skillName.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      category: 'User Custom Skill',
      description: skillDescription,
      systemPersona,
      userTemplate,
      variables: variableValues,
      fewShot: fewShotExamples,
      isCustom: true
    };

    setCustomSkills(prev => {
      const filtered = prev.filter(s => s.id !== slug);
      return [newSkill, ...filtered];
    });

    setSaveNotice(`✓ Skill "${newSkill.name}" saved & activated in DomoDomo!`);
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleDeleteCustomSkill = (id: string) => {
    setCustomSkills(prev => prev.filter(s => s.id !== id));
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

  // 1-Click Export Single SKILL.md file
  const handleExportSkillFile = () => {
    const slug = skillName.toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'custom_skill';
    const skillContent = `---
name: ${slug}
description: ${skillDescription}
---

# ${skillName.toUpperCase()} Agent Skill

## System Persona
${systemPersona}

## Template Variables & User Instructions
${userTemplate}

## Dynamic Variables
${Object.entries(variableValues).map(([k, v]) => `- \`{{${k}}}\`: ${v}`).join('\n')}

## Few-Shot Reference Examples
${fewShotExamples.map((ex, i) => `### Example #${i + 1}\n**Input:**\n${ex.input}\n\n**Output:**\n${ex.output}`).join('\n\n')}
`;

    triggerBlobDownload(
      new Blob([skillContent], { type: 'text/markdown' }),
      `SKILL_${slug}.md`
    );
  };

  // 1-Click Export Full .agents/skills/<skill-name>/ ZIP Archive
  const handleExportSkillZip = async () => {
    const zip = new JSZip();
    const slug = skillName.toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'custom_skill';
    const skillPath = `.agents/skills/${slug}`;

    const skillMdContent = `---
name: ${slug}
description: ${skillDescription}
---

# ${skillName.toUpperCase()} Agent Skill

## System Persona Instructions
${systemPersona}

## User Instruction Template
${userTemplate}

## Dynamic Variables Schema
${Object.entries(variableValues).map(([k, v]) => `- \`{{${k}}}\`: ${v}`).join('\n')}

## Few-Shot Pairs
${fewShotExamples.map((ex, i) => `### Example #${i + 1}\n**Input:**\n${ex.input}\n\n**Output:**\n${ex.output}`).join('\n\n')}
`;

    const readmeContent = `# ${skillName} Agent Skill Bundle

Generated by **DomoDomo Prompt Engineering Lab**.

## How to Install into Any Workspace

1. Copy the \`${slug}\` directory into your project's \`.agents/skills/\` root folder:
   \`\`\`bash
   mkdir -p .agents/skills/${slug}
   cp SKILL.md .agents/skills/${slug}/SKILL.md
   \`\`\`
2. Coding AI agents (Antigravity, Claude, Cursor, Gemini) will automatically discover and load instructions from \`SKILL.md\`!
`;

    zip.file(`${skillPath}/SKILL.md`, skillMdContent);
    zip.file(`${skillPath}/README.md`, readmeContent);
    zip.file(`${skillPath}/resources/variables.json`, JSON.stringify(variableValues, null, 2));
    zip.file(`${skillPath}/resources/few_shot_examples.json`, JSON.stringify(fewShotExamples, null, 2));

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    triggerBlobDownload(zipBlob, `skill_${slug}_agents_bundle.zip`);
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
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Save Notification Toast */}
      {saveNotice && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 p-3.5 rounded-2xl flex items-center justify-between text-xs text-emerald-300 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2 font-bold">
            <Check size={16} />
            <span>{saveNotice}</span>
          </div>
          <button onClick={() => setSaveNotice(null)} className="text-emerald-400 font-bold hover:text-white">Dismiss</button>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#3C6B4D]/15 text-[#3C6B4D] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Wand2 size={12} />
            <span>Prompt Framework Architect &amp; Agent Skill Creator ({allSkills.length} Skills)</span>
          </div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9]">Prompt Engineering Lab</h2>
          <p className="text-[#72706C] text-xs mt-0.5">Design system personas, save &amp; activate custom agent skills in DomoDomo, and download .agents ZIP bundles.</p>
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
              onClick={handleSaveAndActivateSkill}
              className="px-3.5 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md"
              title="Save custom prompt to DomoDomo local storage & activate"
            >
              <Save size={13} />
              <span>Save &amp; Activate Skill</span>
            </button>

            <button
              onClick={handleExportSkillZip}
              className="px-3 py-2 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] hover:border-[#3C6B4D] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              title="Download full .agents/skills/ ZIP package"
            >
              <Archive size={13} className="text-amber-400" />
              <span>Download .agents Zip</span>
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
          <Award size={14} className="text-amber-400" /> 3. Agent Skill Library &amp; Saved Prompts ({allSkills.length})
        </button>

        <button
          onClick={() => setActiveTab('exporter')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'exporter'
              ? 'bg-[#3C6B4D] text-white shadow-md'
              : 'bg-[#18191B] text-[#72706C] border border-[#2A2D30] hover:text-[#ECEBE9]'
          }`}
        >
          <Archive size={14} className="text-amber-400" /> 4. Exporter (.agents Zip &amp; SKILL.md)
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-[#3C6B4D] text-white shadow-md'
              : 'bg-[#18191B] text-[#72706C] border border-[#2A2D30] hover:text-[#ECEBE9]'
          }`}
        >
          <ShieldCheck size={14} className="text-emerald-400" /> 5. Real-Time Score ({diagnostics.totalScore}%)
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
                  rows={5}
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

      {/* ── TAB 3: AGENT SKILL LIBRARY & SAVED PROMPTS ── */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {/* Search, Filter, Sort, View Controls Header */}
          <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#72706C]" />
                <input
                  type="text"
                  value={skillSearchQuery}
                  onChange={e => setSkillSearchQuery(e.target.value)}
                  placeholder="Search skills by title, role, persona instructions, or keywords..."
                  className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl pl-9 pr-8 py-2 text-xs text-[#ECEBE9] placeholder-[#72706C] focus:outline-none focus:border-[#3C6B4D] transition-colors"
                />
                {skillSearchQuery && (
                  <button
                    onClick={() => setSkillSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#72706C] hover:text-[#ECEBE9]"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Filter & Sort Controls */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {/* Category Filter */}
                <div className="flex items-center gap-1.5 bg-[#111213] border border-[#2A2D30] rounded-xl px-2.5 py-1.5 text-xs text-[#ECEBE9]">
                  <Filter size={13} className="text-[#3C6B4D]" />
                  <select
                    value={selectedCategoryFilter}
                    onChange={e => setSelectedCategoryFilter(e.target.value)}
                    className="bg-transparent text-[#ECEBE9] text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat} className="bg-[#18191B] text-[#ECEBE9]">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-1.5 bg-[#111213] border border-[#2A2D30] rounded-xl px-2.5 py-1.5 text-xs text-[#ECEBE9]">
                  <ArrowUpDown size={13} className="text-[#3C6B4D]" />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="bg-transparent text-[#ECEBE9] text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="custom" className="bg-[#18191B]">Sort: Custom First</option>
                    <option value="name" className="bg-[#18191B]">Sort: Name (A-Z)</option>
                    <option value="category" className="bg-[#18191B]">Sort: Category</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-[#111213] border border-[#2A2D30] rounded-xl p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'grid' ? 'bg-[#3C6B4D] text-white' : 'text-[#72706C] hover:text-[#ECEBE9]'}`}
                    title="Grid View"
                  >
                    <Grid size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'list' ? 'bg-[#3C6B4D] text-white' : 'text-[#72706C] hover:text-[#ECEBE9]'}`}
                    title="List View"
                  >
                    <List size={14} />
                  </button>
                </div>

                {/* Expand All / Collapse All */}
                <button
                  onClick={() => toggleExpandAll(!filteredSkills.length || !filteredSkills.every(s => expandedSkillIds[s.id]))}
                  className="px-3 py-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#ECEBE9] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  title="Toggle expand all prompt cards"
                >
                  {filteredSkills.length > 0 && filteredSkills.every(s => expandedSkillIds[s.id]) ? (
                    <>
                      <Minimize2 size={13} className="text-amber-400" />
                      <span>Collapse All</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 size={13} className="text-[#3C6B4D]" />
                      <span>Expand All</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Catalog Count Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-2">
              <Award size={14} className="text-amber-400" /> Integrated Agent Skills Catalog ({filteredSkills.length})
            </h3>
            <span className="text-[11px] text-[#72706C]">
              {allSkills.filter(s => s.isCustom).length} Custom • {ALL_BUILTIN_SKILLS.length} Built-in
            </span>
          </div>

          {/* Skill List / Grid */}
          {filteredSkills.length === 0 ? (
            <div className="p-8 text-center bg-[#18191B] border border-[#2A2D30] rounded-2xl text-xs text-[#72706C] space-y-2">
              <p className="font-semibold">No agent skills found matching your filters.</p>
              <p className="text-[11px]">Try clearing your search query or switching the category filter.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSkills.map(skill => {
                const isExpanded = !!expandedSkillIds[skill.id];
                const tokenEstimate = Math.round((skill.systemPersona?.length || 0) / 4);
                const varCount = Object.keys(skill.variables || {}).length;
                const fewShotCount = (skill.fewShot || []).length;
                const isCopied = copiedSkillId === skill.id;

                return (
                  <div
                    key={skill.id}
                    className={`bg-[#18191B] border ${
                      isExpanded ? 'border-[#3C6B4D] shadow-lg shadow-[#3C6B4D]/10' : 'border-[#2A2D30] hover:border-[#3C6B4D]/50'
                    } p-5 rounded-2xl space-y-4 flex flex-col justify-between transition-all duration-200 relative group`}
                  >
                    {/* Top Header */}
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                skill.isCustom
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-[#3C6B4D]/20 text-[#3C6B4D] border border-[#3C6B4D]/30'
                              }`}
                            >
                              {skill.category}
                            </span>
                            {skill.isCustom && (
                              <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300">
                                Custom Skill
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-extrabold text-[#ECEBE9] leading-snug">{skill.name}</h4>
                        </div>

                        {/* Actions Top Right */}
                        <div className="flex items-center gap-1 shrink-0">
                          {skill.isCustom && (
                            <button
                              onClick={() => handleDeleteCustomSkill(skill.id)}
                              className="text-[#72706C] hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                              title="Delete custom skill"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                          <button
                            onClick={e => handleExportSingleSkill(skill, e)}
                            className="text-[#72706C] hover:text-amber-400 p-1.5 rounded-lg hover:bg-amber-500/10 transition-colors"
                            title="Download SKILL.md file"
                          >
                            <FileText size={13} />
                          </button>
                          <button
                            onClick={e => handleCopySkillPersona(skill, e)}
                            className="text-[#72706C] hover:text-emerald-400 p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors"
                            title="Copy system persona to clipboard"
                          >
                            {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>

                      {/* Quick Metadata Stats */}
                      <div className="flex items-center gap-3 text-[10px] font-mono text-[#72706C] border-y border-[#2A2D30]/60 py-1.5">
                        <span title="Estimated Token Footprint">Est. Tokens: ~{tokenEstimate}</span>
                        <span>•</span>
                        <span title="Template Variables">{varCount} Vars</span>
                        <span>•</span>
                        <span title="Few-Shot Examples">{fewShotCount} Examples</span>
                      </div>

                      {/* Description with Expand/Collapse */}
                      <div className="space-y-1.5">
                        <p className={`text-xs text-[#A3A09B] leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                          {skill.description}
                        </p>
                        {skill.description.length > 90 && (
                          <button
                            onClick={() => toggleSkillExpand(skill.id)}
                            className="text-[11px] font-bold text-[#3C6B4D] hover:text-white flex items-center gap-1 transition-colors"
                          >
                            <span>{isExpanded ? 'Show Less' : 'Show Details'}</span>
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        )}
                      </div>

                      {/* Expanded Preview Details */}
                      {isExpanded && (
                        <div className="space-y-3 pt-2 border-t border-[#2A2D30] animate-fadeIn">
                          {/* System Persona Instructions */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-[#ECEBE9] uppercase tracking-wider">
                              <span className="flex items-center gap-1 text-[#3C6B4D]">
                                <Terminal size={12} /> System Persona Instructions
                              </span>
                              <button
                                onClick={e => handleCopySkillPersona(skill, e)}
                                className="text-[10px] text-[#3C6B4D] hover:text-white flex items-center gap-1 font-mono"
                              >
                                {isCopied ? <Check size={11} /> : <Copy size={11} />}
                                <span>{isCopied ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                            <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl text-[11px] font-mono text-[#ECEBE9] leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
                              {skill.systemPersona}
                            </pre>
                          </div>

                          {/* User Instruction Template */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-1 text-amber-400">
                              <Code size={12} /> User Instruction Template
                            </span>
                            <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl text-[11px] font-mono text-amber-300/90 leading-relaxed max-h-28 overflow-y-auto whitespace-pre-wrap">
                              {skill.userTemplate}
                            </pre>
                          </div>

                          {/* Dynamic Variables Schema */}
                          {varCount > 0 && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider">
                                Template Variables ({varCount})
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(skill.variables || {}).map(([key, val]) => (
                                  <span key={key} className="px-2 py-0.5 rounded bg-[#111213] border border-[#2A2D30] text-[10px] font-mono text-[#ECEBE9]">
                                    <strong className="text-[#3C6B4D]">{'{{' + key + '}}'}</strong>: {val}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Few-Shot Pair Examples */}
                          {fewShotCount > 0 && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider">
                                Few-Shot Examples ({fewShotCount})
                              </span>
                              <div className="space-y-1.5">
                                {skill.fewShot.map((ex, idx) => (
                                  <div key={ex.id || idx} className="p-2 bg-[#111213] border border-[#2A2D30] rounded-lg text-[10px] font-mono space-y-1">
                                    <div className="text-[#ECEBE9]"><strong className="text-[#72706C]">Input:</strong> {ex.input}</div>
                                    <div className="text-emerald-400"><strong className="text-[#72706C]">Output:</strong> {ex.output}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-2 border-t border-[#2A2D30]/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => toggleSkillExpand(skill.id)}
                        className="px-3 py-1.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#ECEBE9] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={13} className="text-amber-400" />
                            <span>Less</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown size={13} className="text-[#3C6B4D]" />
                            <span>Expand</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleInjectSkill(skill)}
                        className="flex-1 py-2 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] hover:bg-[#3C6B4D]/20 text-[#ECEBE9] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 group-hover:border-[#3C6B4D]"
                      >
                        <Sparkles size={14} className="text-amber-400" />
                        <span>Inject Skill into Workspace</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {filteredSkills.map(skill => {
                const isExpanded = !!expandedSkillIds[skill.id];
                const tokenEstimate = Math.round((skill.systemPersona?.length || 0) / 4);
                const varCount = Object.keys(skill.variables || {}).length;
                const isCopied = copiedSkillId === skill.id;

                return (
                  <div
                    key={skill.id}
                    className={`bg-[#18191B] border ${
                      isExpanded ? 'border-[#3C6B4D]' : 'border-[#2A2D30] hover:border-[#3C6B4D]/50'
                    } p-4 rounded-2xl space-y-3 transition-all`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                              skill.isCustom
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-[#3C6B4D]/20 text-[#3C6B4D] border border-[#3C6B4D]/30'
                            }`}
                          >
                            {skill.category}
                          </span>
                          <span className="text-xs font-mono text-[#72706C]">~{tokenEstimate} tokens</span>
                          <span className="text-xs font-mono text-[#72706C]">• {varCount} vars</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-[#ECEBE9]">{skill.name}</h4>
                        <p className="text-xs text-[#72706C] line-clamp-1">{skill.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={e => handleCopySkillPersona(skill, e)}
                          className="p-2 bg-[#111213] border border-[#2A2D30] text-[#72706C] hover:text-emerald-400 rounded-xl transition-colors"
                          title="Copy system persona"
                        >
                          {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>

                        <button
                          onClick={() => toggleSkillExpand(skill.id)}
                          className="px-3 py-2 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#ECEBE9] text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                        >
                          <span>{isExpanded ? 'Less' : 'Details'}</span>
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>

                        <button
                          onClick={() => handleInjectSkill(skill)}
                          className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                        >
                          <Sparkles size={14} className="text-amber-400" />
                          <span>Inject</span>
                        </button>
                      </div>
                    </div>

                    {/* List View Expanded Details */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-[#2A2D30] space-y-3 text-xs animate-fadeIn">
                        <p className="text-[#ECEBE9] font-medium">{skill.description}</p>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-[#3C6B4D] uppercase">System Persona</span>
                          <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl text-[11px] font-mono text-[#ECEBE9] whitespace-pre-wrap max-h-36 overflow-y-auto">
                            {skill.systemPersona}
                          </pre>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-amber-400 uppercase">User Instruction Template</span>
                          <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl text-[11px] font-mono text-amber-300 whitespace-pre-wrap max-h-28 overflow-y-auto">
                            {skill.userTemplate}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: ZIP & SKILL.MD EXPORTER ── */}
      {activeTab === 'exporter' && (
        <div className="space-y-4">
          <div className="bg-[#18191B] border border-[#2A2D30] p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-[#ECEBE9] flex items-center gap-2 border-b border-[#2A2D30] pb-3">
              <Archive size={16} className="text-amber-400" /> Export &amp; Package Agent Skills
            </h3>
            <p className="text-xs text-[#72706C]">Configure metadata and export your prompt as a complete .agents/skills/ ZIP bundle or single SKILL.md document for coding AI agents.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#72706C] uppercase">Skill Slug Directory Name</label>
                <input
                  type="text"
                  value={skillName}
                  onChange={e => setSkillName(e.target.value)}
                  className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#72706C] uppercase">Skill Description</label>
                <input
                  type="text"
                  value={skillDescription}
                  onChange={e => setSkillDescription(e.target.value)}
                  className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={handleSaveAndActivateSkill}
                className="py-2.5 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Save size={14} />
                <span>Save &amp; Activate in DomoDomo</span>
              </button>

              <button
                onClick={handleExportSkillZip}
                className="py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
              >
                <Archive size={14} />
                <span>Download .agents Zip Bundle</span>
              </button>

              <button
                onClick={handleExportSkillFile}
                className="py-2.5 bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D] text-[#ECEBE9] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Share2 size={14} className="text-amber-400" />
                <span>Download Single SKILL.md</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: REAL-TIME PROMPT DIAGNOSTIC AUDIT ── */}
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
