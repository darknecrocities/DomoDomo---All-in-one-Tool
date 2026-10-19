import React, { useState, useMemo } from 'react';
import {
  Globe,
  Plus,
  Trash2,
  Copy,
  Download,
  Check,
  AlertTriangle,
  ShieldCheck,
  Server,
} from 'lucide-react';

import {
  type DnsRecordType,
  type DnsRecord,
  generateSoaSerial,
  validateDnsRecords,
  generateBindZone,
} from './dnsZoneHelper';

export type { DnsRecordType, DnsRecord };
export { generateSoaSerial, validateDnsRecords, generateBindZone };

export const DnsZoneBuilderTool: React.FC = () => {
  const [domain, setDomain] = useState<string>('example.com');
  const [defaultTtl, setDefaultTtl] = useState<number>(3600);
  const [soaSerial, setSoaSerial] = useState<string>(generateSoaSerial());

  const [records, setRecords] = useState<DnsRecord[]>([
    { id: '1', name: '@', type: 'A', value: '192.0.2.1', ttl: 3600 },
    { id: '2', name: '@', type: 'AAAA', value: '2001:db8::1', ttl: 3600 },
    { id: '3', name: 'www', type: 'CNAME', value: 'example.com.', ttl: 3600 },
    { id: '4', name: '@', type: 'MX', value: 'mail.example.com.', ttl: 3600, priority: 10 },
    { id: '5', name: '@', type: 'TXT', value: '"v=spf1 include:_spf.google.com ~all"', ttl: 3600 },
    { id: '6', name: '@', type: 'NS', value: 'ns1.example.com.', ttl: 86400 },
  ]);

  const [newType, setNewType] = useState<DnsRecordType>('A');
  const [newName, setNewName] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [newPriority, setNewPriority] = useState<number>(10);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Validate records for RFC conflicts (e.g. CNAME cannot coexist with other records)
  const validationWarnings = useMemo(() => {
    return validateDnsRecords(records);
  }, [records]);

  // Generate standard BIND zone file content
  const bindZoneText = useMemo(() => {
    return generateBindZone(domain, defaultTtl, soaSerial, records);
  }, [domain, defaultTtl, soaSerial, records]);

  const handleAddRecord = () => {
    if (!newValue.trim()) return;
    const rec: DnsRecord = {
      id: `rec-${Date.now()}`,
      name: newName.trim() || '@',
      type: newType,
      value: newValue.trim(),
      ttl: defaultTtl,
      priority: newType === 'MX' ? newPriority : undefined,
    };
    setRecords((prev) => [...prev, rec]);
    setNewName('');
    setNewValue('');
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadZone = () => {
    const blob = new Blob([bindZoneText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${domain}.zone`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A2D30] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A3A09B] uppercase tracking-wider mb-1">
            <span>Network Suite</span>
            <span>/</span>
            <span className="text-white">Zone Architecture</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="text-[#D4AF37]" size={24} />
            <span>DNS BIND Zone File & Record Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Construct, validate, and format RFC-compliant BIND 9 zone files and resource records offline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCopy(bindZoneText, 'zone')}
            className="px-3 py-2 bg-[#18191B] border border-[#2A2D30] hover:bg-[#2A2D30] text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            {copiedType === 'zone' ? <Check size={14} className="text-[#D4AF37]" /> : <Copy size={14} />}
            <span>{copiedType === 'zone' ? 'Copied Zone' : 'Copy Zone'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadZone}
            className="px-4 py-2 bg-white text-black hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Download size={14} />
            <span>Download .zone</span>
          </button>
        </div>
      </div>

      {/* Domain & SOA Parameters */}
      <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-4">
        <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">
          Zone Configuration
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">Apex Domain ($ORIGIN)</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">Default TTL ($TTL in seconds)</label>
            <input
              type="number"
              value={defaultTtl}
              onChange={(e) => setDefaultTtl(Number(e.target.value))}
              className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-slate-400">SOA Serial (YYYYMMDDNN)</label>
            <input
              type="text"
              value={soaSerial}
              onChange={(e) => setSoaSerial(e.target.value)}
              className="bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Warnings */}
      {validationWarnings.length > 0 && (
        <div className="flex flex-col gap-2">
          {validationWarnings.map((w, idx) => (
            <div
              key={idx}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2"
            >
              <AlertTriangle size={16} className="shrink-0" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Record Editor Table */}
        <div className="lg:col-span-7 bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">
              DNS Resource Records ({records.length})
            </span>
            <span className="text-[10px] text-slate-500">RFC 1035 Format</span>
          </div>

          {/* Add New Record Bar */}
          <div className="bg-[#111213] border border-[#2A2D30] p-3 rounded-xl flex flex-wrap items-center gap-2 text-xs">
            <input
              type="text"
              placeholder="Host (@, www)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-24 bg-[#18191B] border border-[#2A2D30] rounded-lg px-2 py-1.5 text-white font-mono text-xs focus:outline-none"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as DnsRecordType)}
              className="bg-[#18191B] border border-[#2A2D30] rounded-lg px-2 py-1.5 text-white font-bold text-xs focus:outline-none"
            >
              <option value="A">A</option>
              <option value="AAAA">AAAA</option>
              <option value="CNAME">CNAME</option>
              <option value="MX">MX</option>
              <option value="TXT">TXT</option>
              <option value="NS">NS</option>
              <option value="SRV">SRV</option>
              <option value="CAA">CAA</option>
            </select>
            {newType === 'MX' && (
              <input
                type="number"
                placeholder="Prio"
                value={newPriority}
                onChange={(e) => setNewPriority(Number(e.target.value))}
                className="w-16 bg-[#18191B] border border-[#2A2D30] rounded-lg px-2 py-1.5 text-white font-mono text-xs focus:outline-none"
              />
            )}
            <input
              type="text"
              placeholder="Value / Target (e.g. 1.2.3.4)"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="flex-1 min-w-[140px] bg-[#18191B] border border-[#2A2D30] rounded-lg px-2 py-1.5 text-white font-mono text-xs focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddRecord}
              className="py-1.5 px-3 bg-white text-black hover:bg-slate-200 rounded-lg font-bold flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Add</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-auto max-h-[360px] rounded-xl border border-[#2A2D30]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#111213] text-[#A3A09B] uppercase text-[10px] font-bold sticky top-0 border-b border-[#2A2D30]">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">TTL</th>
                  <th className="py-2.5 px-3">Value / Target</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2D30]/60 font-mono text-slate-300">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-[#111213]">
                    <td className="py-2 px-3 text-white font-bold">{r.name}</td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold text-[10px]">
                        {r.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-500">{r.ttl}s</td>
                    <td className="py-2 px-3 text-slate-300 truncate max-w-[200px]" title={r.value}>
                      {r.type === 'MX' && <span className="text-amber-400 mr-1.5">[{r.priority}]</span>}
                      {r.value}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteRecord(r.id)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BIND 9 Zone Syntax Preview */}
        <div className="lg:col-span-5 bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-3">
          <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-1.5">
            <Server size={14} className="text-[#D4AF37]" />
            <span>BIND 9 Zone File Preview</span>
          </span>

          <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl text-xs font-mono text-white whitespace-pre-wrap leading-relaxed overflow-auto max-h-[460px]">
            {bindZoneText}
          </pre>
        </div>
      </div>

      {/* Footer Security */}
      <div className="flex items-center gap-2 p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl text-[11px] text-[#A3A09B]">
        <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
        <span>100% Client-side BIND zone file builder. RFC 1035 syntax validation.</span>
      </div>
    </div>
  );
};
