import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Zap,
  BookOpen,
  Code,
  Globe,
  Copy,
  Check,
  Cpu,
  MessageSquare,
  Info,
  Upload
} from 'lucide-react';
import { aiService } from '../../utils/aiService';

export const AIDomoSelection = () => {
  const [inputText, setInputText] = useState<string>(
    `// Paste your code or text here to interact with DomoDomo!\n\nfunction calculateFactorial(num) {\n  if (num < 0) return -1;\n  else if (num === 0) return 1;\n  else {\n    return (num * calculateFactorial(num - 1));\n  }\n}`
  );
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [ollamaActive, setOllamaActive] = useState<boolean>(false);
  const [models, setModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check Ollama status
  const checkStatus = async () => {
    try {
      const res = await aiService.checkOllama();
      setOllamaActive(res.status);
      setModels(res.models);
      if (res.status && res.models.length > 0) {
        const saved = aiService.getSelectedOllamaModel();
        setSelectedModel(saved && res.models.includes(saved) ? saved : res.models[0]);
      }
    } catch {
      setOllamaActive(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setInputText(text);
        setSelectedText('');
        setResponse(`📂 Loaded file: **${file.name}** (${(file.size / 1024).toFixed(1)} KB).\n\nYou can now highlight code segments or text, or select one of the action buttons below to run analysis!`);
      }
    };
    reader.onerror = () => {
      setResponse("❌ Failed to read uploaded file.");
    };
    reader.readAsText(file);
  };

  // Monitor text highlights in the textarea
  const handleSelection = () => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    if (start !== end) {
      const selection = inputText.substring(start, end);
      setSelectedText(selection);
    } else {
      setSelectedText('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const askDomo = async (action: 'explain' | 'optimize' | 'grammar' | 'translate') => {
    if (isLoading) return;
    setResponse('');
    
    const contextText = selectedText.trim() || inputText.trim();
    if (!contextText) {
      setResponse("💡 Domo here! Please write some text or select a segment for me to analyze first! 🧠");
      return;
    }

    setIsLoading(true);
    setStatusText('DomoDomo is thinking...');

    // Custom system persona
    const systemPrompt = `You are DomoDomo, a brilliant, friendly, slightly nerdy local-first assistant.
You speak with enthusiasm, using friendly emojis like 🚀, 💻, 🧠, 🪄, and 🛠️ to explain items.
Keep your responses concise, visually structured, and helpful. Always address the user as a fellow developer or creator.`;

    let userPrompt = '';
    if (action === 'explain') {
      userPrompt = `Please explain the following segment in detail:
"""
${contextText}
"""`;
    } else if (action === 'optimize') {
      userPrompt = `Please review and optimize/refactor this code snippet. List any potential bugs, runtime performance concerns, or syntax improvements, then provide the cleaned code:
"""
${contextText}
"""`;
    } else if (action === 'grammar') {
      userPrompt = `Please improve the grammar, structure, and professional tone of the following text segment, then provide the corrected version:
"""
${contextText}
"""`;
    } else if (action === 'translate') {
      userPrompt = `Please translate the following text to English (if it's in another language) or to clean, readable Spanish, French, and Japanese (if it is already English):
"""
${contextText}
"""`;
    }

    try {
      const result = await aiService.generateText(userPrompt, 600, (status) => {
        setStatusText(status);
      }, selectedModel || undefined, { systemPrompt, temperature: 0.7 });
      
      setResponse(result);
    } catch (err: any) {
      setResponse(`❌ Setup Error:\n\n${err.message || err}\n\nMake sure Ollama is running offline and has the model "${selectedModel || 'llama3.2:1b'}" downloaded.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18191B] to-[#1E2022] border border-[#2A2D30] p-6 shadow-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#3C6B4D]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#ECEBE9] flex items-center gap-2">
              <Sparkles className="text-[#3C6B4D]" size={22} />
              <span>DomoDomo Selection Explainer</span>
            </h1>
            <p className="text-xs text-[#A3A09B]">
              Highlight specific code blocks or sentences inside the workbench, choose an action, and get local explanations from DomoDomo.
            </p>
          </div>
          
          {/* Models selection panel */}
          <div className="flex items-center gap-2 bg-[#111213] p-1.5 rounded-xl border border-[#2A2D30]">
            <span className="text-[10px] font-bold text-[#72706C] uppercase px-2">Active:</span>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                aiService.setSelectedOllamaModel(e.target.value);
              }}
              disabled={!ollamaActive || models.length === 0}
              className="bg-[#18191B] border border-[#2A2D30] rounded-lg text-xs font-semibold px-2 py-1 text-[#ECEBE9] focus:outline-none"
            >
              {models.length > 0 ? (
                models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))
              ) : (
                <option>No Models Configured</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Editor & AI Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card bg-[#18191B] p-4 space-y-3 relative">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-[#A3A09B]">Interactive Workspace Editor</span>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer text-[10px] font-bold text-[#3C6B4D] hover:text-[#4A845F] bg-[#3C6B4D]/10 hover:bg-[#3C6B4D]/20 border border-[#3C6B4D]/25 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 shadow-sm">
                  <Upload size={12} />
                  <span>Upload File</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".txt,.js,.jsx,.ts,.tsx,.json,.md,.html,.css,.py,.java,.cpp,.c"
                    onChange={handleFileUpload}
                  />
                </label>
                <span className="text-[10px] font-mono text-[#72706C]">
                  {selectedText ? '✏️ Selection Detected' : '💡 Highlight text to target Domo'}
                </span>
              </div>
            </div>
            
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onMouseUp={handleSelection}
              onKeyUp={handleSelection}
              className="w-full h-80 bg-[#111213] border border-[#2A2D30] rounded-xl p-4 font-mono text-xs text-[#ECEBE9] placeholder-[#72706C] focus:outline-none focus:border-[#3C6B4D]/50 leading-relaxed resize-y"
            />

            {/* Selection HUD */}
            {selectedText && (
              <div className="p-3 bg-[#3C6B4D]/5 border border-[#3C6B4D]/25 rounded-xl space-y-1.5 animate-fadeIn">
                <span className="text-[10px] font-mono font-bold text-[#3C6B4D] uppercase block">Highlighted Selection:</span>
                <p className="text-[11px] font-mono text-[#A3A09B] truncate leading-none">
                  "{selectedText}"
                </p>
              </div>
            )}
          </div>

          {/* Action Trigger Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => askDomo('explain')}
              disabled={isLoading}
              className="btn-secondary py-3 text-xs flex flex-col items-center gap-1.5 group bg-[#18191B]"
              title="Explain the highlighted text"
            >
              <BookOpen size={16} className="text-[#3C6B4D] group-hover:scale-110 transition-transform" />
              <span className="font-bold">Explain This</span>
            </button>
            <button
              onClick={() => askDomo('optimize')}
              disabled={isLoading}
              className="btn-secondary py-3 text-xs flex flex-col items-center gap-1.5 group bg-[#18191B]"
              title="Analyze and refactor selection"
            >
              <Code size={16} className="text-amber-500 group-hover:scale-110 transition-transform" />
              <span className="font-bold">Debug / Refactor</span>
            </button>
            <button
              onClick={() => askDomo('grammar')}
              disabled={isLoading}
              className="btn-secondary py-3 text-xs flex flex-col items-center gap-1.5 group bg-[#18191B]"
              title="Improve tone and writing style"
            >
              <Zap size={16} className="text-sky-500 group-hover:scale-110 transition-transform" />
              <span className="font-bold">Fix Grammar</span>
            </button>
            <button
              onClick={() => askDomo('translate')}
              disabled={isLoading}
              className="btn-secondary py-3 text-xs flex flex-col items-center gap-1.5 group bg-[#18191B]"
              title="Translate selection"
            >
              <Globe size={16} className="text-indigo-500 group-hover:scale-110 transition-transform" />
              <span className="font-bold">Translate</span>
            </button>
          </div>
        </div>

        {/* DomoDomo Chat Outputs (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card bg-[#18191B] border-[#2A2D30] p-5 flex flex-col justify-between min-h-[380px]">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[#2A2D30]/60 pb-3">
                <div className="w-8 h-8 rounded-full bg-[#3C6B4D]/10 border border-[#3C6B4D]/25 flex items-center justify-center font-bold text-[#3C6B4D] text-sm animate-pulse-slow">
                  🤖
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-extrabold text-[#ECEBE9]">DomoDomo AI response</h3>
                  <span className="text-[10px] font-mono text-[#72706C]">Offline LLM Agent</span>
                </div>
              </div>

              {/* Chat Content Panel */}
              <div className="text-xs leading-relaxed text-[#A3A09B] max-h-80 overflow-y-auto space-y-3 pr-1">
                {isLoading ? (
                  <div className="space-y-3 py-6 text-center animate-pulse">
                    <Cpu size={32} className="mx-auto text-[#3C6B4D] animate-spin" />
                    <span className="text-xs text-[#72706C] block">{statusText}</span>
                  </div>
                ) : response ? (
                  <div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] text-[#ECEBE9] overflow-y-auto space-y-2 max-h-[450px]">
                    {renderMarkdown(response)}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-2">
                    <MessageSquare size={36} className="mx-auto text-[#72706C] stroke-[1.5]" />
                    <h4 className="font-bold text-[#ECEBE9]">DomoDomo is Ready</h4>
                    <p className="text-[11px] text-[#72706C] max-w-xs mx-auto">
                      Write your script or notes in the editor, highlight a specific code segment, and select an action to begin.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Copy button */}
            {response && !isLoading && (
              <button
                onClick={handleCopy}
                className="btn-secondary py-2 mt-4 text-xs w-full flex items-center justify-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Response</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Offline local configuration warning */}
          {!ollamaActive && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs flex items-start gap-2.5">
              <Info size={16} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Local Server Offline</span>
                <span>Configure your local Ollama server to pull models and enable web client queries.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// Custom Lightweight Markdown Parser for Premium Text & Code Presentation
const renderMarkdown = (text: string) => {
  if (!text) return null;

  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const language = match ? match[1] : '';
      const code = match ? match[2] : part.slice(3, -3);

      return (
        <div key={i} className="my-3 rounded-lg overflow-hidden border border-[#2A2D30] bg-[#0A0B0C] text-left">
          {language && (
            <div className="bg-[#151618] px-3 py-1.5 text-[10px] font-mono text-[#72706C] border-b border-[#2A2D30]/60 uppercase tracking-wider flex justify-between items-center">
              <span>{language}</span>
            </div>
          )}
          <pre className="p-3 overflow-x-auto font-mono text-[11px] text-[#ECEBE9] leading-relaxed">
            <code>{code}</code>
          </pre>
        </div>
      );
    }

    const lines = part.split('\n');
    return (
      <div key={i} className="space-y-1 text-left">
        {lines.map((line, lineIdx) => {
          const content = line;
          
          if (content.startsWith('### ')) {
            return (
              <h4 key={lineIdx} className="text-xs font-bold text-[#ECEBE9] mt-3 mb-1">
                {parseInlineMarkdown(content.slice(4))}
              </h4>
            );
          }
          if (content.startsWith('## ')) {
            return (
              <h3 key={lineIdx} className="text-sm font-extrabold text-[#ECEBE9] mt-4 mb-2">
                {parseInlineMarkdown(content.slice(3))}
              </h3>
            );
          }
          if (content.startsWith('# ')) {
            return (
              <h2 key={lineIdx} className="text-base font-black text-[#ECEBE9] mt-4 mb-2">
                {parseInlineMarkdown(content.slice(2))}
              </h2>
            );
          }

          if (content.trim().startsWith('- ') || content.trim().startsWith('* ')) {
            const listText = content.replace(/^\s*[-*]\s+/, '');
            return (
              <ul key={lineIdx} className="list-disc pl-4 my-1 text-xs text-[#A3A09B]">
                <li>{parseInlineMarkdown(listText)}</li>
              </ul>
            );
          }

          return (
            <p key={lineIdx} className="min-h-[1.2em] leading-relaxed text-xs text-[#A3A09B]">
              {parseInlineMarkdown(content)}
            </p>
          );
        })}
      </div>
    );
  });
};

const parseInlineMarkdown = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-extrabold text-[#ECEBE9]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="bg-[#111213] border border-[#2A2D30] px-1.5 py-0.5 rounded font-mono text-[10px] text-amber-400">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

export default AIDomoSelection;
