import React from 'react';
import { Shield } from 'lucide-react';

interface AgentPermissionsManagerProps {
  globalPermissions: {
    read_files: boolean;
    write_files: boolean;
    execute_commands: boolean;
    local_apis: boolean;
    external_apis: boolean;
  };
  setGlobalPermissions: React.Dispatch<React.SetStateAction<{
    read_files: boolean;
    write_files: boolean;
    execute_commands: boolean;
    local_apis: boolean;
    external_apis: boolean;
  }>>;
}

export const AgentPermissionsManager: React.FC<AgentPermissionsManagerProps> = ({
  globalPermissions,
  setGlobalPermissions
}) => {
  const togglePermission = (key: keyof typeof globalPermissions) => {
    setGlobalPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="glass-card bg-[#18191B] p-6 space-y-6 max-w-3xl mx-auto text-left animate-fadeIn">
      <div className="pb-3 border-b border-[#2A2D30]">
        <h3 className="text-base font-bold text-[#ECEBE9] flex items-center gap-2">
          <Shield className="text-[#3C6B4D]" size={20} />
          <span>Global Boundary & Permissions Controller</span>
        </h3>
        <p className="text-xs text-[#A3A09B] mt-1">Configure workspace parameters to enforce safe agent behaviors and sandbox executions.</p>
      </div>

      <div className="space-y-4">
        {(Object.keys(globalPermissions) as Array<keyof typeof globalPermissions>).map((key) => {
          const active = globalPermissions[key];
          return (
            <div key={key} className="bg-[#111213] border border-[#2A2D30] p-4 rounded-2xl flex items-center justify-between">
              <div className="space-y-1.5 text-left">
                <h4 className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">
                  {key.split('_').join(' ')}
                </h4>
                <p className="text-[10px] text-[#72706C] leading-normal">
                  {key === 'read_files' ? 'Allow agents to read project files mounted in local workspace directory.' :
                   key === 'write_files' ? 'Allow agents to write/edit/delete workspace files automatically.' :
                   key === 'execute_commands' ? 'Allow terminal command execution via sandboxed terminals.' :
                   key === 'local_apis' ? 'Allow API integrations with locally hosted endpoints (Ollama, LM Studio, etc).' :
                   'Allow integration queries out to cloud providers (OpenAI, Anthropic, Gemini).'}
                </p>
              </div>
              <button
                onClick={() => togglePermission(key)}
                className={`py-1.5 px-4 rounded-xl text-xs font-bold border transition-colors ${
                  active ? 'bg-[#3C6B4D]/10 text-emerald-400 border-[#3C6B4D]' : 'bg-[#18191B] text-[#72706C] border-[#2A2D30]'
                }`}
              >
                {active ? '✓ Enabled' : '🔒 Disabled'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
