import React, { useState, useMemo } from 'react';
import {
  FileCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import {
  type ValidationError,
  generateJsonSchema,
  validateJsonAgainstSchema,
} from './jsonSchemaHelper';

export type { ValidationError };
export { generateJsonSchema, validateJsonAgainstSchema };

export const JsonSchemaValidatorTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'validate' | 'generate'>('validate');

  const [sampleJson, setSampleJson] = useState<string>(
    JSON.stringify(
      {
        id: 'usr_98124',
        name: 'Alex Hunter',
        email: 'alex@example.com',
        age: 28,
        isActive: true,
        roles: ['admin', 'engineer'],
        address: {
          city: 'San Francisco',
          zip: '94107',
        },
      },
      null,
      2
    )
  );

  const [schemaText, setSchemaText] = useState<string>(() => {
    const initialObj = {
      id: 'usr_98124',
      name: 'Alex Hunter',
      email: 'alex@example.com',
      age: 28,
      isActive: true,
      roles: ['admin', 'engineer'],
      address: {
        city: 'San Francisco',
        zip: '94107',
      },
    };
    return JSON.stringify(generateJsonSchema(initialObj, 'UserProfile'), null, 2);
  });

  const [copied, setCopied] = useState<boolean>(false);

  // Auto-generate Schema from sample JSON
  const generatedSchema = useMemo(() => {
    try {
      const parsed = JSON.parse(sampleJson);
      return JSON.stringify(generateJsonSchema(parsed), null, 2);
    } catch {
      return '// Invalid JSON payload in input';
    }
  }, [sampleJson]);

  // Validation execution
  const validationResults = useMemo(() => {
    try {
      const parsedData = JSON.parse(sampleJson);
      const parsedSchema = JSON.parse(schemaText);
      const errs = validateJsonAgainstSchema(parsedData, parsedSchema);
      return { valid: errs.length === 0, errors: errs, errorText: null };
    } catch (e: any) {
      return { valid: false, errors: [], errorText: e.message };
    }
  }, [sampleJson, schemaText]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSchema = () => {
    const blob = new Blob([activeTab === 'generate' ? generatedSchema : schemaText], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2A2D30] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A3A09B] uppercase tracking-wider mb-1">
            <span>Data Suite</span>
            <span>/</span>
            <span className="text-white">Schema Engineering</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCode className="text-[#D4AF37]" size={24} />
            <span>JSON Schema Validator & Generator</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Validate JSON payloads against JSON Schema (Draft-07) and infer schemas with deep error pointers offline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCopy(activeTab === 'generate' ? generatedSchema : schemaText)}
            className="px-3 py-2 bg-[#18191B] border border-[#2A2D30] hover:bg-[#2A2D30] text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            {copied ? <Check size={14} className="text-[#D4AF37]" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Schema'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadSchema}
            className="px-4 py-2 bg-white text-black hover:bg-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Download size={14} />
            <span>Download Schema</span>
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 bg-[#18191B] border border-[#2A2D30] p-1.5 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('validate')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'validate' ? 'bg-white text-black' : 'text-[#A3A09B] hover:text-white'
          }`}
        >
          Validate JSON vs Schema
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'generate' ? 'bg-white text-black' : 'text-[#A3A09B] hover:text-white'
          }`}
        >
          Auto-Infer Schema from Data
        </button>
      </div>

      {/* Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sample JSON */}
        <div className="lg:col-span-6 bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">
              JSON Data Instance
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Payload</span>
          </div>

          <textarea
            rows={15}
            value={sampleJson}
            onChange={(e) => setSampleJson(e.target.value)}
            className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-white leading-relaxed resize-none"
          />
        </div>

        {/* Right Column: Schema View / Validation Results */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {activeTab === 'validate' ? (
            <>
              {/* Schema Text Input */}
              <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">
                    JSON Schema (Draft-07)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSchemaText(generatedSchema)}
                    className="text-[11px] text-[#D4AF37] hover:underline"
                  >
                    Sync Inferred Schema
                  </button>
                </div>
                <textarea
                  rows={9}
                  value={schemaText}
                  onChange={(e) => setSchemaText(e.target.value)}
                  className="w-full bg-[#111213] border border-[#2A2D30] rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-white leading-relaxed resize-none"
                />
              </div>

              {/* Validation Feedback Box */}
              <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-3">
                <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#D4AF37]" />
                  <span>Validation Diagnostic Verdict</span>
                </span>

                {validationResults.errorText ? (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>JSON Parsing Error: {validationResults.errorText}</span>
                  </div>
                ) : validationResults.valid ? (
                  <div className="p-3 bg-white/5 border border-white/20 rounded-xl text-white text-xs flex items-center gap-2 font-medium">
                    <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0" />
                    <span>Payload is 100% compliant with the provided JSON Schema.</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {validationResults.errors.map((err, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2"
                      >
                        <AlertCircle size={14} className="shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono font-bold">{err.path}</span>
                          <span>{err.message}</span>
                          {err.expected && (
                            <span className="text-[10px] text-red-400">
                              Expected: {err.expected} | Received: {err.received}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Auto-Inferred Schema Mode */
            <div className="bg-[#18191B] border border-[#2A2D30] rounded-2xl p-5 flex flex-col gap-3">
              <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">
                Inferred Draft-07 JSON Schema
              </span>
              <pre className="p-3 bg-[#111213] border border-[#2A2D30] rounded-xl text-xs font-mono text-white overflow-auto max-h-[380px] leading-relaxed">
                {generatedSchema}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Footer Security */}
      <div className="flex items-center gap-2 p-3 bg-[#18191B] border border-[#2A2D30] rounded-xl text-[11px] text-[#A3A09B]">
        <ShieldCheck size={16} className="text-[#D4AF37] shrink-0" />
        <span>100% Client-side JSON Schema compilation. Your data never touches remote infrastructure.</span>
      </div>
    </div>
  );
};
