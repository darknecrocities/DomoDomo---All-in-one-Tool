import { triggerTextDownload, handleTextCopy } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { FileCode, Plus, Trash2, Download, Check, Copy, Search, Code } from 'lucide-react';

interface CodeNoteItem {
  id: string;
  title: string;
  lang: string;
  code: string;
}

const LANGUAGE_EXT: { [key: string]: string } = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  html: 'html',
  rust: 'rs',
  cpp: 'cpp'
};

export const CodeNotesTool = () => {
  const [notes, setNotes] = useState<CodeNoteItem[]>([
    {
      id: '1',
      title: 'Browser Canvas Grayscale Filter',
      lang: 'javascript',
      code: `// Grab pixel data and apply luminosity grayscale formula\nconst imgData = ctx.getImageData(0, 0, w, h);\nconst data = imgData.data;\nfor (let i = 0; i < data.length; i += 4) {\n  const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];\n  data[i] = gray;     // Red\n  data[i+1] = gray;   // Green\n  data[i+2] = gray;   // Blue\n}\nctx.putImageData(imgData, 0, 0);`
    },
    {
      id: '2',
      title: 'Python Sentence Tokenizer Weighting',
      lang: 'python',
      code: `# Basic frequency keyword weight tokenizer\nimport re\nfrom collections import Counter\n\ndef score_sentences(text, stop_words):\n    sentences = re.split(r'[.!?]+', text)\n    words = re.findall(r'\\b\\w+\\b', text.lower())\n    freq = Counter([w for w in words if w not in stop_words])\n    return [sum(freq[w] for w in s.lower().split()) for s in sentences]`
    }
  ]);

  const [activeNoteId, setActiveNoteId] = useState<string>('1');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const handleAddNote = () => {
    const newId = Math.random().toString();
    const newNote: CodeNoteItem = {
      id: newId,
      title: 'New Code Note',
      lang: 'javascript',
      code: '// Write code snippet here...'
    };
    setNotes(prev => [...prev, newNote]);
    setActiveNoteId(newId);
  };

  const handleRemoveNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notes.length === 1) {
      alert('You must keep at least one code note.');
      return;
    }
    const filtered = notes.filter(n => n.id !== id);
    setNotes(filtered);
    if (activeNoteId === id) {
      setActiveNoteId(filtered[0].id);
    }
  };

  const handleUpdateNote = (field: keyof CodeNoteItem, val: string) => {
    setNotes(prev => prev.map(n => {
      if (n.id === activeNoteId) {
        return { ...n, [field]: val };
      }
      return n;
    }));
  };

  const handleDownload = () => {
    if (!activeNote) return;
    const ext = LANGUAGE_EXT[activeNote.lang] || 'txt';
    const cleanTitle = activeNote.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    triggerTextDownload(activeNote.code, `${cleanTitle}.${ext}`);
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Sidebar List */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-5 flex flex-col gap-4 h-[500px]">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
              <FileCode size={16} />
              <span>Notes List</span>
            </h3>
            <button
              onClick={handleAddNote}
              className="py-1 px-3 bg-[#4E8E5E]/20 text-[#4E8E5E] border border-[#4E8E5E]/30 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-[#4E8E5E]/35"
            >
              <Plus size={10} />
              <span>Add Note</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search code notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#151C2C]/65 border border-slate-850 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          {/* Notes items list */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => { setActiveNoteId(note.id); setCopied(false); }}
                className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
                  activeNoteId === note.id
                    ? 'bg-[#4E8E5E]/15 border-[#4E8E5E] text-white shadow shadow-green-500/10'
                    : 'bg-[#151C2C]/30 border-slate-850 text-slate-450 hover:bg-[#151C2C]/50'
                }`}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-semibold text-xs truncate max-w-[150px]">{note.title}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-500">{note.lang}</span>
                </div>
                <button
                  onClick={(e) => handleRemoveNote(note.id, e)}
                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-850 rounded transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editor & Details Workspace */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {activeNote ? (
          <div className="glass-card p-6 flex flex-col gap-4 h-[500px]">
            {/* Header details */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateNote('title', e.target.value)}
                className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-[#4E8E5E] focus:outline-none text-base font-bold text-white max-w-sm sm:max-w-md w-full"
              />

              <select
                value={activeNote.lang}
                onChange={(e) => handleUpdateNote('lang', e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 font-semibold focus:outline-none shrink-0"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="html">HTML/CSS</option>
                <option value="rust">Rust</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            {/* Code Textarea */}
            <textarea
              value={activeNote.code}
              onChange={(e) => handleUpdateNote('code', e.target.value)}
              className="flex-1 bg-slate-950 p-4 text-xs font-mono text-slate-300 rounded-2xl border border-slate-900 resize-none focus:outline-none leading-relaxed outline-none"
            />

            <div className="flex justify-end gap-2 border-t border-slate-850 pt-3">
              <button
                onClick={() => handleTextCopy(activeNote.code, setCopied)}
                className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Save Code File</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card p-6 flex flex-col items-center justify-center h-[500px] text-slate-500 gap-2">
            <Code size={32} className="opacity-40" />
            <p className="text-xs">No active note selected.</p>
          </div>
        )}
      </div>
    </div>
  );
};
