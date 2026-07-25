import React, { useState, useEffect } from 'react';
import { Layers, Cpu, Check, Copy, Network, Download } from 'lucide-react';
import { aiService } from '../../utils/aiService';

const PATENT_PRESETS = [
  {
    name: 'AI Neural Processor Patent',
    text: `1. A neural network acceleration apparatus comprising: a systolic processing array having a plurality of multiply-accumulate (MAC) units; an on-chip SRAM buffer coupled to said array; and a hardware dispatch controller configured to stream activation matrices directly into said array.
2. The apparatus of claim 1, further comprising a zero-skipping compression logic configured to bypass zero-value weights during matrix multiplication.
3. The apparatus of claim 1, wherein each MAC unit comprises a 16-bit floating-point accumulator and an 8-bit integer multiplier.
4. The apparatus of claim 2, further comprising a sparse-matrix index decoder coupled to said zero-skipping compression logic.
5. A method for hardware neural inference comprising: fetching weights into an SRAM buffer; streaming activation vectors into a systolic MAC array; and skipping zero-valued weights using hardware compression logic.`,
  },
  {
    name: 'Blockchain Ledger Patent',
    text: `1. A distributed cryptographic validation system comprising: a memory storing an append-only block DAG structure; a peer-to-peer network interface; and a consensus processor configured to validate zero-knowledge proofs.
2. The system of claim 1, wherein the consensus processor utilizes a zk-SNARK proof verifier circuit executing in hardware.
3. The system of claim 1, further comprising an ephemeral state prune engine configured to compress historical block transactions.
4. The system of claim 2, wherein the zk-SNARK verifier processes elliptic curve pairings over a BN-254 curve.`,
  },
];

interface ParsedClaim {
  number: number;
  text: string;
  isIndependent: boolean;
  dependsOn: number | null;
}

export const PatentClaimMapper: React.FC = () => {
  const [text, setText] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('llama3.2:1b');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [parsedClaims, setParsedClaims] = useState<ParsedClaim[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
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
    loadModels();
  }, []);

  const parseClaimsDeterministically = (rawText: string): ParsedClaim[] => {
    // Regex matching claims: "1.", "Claim 1", etc.
    const claimBlocks = rawText.split(/(?=\b(?:claim\s*)?\d+\.|\b\d+\s+a\b)/i).filter(b => b.trim().length > 0);
    const parsed: ParsedClaim[] = [];

    claimBlocks.forEach((block, index) => {
      const numMatch = block.match(/\b(\d+)\./);
      const claimNum = numMatch ? parseInt(numMatch[1], 10) : index + 1;

      const depMatch = block.match(/(?:claim|of)\s+(\d+)/i);
      const dependsOn = depMatch ? parseInt(depMatch[1], 10) : null;
      const isIndependent = !dependsOn || dependsOn === claimNum;

      parsed.push({
        number: claimNum,
        text: block.trim(),
        isIndependent,
        dependsOn: isIndependent ? null : dependsOn,
      });
    });

    return parsed;
  };

  const generateASCIITree = (claims: ParsedClaim[]): string => {
    let tree = '# Patent Claim Hierarchy Tree\n\n';
    const independents = claims.filter(c => c.isIndependent);

    independents.forEach(ind => {
      tree += `[Independent Claim ${ind.number}]\n`;
      const dependents = claims.filter(c => c.dependsOn === ind.number);
      dependents.forEach((dep, i) => {
        const isLast = i === dependents.length - 1;
        tree += `  ${isLast ? '└──' : '├──'} [Dependent Claim ${dep.number}] (refers to Claim ${ind.number})\n`;
        const subDeps = claims.filter(c => c.dependsOn === dep.number);
        subDeps.forEach((sub, sj) => {
          const isSubLast = sj === subDeps.length - 1;
          tree += `  │   ${isSubLast ? '└──' : '├──'} [Sub-Dependent Claim ${sub.number}]\n`;
        });
      });
      tree += '\n';
    });

    return tree;
  };

  const handleMapClaims = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    setResult(null);

    const parsed = parseClaimsDeterministically(text);
    setParsedClaims(parsed);
    const asciiTree = generateASCIITree(parsed);

    const prompt = `You are a registered patent attorney and IP analyst. Map the patent claims text below.
Produce:
1. Executive Patent Scope Summary
2. Independent Claims Analysis (Claim mechanisms & core novel elements)
3. Dependent Claims Mapping Matrix (Claim dependencies and added limitations)
4. Patent Breadth Assessment (Broad, Narrow, Balanced)
5. ASCII Dependency Tree Schema

Patent Claims Text:
${text}`;

    try {
      const response = await aiService.generateText(prompt, 1400, undefined, selectedModel, {
        systemPrompt: "You are an expert patent attorney. Map claim dependencies accurately and build precise ASCII trees."
      });
      setResult(`${response}\n\n${asciiTree}`);
    } catch (err) {
      console.warn('Ollama offline fallback:', err);
      const offlineResult = `${asciiTree}\n\n## Claim Breakdown Details\n\nTotal Claims Analyzed: ${parsed.length}\nIndependent Claims: ${parsed.filter(c => c.isIndependent).length}\nDependent Claims: ${parsed.filter(c => !c.isIndependent).length}\n\n--- Generated via DomoDomo Deterministic Patent Analysis Engine ---`;
      setResult(offlineResult);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patent_claim_map.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] text-[#ECEBE9] flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2D30] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#3C6B4D]/10 border border-[#3C6B4D]/20 text-[#3C6B4D] rounded-xl">
            <Layers size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Patent Claim Mapper</h3>
            <p className="text-xs text-[#A3A09B]">
              Parse claim dependencies, construct visual hierarchy trees, and evaluate patent scope offline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#72706C] font-semibold uppercase tracking-wider">Presets:</span>
          {PATENT_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setText(p.text);
                setParsedClaims(parseClaimsDeterministically(p.text));
              }}
              className="text-[11px] px-2.5 py-1 bg-[#111213] border border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] hover:border-[#3C6B4D] rounded-lg transition-all"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* AI Model Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#A3A09B]">Local AI Model Selector</label>
        <select
          value={selectedModel}
          onChange={(e) => {
            setSelectedModel(e.target.value);
            aiService.setSelectedOllamaModel(e.target.value);
          }}
          className="bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#3C6B4D]"
        >
          {models.length > 0 ? (
            models.map((m) => <option key={m} value={m}>{m}</option>)
          ) : (
            <option value="llama3.2:1b">llama3.2:1b (Deterministic Local Fallback)</option>
          )}
        </select>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#A3A09B]">Patent Specification Claims Section</label>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (e.target.value.trim()) {
              setParsedClaims(parseClaimsDeterministically(e.target.value));
            }
          }}
          placeholder="Paste patent claims here (e.g. 1. An apparatus comprising... 2. The apparatus of claim 1...)..."
          className="w-full min-h-[160px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3.5 text-xs text-[#ECEBE9] placeholder:text-[#72706C] focus:outline-none focus:border-[#3C6B4D] font-mono leading-relaxed"
        />
      </div>

      <button
        onClick={handleMapClaims}
        disabled={isProcessing || !text.trim()}
        className="w-full btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        <Cpu size={14} className={isProcessing ? 'animate-spin' : ''} />
        <span>{isProcessing ? 'Mapping Claims & Building Tree...' : 'Map Patent Claims & Hierarchy'}</span>
      </button>

      {/* Live Interactive Claim Hierarchy Nodes */}
      {parsedClaims.length > 0 && (
        <div className="bg-[#111213] border border-[#2A2D30] p-4 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-[#2A2D30] pb-2">
            <span className="text-xs font-bold text-[#ECEBE9] flex items-center gap-2">
              <Network size={14} className="text-[#3C6B4D]" />
              <span>Parsed Claim Hierarchy Nodes ({parsedClaims.length} Claims Detected)</span>
            </span>
            <div className="flex gap-2 text-[10px] font-semibold">
              <span className="px-2 py-0.5 rounded bg-[#3C6B4D]/20 text-[#3C6B4D] border border-[#3C6B4D]/30">
                {parsedClaims.filter(c => c.isIndependent).length} Independent
              </span>
              <span className="px-2 py-0.5 rounded bg-[#E29E2D]/20 text-[#E29E2D] border border-[#E29E2D]/30">
                {parsedClaims.filter(c => !c.isIndependent).length} Dependent
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {parsedClaims.map((claim) => (
              <div
                key={claim.number}
                className={`p-3 rounded-lg border flex flex-col gap-1 max-w-xs text-xs ${
                  claim.isIndependent
                    ? 'bg-[#3C6B4D]/10 border-[#3C6B4D]/40 text-[#ECEBE9]'
                    : 'bg-[#18191B] border-[#2A2D30] text-[#A3A09B]'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Claim {claim.number}</span>
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono ${
                    claim.isIndependent ? 'bg-[#3C6B4D]/20 text-[#3C6B4D]' : 'bg-[#2A2D30] text-[#72706C]'
                  }`}>
                    {claim.isIndependent ? 'Independent' : `Dep -> Claim ${claim.dependsOn}`}
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed line-clamp-2 text-[#72706C]">
                  {claim.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result Output */}
      {result && (
        <div className="flex flex-col gap-3 bg-[#111213] border border-[#2A2D30] rounded-xl p-5 relative animate-fadeIn">
          <div className="flex justify-between items-center border-b border-[#2A2D30] pb-2">
            <span className="text-xs font-bold text-[#ECEBE9] flex items-center gap-1.5">
              <Network size={14} className="text-[#3C6B4D]" />
              <span>Patent Claim Map Report</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="btn-secondary text-[11px] py-1 px-3 flex items-center gap-1"
              >
                {copied ? <Check size={12} className="text-[#3C6B4D]" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="btn-primary text-[11px] py-1 px-3 flex items-center gap-1"
              >
                <Download size={12} />
                <span>Export .md</span>
              </button>
            </div>
          </div>
          <div className="text-xs leading-relaxed text-[#ECEBE9] overflow-auto max-h-[350px] whitespace-pre-wrap font-mono bg-[#18191B] p-4 rounded-lg border border-[#2A2D30]">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export const PatentClaimMapperTool = {
  id: 'patent-mapper',
  name: 'Patent Claim Mapper',
  categories: ['investigation' as any],
  description: 'Parse claim dependencies, construct visual hierarchy trees, and evaluate patent scope offline.',
  icon: 'Layers',
  run: async (input: any) => input,
  component: PatentClaimMapper
};

