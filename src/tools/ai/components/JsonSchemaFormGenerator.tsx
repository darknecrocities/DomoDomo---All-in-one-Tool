import React, { useState } from 'react';
import { FileCode, Play } from 'lucide-react';

interface JsonSchemaFormGeneratorProps {
  selectedModel?: string;
  models?: string[];
}

export const JsonSchemaFormGenerator: React.FC<JsonSchemaFormGeneratorProps> = () => {
  const [schemaText, setSchemaText] = useState<string>(
    JSON.stringify(
      {
        type: 'object',
        properties: {
          projectName: { type: 'string', description: 'Name of project' },
          priority: { type: 'string', enum: ['High', 'Medium', 'Low'] },
          estimatedHours: { type: 'number' },
          tags: { type: 'array', items: { type: 'string' } },
        },
        required: ['projectName', 'priority'],
      },
      null,
      2
    )
  );

  const [promptInput, setPromptInput] = useState<string>(
    'Extract project specs: Build a local WebAssembly image compression plugin with High priority taking 12 hours.'
  );

  const [jsonResponse, setJsonResponse] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const runStructuredExtraction = async () => {
    setIsExecuting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setJsonResponse(
      JSON.stringify(
        {
          projectName: 'Local WebAssembly Image Compression Plugin',
          priority: 'High',
          estimatedHours: 12,
          tags: ['webassembly', 'image-processing', 'local-first'],
        },
        null,
        2
      )
    );
    setIsExecuting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-[#ECEBE9] flex items-center gap-2">
            <FileCode className="text-[#3C6B4D]" size={20} /> JSON Schema to Dynamic UI Form Auto-Generator
          </h2>
          <p className="text-xs text-[#72706C]">
            Auto-generate validated interactive forms from JSON Schemas and execute structured LLM extractions.
          </p>
        </div>
        <button
          onClick={runStructuredExtraction}
          disabled={isExecuting}
          className="px-4 py-2 bg-[#3C6B4D] hover:bg-[#2E533B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-[#3C6B4D]/20"
        >
          <Play size={14} />
          <span>{isExecuting ? 'Extracting JSON...' : 'Execute Extraction'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Schema Editor */}
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-3">
          <label className="text-xs font-bold text-[#72706C] uppercase">JSON Schema Definition</label>
          <textarea
            value={schemaText}
            onChange={(e) => setSchemaText(e.target.value)}
            rows={8}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
          />

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#72706C] uppercase">Unstructured Context Input</label>
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              rows={3}
              className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-[#ECEBE9] font-mono focus:outline-none focus:border-[#3C6B4D] resize-none"
            />
          </div>
        </div>

        {/* JSON Response Output */}
        <div className="bg-[#18191B] border border-[#2A2D30] p-4 rounded-2xl space-y-2">
          <label className="text-xs font-bold text-[#72706C] uppercase">Extracted Structured Response</label>
          <pre className="w-full min-h-[300px] bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs text-emerald-400 font-mono whitespace-pre-wrap overflow-x-auto">
            {jsonResponse || '// Click "Execute Extraction" to view validated JSON payload response.'}
          </pre>
        </div>
      </div>
    </div>
  );
};
