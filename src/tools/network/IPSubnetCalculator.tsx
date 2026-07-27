import React, { useState, useEffect } from 'react';
import { Terminal, Cpu, Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

export const IPSubnetCalculatorTool: React.FC = () => {
  const [ipInput, setIpInput] = useState('192.168.1.1');
  const [cidr, setCidr] = useState(24);
  const [copied, setCopied] = useState(false);

  // Local AI State
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      const { status, models } = await aiService.checkOllama();
      if (status && models.length > 0) {
        setModels(models);
        const saved = aiService.getSelectedOllamaModel();
        if (saved && models.includes(saved)) {
          setSelectedModel(saved);
        } else {
          setSelectedModel(models[0]);
        }
      }
    };
    fetchModels();
  }, []);

  const cidrToSubnetMask = (mask: number) => {
    const total = 0xffffffff << (32 - mask);
    return [(total >>> 24) & 255, (total >>> 16) & 255, (total >>> 8) & 255, total & 255].join('.');
  };

  const subnetMask = cidrToSubnetMask(cidr);
  const totalHosts = Math.max(0, Math.pow(2, 32 - cidr) - 2);
  const usableHosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : totalHosts;

  const summary = `CIDR: ${ipInput}/${cidr}
Netmask: ${subnetMask}
Usable Hosts: ${usableHosts}`;

  const copySummary = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunAiSubnetArchitect = async () => {
    if (!selectedModel) return;
    setIsGenerating(true);
    setError(null);

    const systemPrompt = `You are a Principal Network Infrastructure Architect & Enterprise Subnetting Specialist.
Subnet target: ${ipInput}/${cidr} (Netmask: ${subnetMask}). Usable Hosts: ${usableHosts}.
Provide VLAN subnetting hierarchy, BGP CIDR aggregation guidelines, and firewall rule CIDR range specifications.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, `Synthesize enterprise subnetting strategy for ${ipInput}/${cidr}`, 2048, systemPrompt);
      setAiOutput(response);
    } catch (err: any) {
      setError(err.message || 'Failed to query local AI model.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 p-2.5 rounded-xl">
              <Terminal size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI IP CIDR & Subnet Calculator</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Calculate IPv4/IPv6 CIDR network address boundaries, wildcard netmasks, usable host counts, and synthesize VLAN subnet plans with Local AI.
              </p>
            </div>
          </div>
          {models.length > 0 && (
            <div className="flex items-center gap-2 bg-[#111213] p-2 rounded-xl border border-[#2A2D30]">
              <Cpu size={16} className="text-[#3C6B4D]" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-transparent text-xs text-[#ECEBE9] focus:outline-none cursor-pointer"
              >
                {models.map((m) => (
                  <option key={m} value={m} className="bg-[#18191B] text-[#ECEBE9]">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Parameters */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-5 text-left">
          <h4 className="text-sm font-semibold text-[#ECEBE9]">IP Address & CIDR Prefix</h4>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-[#A3A09B]">IP Address (IPv4)</label>
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-3 rounded-xl font-mono focus:outline-none focus:border-[#3C6B4D]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-[#A3A09B]">CIDR Mask Bit Prefix (/{cidr})</label>
            <input
              type="range"
              min="8"
              max="32"
              value={cidr}
              onChange={(e) => setCidr(Number(e.target.value))}
              className="accent-[#3C6B4D] cursor-pointer"
            />
          </div>
        </div>

        {/* Calculated Metrics Viewport */}
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col justify-between text-left">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-[#ECEBE9]">Calculated Subnet Spec</h4>
              <button onClick={copySummary} className="text-xs text-[#3C6B4D] hover:underline font-semibold flex items-center gap-1 cursor-pointer">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy Spec'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#111213] p-3.5 rounded-xl border border-[#2A2D30]">
                <p className="text-[10px] text-[#A3A09B]">Subnet Netmask</p>
                <p className="text-sm font-bold text-[#3C6B4D] font-mono mt-1">{subnetMask}</p>
              </div>

              <div className="bg-[#111213] p-3.5 rounded-xl border border-[#2A2D30]">
                <p className="text-[10px] text-[#A3A09B]">Usable Host Capacity</p>
                <p className="text-sm font-bold text-emerald-400 font-mono mt-1">{usableHosts.toLocaleString()} Hosts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Local AI Advisor */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI Enterprise Networking Architect</h4>
          </div>
          <button
            onClick={handleRunAiSubnetArchitect}
            disabled={isGenerating || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isGenerating ? 'Synthesizing Subnet Plan...' : 'Run Local AI Subnet Architect'}
          </button>
        </div>

        {error && <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">{error}</div>}

        {aiOutput && (
          <div
            className="bg-[#111213] p-5 rounded-xl border border-[#2A2D30] text-[#ECEBE9] text-xs leading-relaxed overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(aiOutput) }}
          />
        )}
      </div>
    </div>
  );
};
