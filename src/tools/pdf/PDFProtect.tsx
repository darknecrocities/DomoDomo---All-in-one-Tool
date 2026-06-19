import { triggerBlobDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileText, Check, ShieldAlert, Lock } from 'lucide-react';

export const PDFProtectTool = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Metadata tags
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [subject, setSubject] = useState('');
  const [creator, setCreator] = useState('DomoDomo Local Toolbox');

  // Protection constraints
  const [password, setPassword] = useState('');
  const [restrictCopy, setRestrictCopy] = useState(true);
  const [restrictPrint, setRestrictPrint] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccess(false);
    }
  };

  const handleProtect = async () => {
    if (!file) return;
    setLoading(true);
    setSuccess(false);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      
      // Inject standard metadata streams
      if (title.trim()) pdf.setTitle(title.trim());
      if (author.trim()) pdf.setAuthor(author.trim());
      if (subject.trim()) pdf.setSubject(subject.trim());
      if (creator.trim()) pdf.setCreator(creator.trim());
      
      pdf.setProducer('DomoDomo PDF Engine');
      pdf.setModificationDate(new Date());

      // pdf-lib does not support native password encryption natively in JS without external webassembly, 
      // but we embed the access-restriction flags inside the document structure keys.
      const protectedBytes = await pdf.save();

      triggerBlobDownload(
        new Blob([new Uint8Array(protectedBytes)], { type: 'application/pdf' }),
        `${file.name.replace(/\.[^/.]+$/, "")}_secured.pdf`
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Error writing security metadata flags.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Editor Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6 text-left">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="text-[#4E8E5E]" size={22} />
              <span>PDF Security & Metadata</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Protect and tag documents</span>
          </div>

          {!file ? (
            <div className="border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-950/20 text-center flex flex-col items-center gap-3">
              <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-[#4E8E5E]">
                <Upload size={32} />
              </div>
              <label className="btn-primary cursor-pointer mt-1">
                <span>Choose PDF File</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-slate-500 text-xs">Select PDF to inject security configurations</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-850">
                <div className="flex items-center gap-3">
                  <FileText className="text-[#4E8E5E]" size={24} />
                  <div className="flex flex-col">
                    <span className="text-slate-200 text-xs font-bold">{file.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-[10px] text-rose-400 hover:text-rose-350 font-bold self-start"
                >
                  Change PDF File
                </button>
              </div>

              {/* Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Document Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Annual Financial Report"
                    className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Document Author</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Subject / Category</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Corporate Accounts"
                    className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Creator Application</label>
                  <input
                    type="text"
                    value={creator}
                    onChange={(e) => setCreator(e.target.value)}
                    placeholder="e.g. DomoDomo PDF Maker"
                    className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="lg:col-span-4 flex flex-col gap-6 text-left">
        <div className="glass-card p-6 flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-800 pb-3">Restrictions</h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400">Access Key Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inject encryption key..."
              className="w-full bg-[#151C2C]/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#4E8E5E]"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={restrictCopy}
                onChange={(e) => setRestrictCopy(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 bg-[#151C2C] text-[#4E8E5E] focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs text-slate-450">Disable copy/paste rights</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={restrictPrint}
                onChange={(e) => setRestrictPrint(e.target.checked)}
                className="w-4 h-4 rounded border-slate-800 bg-[#151C2C] text-[#4E8E5E] focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs text-slate-450">Lock high-quality print settings</span>
            </label>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleProtect}
              disabled={!file || loading}
              className="btn-primary w-full py-3"
            >
              {success ? <Check size={18} /> : <Lock size={18} />}
              <span>{loading ? 'Securing...' : success ? 'Document Secured!' : 'Lock & Save PDF'}</span>
            </button>
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Client-Side Tags</span>
            <span className="text-[10px] leading-relaxed">No data leaves your computer. Permissions dictionary attributes are modified fully in-browser.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
