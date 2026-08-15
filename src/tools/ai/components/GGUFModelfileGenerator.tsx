import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

interface GGUFModelfileGeneratorProps {
  selectedModel?: string;
  models?: string[];
}

export const GGUFModelfileGenerator: React.FC<GGUFModelfileGeneratorProps> = () => {
  const [hfUrl, setHfUrl] = useState<string>('https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF');
  const [modelName, setModelName] = useState<string>('my-custom-llama');
  const [systemPrompt, setSystemPrompt] = useState<string>('You are an expert AI assistant customized with custom stop tokens.');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [stopToken, setStopToken] = useState<string>('<|im_end|>');
  const [copied, setCopied] = useState<boolean>(false);

  const modelfileContent = `FROM ./llama-2-7b-chat.Q4_K_M.gguf\n\nSYSTEM """\n${systemPrompt}\n"""\n\nPARAMETER temperature ${temperature}\nPARAMETER stop "${stopToken}"\nPARAMETER repeat_penalty 1.1\n\nTEMPLATE """{{ .System }}\nUser: {{ .Prompt }}\nAssistant: """`;

  const shellCommand = `# 1. Download GGUF from HuggingFace\nwget ${hfUrl}/resolve/main/llama-2-7b-chat.Q4_K_M.gguf\n\n# 2. Build Modelfile\ncat << 'EOF' > Modelfile\n${modelfileContent}\nEOF\n\n# 3. Create Ollama Model Registry\nollama create ${modelName} -f ./Modelfile\n\n# 4. Run Model Live\nollama run ${modelName}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9] flex items-center gap-2">
            <Terminal className="text-[#3C6B4D]" size={20} /> Local AI Model Conversion &amp; GGUF Modelfile Generator
          </h2>
          <p className="text-xs text-[#72706C]">
            Generate custom Ollama Modelfile definitions &amp; HuggingFace GGUF deployment scripts.
          </p>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(shellCommand);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#3C6B4D]/20"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Command Copied!' : 'Copy Deploy Script'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Visual Parameter Form */}
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#72706C] uppercase">HuggingFace GGUF Model URL</label>
            <input
              type="text"
              value={hfUrl}
              onChange={(e) => setHfUrl(e.target.value)}
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#72706C] uppercase">Target Ollama Model Identifier</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl px-3 py-2 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#72706C] uppercase">Custom System Persona</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#72706C] uppercase">Temperature ({temperature})</label>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[#3C6B4D]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#72706C] uppercase">Stop Sequence</label>
              <input
                type="text"
                value={stopToken}
                onChange={(e) => setStopToken(e.target.value)}
                className="w-full bg-[#111213] border border-[#2A2D30] rounded-lg px-2 py-1 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D]"
              />
            </div>
          </div>
        </div>

        {/* Script Output */}
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
          <label className="text-xs font-bold text-[#72706C] uppercase">Generated Deploy Script</label>
          <pre className="w-full min-h-[260px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono whitespace-pre-wrap overflow-x-auto">
            {shellCommand}
          </pre>
        </div>
      </div>
    </div>
  );
};
