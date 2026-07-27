import React, { useState, useEffect } from 'react';
import { Search, Cpu, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';
import { aiService } from '../../utils/aiService';
import { parseMarkdown } from '../../utils/markdownParser';

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
}

export const DNSLookupInspectorTool: React.FC = () => {
  const [domainInput, setDomainInput] = useState('example.com');
  const [queryType, setQueryType] = useState<'A' | 'AAAA' | 'MX' | 'TXT' | 'NS' | 'CAA'>('A');
  const [isQuerying, setIsQuerying] = useState(false);
  const [records, setRecords] = useState<DnsRecord[]>([
    { type: 'A', name: 'example.com', value: '93.184.216.34', ttl: 3600 },
    { type: 'TXT', name: 'example.com', value: 'v=spf1 -all', ttl: 3600 },
  ]);

  // Local AI State
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const handleQueryDoh = async () => {
    if (!domainInput.trim()) return;
    setIsQuerying(true);
    setError(null);

    try {
      const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domainInput)}&type=${queryType}`, {
        headers: { Accept: 'application/dns-json' },
      });
      const data = await res.json();
      if (data.Answer && Array.isArray(data.Answer)) {
        const typeMap: Record<number, string> = { 1: 'A', 28: 'AAAA', 15: 'MX', 16: 'TXT', 2: 'NS', 257: 'CAA' };
        const fetched: DnsRecord[] = data.Answer.map((a: any) => ({
          type: typeMap[a.type] || String(a.type),
          name: a.name,
          value: a.data,
          ttl: a.TTL,
        }));
        setRecords(fetched);
      } else {
        setRecords([{ type: queryType, name: domainInput, value: 'No records found or query returned empty', ttl: 0 }]);
      }
    } catch {
      setError('DNS-over-HTTPS request failed. Check network connectivity.');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleRunAiDnsAudit = async () => {
    if (!selectedModel) return;
    setIsAnalyzing(true);
    setError(null);

    const systemPrompt = `You are a Principal DNS & Email Security Architect.
Target Domain: ${domainInput}.
Query Records: ${JSON.stringify(records)}

Provide a DNS & Email Security audit:
1. SPF, DKIM, and DMARC spoofing defense status.
2. CAA SSL Certificate Issuance policy evaluation.
3. DNSSEC validation and CDN Anycast routing evaluation.
Format with clean markdown tables and bullet points.`;

    try {
      const response = await aiService.generateTextOllama(selectedModel, `Audit DNS security configuration for ${domainInput}`, 2048, systemPrompt);
      setAiOutput(response);
    } catch (err: any) {
      setError(err.message || 'Failed to query local AI model.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/20 p-2.5 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#ECEBE9] text-xl">AI DNS & DoH Security Diagnostic Inspector</h3>
              <p className="text-[#A3A09B] text-xs mt-1">
                Perform encrypted DNS-over-HTTPS (DoH) record queries (A, AAAA, MX, TXT, CAA, NS), audit SPF/DMARC spoofing risks, and run Local AI diagnostics.
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

      {/* Query Bar */}
      <div className="glass-card p-4 border-[#2A2D30] bg-[#18191B] rounded-2xl flex items-center justify-between gap-3 text-left">
        <input
          type="text"
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          placeholder="example.com"
          className="flex-1 bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-3 rounded-xl font-mono focus:outline-none focus:border-[#3C6B4D]"
        />

        <select
          value={queryType}
          onChange={(e) => setQueryType(e.target.value as any)}
          className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs p-3 rounded-xl font-mono font-bold cursor-pointer"
        >
          <option value="A">A Record</option>
          <option value="AAAA">AAAA Record</option>
          <option value="MX">MX Record</option>
          <option value="TXT">TXT / SPF / DMARC</option>
          <option value="NS">NS Record</option>
          <option value="CAA">CAA Record</option>
        </select>

        <button
          onClick={handleQueryDoh}
          disabled={isQuerying}
          className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-5 py-3 rounded-xl transition cursor-pointer"
        >
          {isQuerying ? <RefreshCw className="animate-spin" size={14} /> : <Search size={14} />}
          {isQuerying ? 'Querying DoH...' : 'Resolve DoH'}
        </button>
      </div>

      {/* Records Table */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <h4 className="font-bold text-[#ECEBE9] text-sm">Resolved DNS-over-HTTPS Records ({records.length})</h4>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2A2D30] text-[#A3A09B]">
                <th className="p-2.5">Record Type</th>
                <th className="p-2.5 font-mono">Domain Name</th>
                <th className="p-2.5 font-mono">Resolved Data / Address</th>
                <th className="p-2.5 font-mono">TTL</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr key={idx} className="border-b border-[#2A2D30]/50 hover:bg-[#111213]/40">
                  <td className="p-2.5 font-mono font-bold text-[#3C6B4D]">{r.type}</td>
                  <td className="p-2.5 font-mono text-[#ECEBE9]">{r.name}</td>
                  <td className="p-2.5 font-mono text-[#ECEBE9] break-all max-w-md">{r.value}</td>
                  <td className="p-2.5 font-mono text-[#A3A09B]">{r.ttl}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Local AI Advisor */}
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] rounded-2xl flex flex-col gap-4 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#3C6B4D]">
            <Sparkles size={18} />
            <h4 className="font-bold text-[#ECEBE9] text-sm">Local AI DNS Security Auditor</h4>
          </div>
          <button
            onClick={handleRunAiDnsAudit}
            disabled={isAnalyzing || !selectedModel}
            className="flex items-center gap-2 bg-[#3C6B4D] hover:bg-[#3C6B4D]/80 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isAnalyzing ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isAnalyzing ? 'Auditing DNS Security...' : 'Run Local AI Security Audit'}
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
