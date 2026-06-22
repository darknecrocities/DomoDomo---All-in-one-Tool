import React from 'react';
import { Sliders, Download, Upload, BookOpen } from 'lucide-react';

export interface SkillDef {
  name: string;
  description: string;
  tools: string[];
  permissions: string[];
  rules: string[];
  systemInstructions: string;
}

interface AgentSkillsCreatorProps {
  skillForm: SkillDef;
  setSkillForm: React.Dispatch<React.SetStateAction<SkillDef>>;
  premadeSkills: SkillDef[];
}

export const AgentSkillsCreator: React.FC<AgentSkillsCreatorProps> = ({
  skillForm,
  setSkillForm,
  premadeSkills
}) => {
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

        setSkillForm({
          name: parsed.name || 'Imported Skill',
          description: parsed.description || 'Description details',
          tools: parsed.tools || [],
          permissions: parsed.permissions || [],
          rules: parsed.rules || [],
          systemInstructions: parsed.systemInstructions || 'System core instructions'
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fadeIn">
      {/* Creator Form */}
      <div className="lg:col-span-8 glass-card bg-[#18191B] p-5 space-y-4">
        <div className="pb-3 border-b border-[#2A2D30] flex justify-between items-center">
          <h3 className="text-sm font-bold text-[#ECEBE9] flex items-center gap-1.5">
            <Sliders className="text-[#3C6B4D]" size={16} />
            <span>Visual Agent Skillsets Creator</span>
          </h3>
          <div className="flex gap-2">
            <label className="py-1 px-3 bg-[#111213] border border-[#2A2D30] hover:bg-[#1E2022] text-[#A3A09B] hover:text-[#ECEBE9] rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1">
              <Upload size={12} />
              <span>Import MD</span>
              <input type="file" onChange={handleImportSkill} accept=".md" className="hidden" />
            </label>
            <button
              onClick={handleExportSkill}
              className="py-1 px-3 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Download size={12} />
              <span>Export Skill (MD)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#72706C] uppercase">Skill Name</label>
            <input
              type="text"
              value={skillForm.name}
              onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#72706C] uppercase">Description</label>
            <input
              type="text"
              value={skillForm.description}
              onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#72706C] uppercase block">Assigned Tools (Visual Builder)</label>
            <div className="grid grid-cols-2 gap-2 bg-[#111213] p-3 rounded-xl border border-[#2A2D30]">
              {['file_editor', 'code_analyzer', 'terminal_runner', 'web_search', 'vulnerability_scanner', 'data_plotter'].map(tool => {
                const active = skillForm.tools.includes(tool);
                return (
                  <button
                    key={tool}
                    onClick={() => {
                      const nextTools = active ? skillForm.tools.filter(t => t !== tool) : [...skillForm.tools, tool];
                      setSkillForm({ ...skillForm, tools: nextTools });
                    }}
                    className={`p-2 rounded-lg border text-[10px] font-bold text-left transition-all ${
                      active ? 'bg-[#3C6B4D]/10 border-[#3C6B4D] text-emerald-400' : 'bg-[#18191B] border-[#2A2D30] text-[#72706C]'
                    }`}
                  >
                    {active ? '✓ ' : '+ '} {tool.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#72706C] uppercase block">Skill Permissions (Visual Boundary)</label>
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
                      active ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-[#18191B] border-[#2A2D30] text-[#72706C]'
                    }`}
                  >
                    {active ? 'Locked: ' : 'Grant: '} {p.split('_').join(' ')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#72706C] uppercase block">Rules & Constraints (Visual List Editor)</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Ensure responsive layouts only"
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
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-1.5 text-xs text-[#ECEBE9]"
            />
            <button
              onClick={() => {
                const el = document.getElementById('newRuleInput') as HTMLInputElement;
                if (el && el.value.trim()) {
                  setSkillForm({ ...skillForm, rules: [...skillForm.rules, el.value.trim()] });
                  el.value = '';
                }
              }}
              className="px-3 bg-[#3C6B4D] hover:bg-[#2E533B] text-white text-xs font-bold rounded-xl"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {skillForm.rules.map((rule, i) => (
              <span key={i} className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1.5">
                <span>{rule}</span>
                <button onClick={() => setSkillForm({ ...skillForm, rules: skillForm.rules.filter((_, idx) => idx !== i) })} className="text-rose-400 hover:text-rose-600 font-bold">✕</button>
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-[#72706C] uppercase">System Prompt Instructions</label>
          <textarea
            value={skillForm.systemInstructions}
            onChange={(e) => setSkillForm({ ...skillForm, systemInstructions: e.target.value })}
            rows={4}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs font-mono text-[#ECEBE9]"
          />
        </div>
      </div>

      {/* Preset templates */}
      <div className="lg:col-span-4 glass-card bg-[#18191B] p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#ECEBE9] pb-3 border-b border-[#2A2D30] flex items-center gap-1.5">
          <BookOpen className="text-[#3C6B4D]" size={16} />
          <span>Pre-made Skill Library</span>
        </h3>
        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {premadeSkills.map((preset) => (
            <button
              key={preset.name}
              onClick={() => setSkillForm(preset)}
              className="w-full text-left bg-[#111213] hover:bg-[#1E2022] border border-[#2A2D30] hover:border-[#3C6B4D]/40 p-3 rounded-xl transition-all space-y-1"
            >
              <h4 className="text-xs font-bold text-[#ECEBE9]">{preset.name}</h4>
              <p className="text-[10px] text-[#A3A09B] leading-relaxed">{preset.description}</p>
              <div className="flex gap-1.5 pt-1.5 flex-wrap">
                {preset.tools.slice(0, 2).map(t => (
                  <span key={t} className="text-[8px] bg-[#18191B] text-[#72706C] border border-[#2A2D30] px-1 rounded uppercase font-bold">
                    {t}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
