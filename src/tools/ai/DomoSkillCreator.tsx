import React, { useState, useEffect } from 'react';
import { 
  Sliders, Download, Upload, BookOpen, Trash2, 
  Info, FileText, Check, Sparkles, AlertCircle 
} from 'lucide-react';

export interface SkillDef {
  name: string;
  description: string;
  tools: string[];
  permissions: string[];
  rules: string[];
  systemInstructions: string;
}

const PREMADE_SKILLS: SkillDef[] = [
  {
    name: 'React Developer',
    description: 'Builds modern React components using TSX and CSS.',
    tools: ['file_editor', 'code_analyzer'],
    permissions: ['read_files', 'write_files'],
    rules: ['Prefer TypeScript', 'Follow accessibility standards', 'Generate responsive layouts'],
    systemInstructions: 'You are a Senior Frontend Engineer specialized in React. Generate high-quality clean React code components.'
  },
  {
    name: 'Python Engineer',
    description: 'Writes efficient, PEP-8 compliant Python scripts and data logic.',
    tools: ['file_editor', 'terminal_runner'],
    permissions: ['read_files', 'write_files', 'execute_commands'],
    rules: ['Follow PEP-8 styling', 'Include docstrings and type hints', 'Write robust error handling'],
    systemInstructions: 'You are a Principal Python Architect. Provide clean, performant, and commented python scripts.'
  },
  {
    name: 'Security Auditor',
    description: 'Scans and audits codebase files for common security flaws and OWASP vulnerabilities.',
    tools: ['code_analyzer', 'vulnerability_scanner'],
    permissions: ['read_files'],
    rules: ['Identify OWASP Top 10 vulnerabilities', 'Suggest secure alternatives', 'Never output credentials or raw secrets'],
    systemInstructions: 'You are an elite Security Analyst. Inspect files carefully and report potential exposures, CVEs, or security flaws.'
  },
  {
    name: 'Data Analyst',
    description: 'Processes csv data and generates clear summaries or interactive graphs.',
    tools: ['data_plotter', 'file_reader'],
    permissions: ['read_files', 'write_files'],
    rules: ['Focus on quantitative trends', 'Clean dirty input data', 'Provide markdown summaries of statistics'],
    systemInstructions: 'You are a Senior Data Analyst. Analyze patterns and synthesize clear statistical observations.'
  },
  {
    name: 'Research Assistant',
    description: 'Gathers context, queries topics, and compiles well-referenced synthesis drafts.',
    tools: ['web_search', 'citation_builder'],
    permissions: ['external_apis'],
    rules: ['Provide links for all references', 'Use unbiased professional language', 'Synthesize key bullet points'],
    systemInstructions: 'You are a detailed Research Specialist. Collect information, structure it logically, and cite references.'
  },
  {
    name: 'Technical Writer',
    description: 'Generates user guides, README.md files, and clean developer documentation.',
    tools: ['file_editor'],
    permissions: ['read_files', 'write_files'],
    rules: ['Use clear markdown heading structures', 'Include code examples', 'Prefer active voice'],
    systemInstructions: 'You are a Technical Writer. Explain complex concepts in readable, clean markdown documentation.'
  },
  {
    name: 'DevOps Engineer',
    description: 'Creates dockerfiles, github actions pipelines, and environment configs.',
    tools: ['file_editor', 'terminal_runner'],
    permissions: ['read_files', 'write_files', 'execute_commands'],
    rules: ['Optimize Docker layers', 'Use secure base images', 'Document all env variables'],
    systemInstructions: 'You are a DevOps Architect. Automate CI/CD pipelines and infrastructure scripting.'
  },
  {
    name: 'Product Manager',
    description: 'Designs product specifications, feature roadmaps, and sprint plans.',
    tools: ['roadmap_planner'],
    permissions: [],
    rules: ['Define clear acceptance criteria', 'Prioritize features by impact', 'Identify target user personas'],
    systemInstructions: 'You are a Product Owner. Author structured specification guides and milestone plans.'
  }
];

export const DomoSkillCreatorTool = () => {
  const [skillForm, setSkillForm] = useState<SkillDef>({
    name: 'Custom Developer Skill',
    description: 'A custom modular skillset built visually.',
    tools: ['file_editor', 'code_analyzer'],
    permissions: ['read_files', 'write_files'],
    rules: ['Ensure clean code structure', 'Document code with comments'],
    systemInstructions: 'You are a custom AI agent developer helper. Follow best practices.'
  });

  const [customSkills, setCustomSkills] = useState<SkillDef[]>([]);
  const [activePresetTab, setActivePresetTab] = useState<'premade' | 'custom'>('premade');
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load custom skills from localStorage
  useEffect(() => {
    const raw = localStorage.getItem('domodomo_custom_skills');
    if (raw) {
      try {
        setCustomSkills(JSON.parse(raw));
      } catch (e) {
        console.error('Error loading custom skills:', e);
      }
    }
  }, []);

  const saveCustomSkillsToStorage = (skills: SkillDef[]) => {
    localStorage.setItem('domodomo_custom_skills', JSON.stringify(skills));
    setCustomSkills(skills);
  };

  const handleSaveToLibrary = () => {
    if (!skillForm.name.trim()) {
      showAlert('error', 'Skill name cannot be empty.');
      return;
    }

    const existsIndex = customSkills.findIndex(s => s.name.toLowerCase() === skillForm.name.toLowerCase());
    let nextSkills = [...customSkills];

    if (existsIndex >= 0) {
      nextSkills[existsIndex] = { ...skillForm };
      showAlert('success', `Updated existing skill: "${skillForm.name}" in local library.`);
    } else {
      nextSkills.push({ ...skillForm });
      showAlert('success', `Saved new skill: "${skillForm.name}" to local library.`);
    }

    saveCustomSkillsToStorage(nextSkills);
    setActivePresetTab('custom');
  };

  const handleDeleteSkill = (name: string) => {
    const nextSkills = customSkills.filter(s => s.name !== name);
    saveCustomSkillsToStorage(nextSkills);
    showAlert('success', `Removed skill: "${name}" from library.`);
  };

  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleExportSkill = () => {
    const mdContent = `---
name: ${skillForm.name}
description: ${skillForm.description}
tools:
${skillForm.tools.map(t => `  - ${t}`).join('\n')}
permissions:
${skillForm.permissions.map(p => `  - ${p}`).join('\n')}
rules:
${skillForm.rules.map(r => `  - ${r}`).join('\n')}
---

# ${skillForm.name} System Instructions
${skillForm.systemInstructions}
`;
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skillForm.name.toLowerCase().replace(/\s+/g, '_')}_skill.md`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert('success', 'Skill markdown exported successfully!');
  };

  const handleImportSkill = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const matches = text.match(/---([\s\S]*?)---/);
      if (matches && matches[1]) {
        const lines = matches[1].split('\n');
        const parsed: Partial<SkillDef> = { tools: [], permissions: [], rules: [] };
        let currentSection: 'tools' | 'permissions' | 'rules' | null = null;
        
        lines.forEach(line => {
          const cleanLine = line.trim();
          if (cleanLine.startsWith('name:')) {
            parsed.name = cleanLine.replace('name:', '').trim();
          } else if (cleanLine.startsWith('description:')) {
            parsed.description = cleanLine.replace('description:', '').trim();
          } else if (cleanLine.startsWith('tools:')) {
            currentSection = 'tools';
          } else if (cleanLine.startsWith('permissions:')) {
            currentSection = 'permissions';
          } else if (cleanLine.startsWith('rules:')) {
            currentSection = 'rules';
          } else if (cleanLine.startsWith('-') && currentSection) {
            const val = cleanLine.replace('-', '').trim();
            if (currentSection === 'tools') parsed.tools?.push(val);
            if (currentSection === 'permissions') parsed.permissions?.push(val);
            if (currentSection === 'rules') parsed.rules?.push(val);
          }
        });

        const systemPart = text.split('---').pop() || '';
        parsed.systemInstructions = systemPart.replace(/#.*Instructions/, '').trim();

        const imported: SkillDef = {
          name: parsed.name || 'Imported Skill',
          description: parsed.description || 'Description details',
          tools: parsed.tools || [],
          permissions: parsed.permissions || [],
          rules: parsed.rules || [],
          systemInstructions: parsed.systemInstructions || 'System core instructions'
        };

        setSkillForm(imported);
        showAlert('success', `Imported skill "${imported.name}" successfully! Click Save to write to library.`);
      } else {
        showAlert('error', 'Invalid markdown skill format. Must include frontmatter delimiters (---).');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 text-left">
      {/* Alert message notification */}
      {alertMsg && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border animate-slideIn ${
          alertMsg.type === 'success' ? 'bg-[#3C6B4D]/90 text-emerald-400 border-emerald-500/25' : 'bg-rose-950/90 text-rose-400 border-rose-500/30'
        }`}>
          {alertMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span className="text-xs font-semibold">{alertMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-card bg-[#18191B] p-6 border border-[#2A2D30] rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <span className="text-[10px] bg-[#3C6B4D]/15 text-emerald-400 border border-[#3C6B4D]/25 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
            <Sparkles size={10} />
            <span>Local AI Customization</span>
          </span>
          <h2 className="text-xl font-black text-[#ECEBE9] tracking-tight">Domo Skill Creator</h2>
          <p className="text-xs text-[#A3A09B] max-w-xl">
            Design structured capabilities, restrictions, and behaviors to import into your local AI agents in Domo Agent Hub.
          </p>
        </div>
        <div className="flex gap-2.5 z-10 shrink-0">
          <label className="py-2 px-3.5 bg-[#111213] border border-[#2A2D30] hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors">
            <Upload size={14} className="text-[#3C6B4D]" />
            <span>Import MD</span>
            <input type="file" onChange={handleImportSkill} accept=".md" className="hidden" />
          </label>
          <button
            onClick={handleExportSkill}
            className="py-2 px-3.5 bg-[#111213] border border-[#2A2D30] hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} className="text-[#3C6B4D]" />
            <span>Export MD</span>
          </button>
          <button
            onClick={handleSaveToLibrary}
            className="py-2 px-4 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-emerald-950/20 transition-colors"
          >
            <Check size={14} />
            <span>Save to Library</span>
          </button>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Visual Skill Architect Form */}
        <div className="lg:col-span-8 glass-card bg-[#18191B] p-6 border border-[#2A2D30] rounded-2xl space-y-5">
          <div className="pb-3 border-b border-[#2A2D30] flex items-center gap-2">
            <Sliders className="text-[#3C6B4D]" size={18} />
            <h3 className="text-sm font-extrabold text-[#ECEBE9]">Skill Architecture Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider">Skill Identity Name</label>
              <input
                type="text"
                value={skillForm.name}
                onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                placeholder="e.g. Frontend Architect"
                className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3.5 py-2 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] focus:ring-1 focus:ring-[#3C6B4D]/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider">Core Description Summary</label>
              <input
                type="text"
                value={skillForm.description}
                onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                placeholder="Briefly state what this skillset provides..."
                className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3.5 py-2 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] focus:ring-1 focus:ring-[#3C6B4D]/30"
              />
            </div>
          </div>

          {/* Tools & Permissions Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider block">Allowed Tools (Capabilities)</label>
              <div className="grid grid-cols-2 gap-2 bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
                {['file_editor', 'code_analyzer', 'terminal_runner', 'web_search', 'vulnerability_scanner', 'data_plotter', 'roadmap_planner', 'citation_builder'].map(tool => {
                  const active = skillForm.tools.includes(tool);
                  return (
                    <button
                      key={tool}
                      onClick={() => {
                        const nextTools = active ? skillForm.tools.filter(t => t !== tool) : [...skillForm.tools, tool];
                        setSkillForm({ ...skillForm, tools: nextTools });
                      }}
                      className={`p-2 rounded-lg border text-[10px] font-bold text-left transition-all ${
                        active ? 'bg-[#3C6B4D]/10 border-[#3C6B4D] text-emerald-400 font-extrabold' : 'bg-[#18191B] border-[#2A2D30] text-[#72706C] hover:border-[#2A2D30]/80'
                      }`}
                    >
                      {active ? '✓ ' : '+ '} {tool.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider block">Explicit Boundary Permissions</label>
              <div className="grid grid-cols-2 gap-2 bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
                {['read_files', 'write_files', 'execute_commands', 'local_apis', 'external_apis'].map(p => {
                  const active = skillForm.permissions.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => {
                        const next = active ? skillForm.permissions.filter(x => x !== p) : [...skillForm.permissions, p];
                        setSkillForm({ ...skillForm, permissions: next });
                      }}
                      className={`p-2 rounded-lg border text-[10px] font-bold text-left transition-all ${
                        active ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-extrabold' : 'bg-[#18191B] border-[#2A2D30] text-[#72706C] hover:border-[#2A2D30]/80'
                      }`}
                    >
                      {active ? 'Locked: ' : 'Grant: '} {p.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Rules & Constraints */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider block">Rules & Quality Constraints</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Prefer asynchronous logic, ensure complete responsive styling..."
                id="newRuleInput"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val) {
                      setSkillForm({ ...skillForm, rules: [...skillForm.rules, val] });
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
                className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3.5 py-2 text-xs text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D]"
              />
              <button
                onClick={() => {
                  const el = document.getElementById('newRuleInput') as HTMLInputElement;
                  if (el && el.value.trim()) {
                    setSkillForm({ ...skillForm, rules: [...skillForm.rules, el.value.trim()] });
                    el.value = '';
                  }
                }}
                className="px-4 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold rounded-xl transition-colors shrink-0"
              >
                Add Rule
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {skillForm.rules.length === 0 ? (
                <span className="text-[10px] text-[#72706C] italic">No custom rules added yet. Add some above.</span>
              ) : (
                skillForm.rules.map((rule, i) => (
                  <span key={i} className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1.5">
                    <span>{rule}</span>
                    <button 
                      onClick={() => setSkillForm({ ...skillForm, rules: skillForm.rules.filter((_, idx) => idx !== i) })} 
                      className="text-rose-400 hover:text-rose-500 font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* System prompt instructions */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#72706C] uppercase tracking-wider block">Agent System Instructions</label>
            <textarea
              value={skillForm.systemInstructions}
              onChange={(e) => setSkillForm({ ...skillForm, systemInstructions: e.target.value })}
              rows={4}
              placeholder="Provide the core directive prompt detailing the persona and detailed instructions..."
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs font-mono text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] leading-relaxed"
            />
          </div>
        </div>

        {/* Premade and Custom Skill Libraries */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card bg-[#18191B] p-5 border border-[#2A2D30] rounded-2xl flex-1 flex flex-col">
            <div className="pb-3 border-b border-[#2A2D30] flex items-center gap-2 shrink-0">
              <BookOpen className="text-[#3C6B4D]" size={18} />
              <h3 className="text-sm font-extrabold text-[#ECEBE9]">Skillset Libraries</h3>
            </div>

            <div className="grid grid-cols-2 border-b border-[#2A2D30] my-3 shrink-0">
              <button
                onClick={() => setActivePresetTab('premade')}
                className={`py-2 text-[10px] uppercase font-bold tracking-wider transition-all border-b-2 text-center ${
                  activePresetTab === 'premade' ? 'border-[#3C6B4D] text-[#ECEBE9]' : 'border-transparent text-[#72706C]'
                }`}
              >
                Pre-Made Templates ({PREMADE_SKILLS.length})
              </button>
              <button
                onClick={() => setActivePresetTab('custom')}
                className={`py-2 text-[10px] uppercase font-bold tracking-wider transition-all border-b-2 text-center ${
                  activePresetTab === 'custom' ? 'border-[#3C6B4D] text-[#ECEBE9]' : 'border-transparent text-[#72706C]'
                }`}
              >
                Local Library ({customSkills.length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[360px] pr-1">
              {activePresetTab === 'premade' ? (
                PREMADE_SKILLS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setSkillForm(preset)}
                    className="w-full text-left bg-[#111213] hover:bg-[#1E2022] border border-[#2A2D30] hover:border-[#3C6B4D]/40 p-3.5 rounded-xl transition-all space-y-1.5 group"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-[#ECEBE9] group-hover:text-emerald-400 transition-colors">{preset.name}</h4>
                      <span className="text-[8px] bg-[#3C6B4D]/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Premade</span>
                    </div>
                    <p className="text-[10px] text-[#A3A09B] leading-relaxed">{preset.description}</p>
                    <div className="flex gap-1.5 pt-1 flex-wrap">
                      {preset.tools.map(t => (
                        <span key={t} className="text-[8px] bg-[#18191B] text-[#72706C] border border-[#2A2D30] px-1.5 py-0.5 rounded uppercase font-bold">
                          {t.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </button>
                ))
              ) : customSkills.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <FileText size={24} className="text-[#72706C] mx-auto opacity-45" />
                  <p className="text-[10px] text-[#72706C] italic leading-normal">
                    Your local library is empty.<br />Create a skill and click 'Save to Library'.
                  </p>
                </div>
              ) : (
                customSkills.map((custom) => (
                  <div
                    key={custom.name}
                    className="relative text-left bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D]/40 p-3.5 rounded-xl transition-all space-y-1.5 group"
                  >
                    <button
                      onClick={() => setSkillForm(custom)}
                      className="w-full text-left space-y-1.5"
                    >
                      <h4 className="text-xs font-bold text-[#ECEBE9] group-hover:text-emerald-400 transition-colors">{custom.name}</h4>
                      <p className="text-[10px] text-[#A3A09B] leading-relaxed pr-6">{custom.description}</p>
                      <div className="flex gap-1.5 pt-1 flex-wrap">
                        {custom.tools.map(t => (
                          <span key={t} className="text-[8px] bg-[#18191B] text-[#72706C] border border-[#2A2D30] px-1.5 py-0.5 rounded uppercase font-bold">
                            {t.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSkill(custom.name);
                      }}
                      className="absolute top-2.5 right-2.5 p-1 bg-[#18191B] border border-[#2A2D30] hover:border-rose-500/40 text-[#72706C] hover:text-rose-400 rounded-lg transition-colors"
                      title="Delete Skill"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Documentation Section */}
      <div className="glass-card bg-[#18191B] p-6 border border-[#2A2D30] rounded-2xl space-y-4">
        <div className="pb-3 border-b border-[#2A2D30] flex items-center gap-2">
          <Info className="text-[#3C6B4D]" size={18} />
          <h3 className="text-sm font-extrabold text-[#ECEBE9]">How to Use Agent Skillsets</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#A3A09B] leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-bold text-[#ECEBE9] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>1. Defining Capabilities</span>
            </h4>
            <p>
              Skills act as modular directives for local AI models. Selecting allowed <strong>Tools</strong> tells the orchestrator what coding actions the agent is equipped to trigger, such as modifying text layout files, running diagnostics, or building scripts.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[#ECEBE9] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>2. Attaching to Agents</span>
            </h4>
            <p>
              Once you configure and save a skill to the library, it becomes immediately accessible inside the **Domo Agent Hub**. Edit an agent, pick the custom skill from the dropdown list, and the orchestrator will automatically merge it into their LLM system instructions.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[#ECEBE9] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>3. Portable Skill Files</span>
            </h4>
            <p>
              Skills are saved as Markdown files (`SKILL.md` format) containing structured YAML frontmatter boundaries. You can click <strong>Export MD</strong> to download them, or <strong>Import MD</strong> to load any previously saved skill file directly back into the architect.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
