import { useState } from 'react';
import { FileText, Sparkles, ShieldAlert, Sliders } from 'lucide-react';
import { handleTextCopy } from '../../utils/sharedHelpers';

export const CitationGeneratorTool = () => {
  const [sourceType, setSourceType] = useState<'book' | 'website' | 'journal'>('book');
  const [style, setStyle] = useState<'apa' | 'mla' | 'chicago' | 'harvard'>('apa');

  // Input states
  const [author, setAuthor] = useState('Parejas, Arron');
  const [title, setTitle] = useState('DomoDomo Project Local Architecture');
  const [year, setYear] = useState('2026');
  const [publisher, setPublisher] = useState('Domo Tech Labs');
  const [journal, setJournal] = useState('Journal of Offline Utility Research');
  const [volume, setVolume] = useState('14');
  const [issue, setIssue] = useState('3');
  const [url, setUrl] = useState('https://github.com/darknecrocities/DomoDomo');

  const [citation, setCitation] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    let result = '';
    const cleanAuthor = author.trim() || 'Anonymous';
    const cleanTitle = title.trim() || 'Untitled Source';
    const cleanYear = year.trim() || 'n.d.';
    const cleanPub = publisher.trim() || 'No Publisher';
    const cleanUrl = url.trim() || '';

    if (style === 'apa') {
      if (sourceType === 'book') {
        result = `${cleanAuthor}. (${cleanYear}). *${cleanTitle}*. ${cleanPub}.`;
      } else if (sourceType === 'website') {
        result = `${cleanAuthor}. (${cleanYear}). *${cleanTitle}*. Retrieved from ${cleanUrl || 'URL'}`;
      } else {
        result = `${cleanAuthor}. (${cleanYear}). ${cleanTitle}. *${journal}*, *${volume}*(${issue}).`;
      }
    } else if (style === 'mla') {
      if (sourceType === 'book') {
        result = `${cleanAuthor}. _${cleanTitle}_. ${cleanPub}, ${cleanYear}.`;
      } else if (sourceType === 'website') {
        result = `${cleanAuthor}. "${cleanTitle}." _DomoDomo Web_, ${cleanYear}, ${cleanUrl || 'URL'}.`;
      } else {
        result = `${cleanAuthor}. "${cleanTitle}." _${journal}_, vol. ${volume}, no. ${issue}, ${cleanYear}.`;
      }
    } else if (style === 'chicago') {
      if (sourceType === 'book') {
        result = `${cleanAuthor}. _${cleanTitle}_. City: ${cleanPub}, ${cleanYear}.`;
      } else if (sourceType === 'website') {
        result = `${cleanAuthor}. "${cleanTitle}." Last modified ${cleanYear}. ${cleanUrl || 'URL'}.`;
      } else {
        result = `${cleanAuthor}. "${cleanTitle}." _${journal}_ ${volume}, no. ${issue} (${cleanYear}).`;
      }
    } else if (style === 'harvard') {
      if (sourceType === 'book') {
        result = `${cleanAuthor}, ${cleanYear}. _${cleanTitle}_. ${cleanPub}.`;
      } else if (sourceType === 'website') {
        result = `${cleanAuthor}, ${cleanYear}. _${cleanTitle}_. Available at: &lt;${cleanUrl || 'URL'}&gt; [Accessed June 2026].`;
      } else {
        result = `${cleanAuthor}, ${cleanYear}. ${cleanTitle}. _${journal}_, ${volume}(${issue}).`;
      }
    }

    // Format italics roughly or clean up markers
    result = result.replace(/\*/g, '').replace(/_/g, '');
    setCitation(result);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Input panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-[#4E8E5E]" size={22} />
              <span>Bibliography Citation Generator</span>
            </h2>
          </div>

          {/* Form details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Author / Creator</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="e.g. Doe, John" className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400">Publication Year</label>
              <input type="text" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2026" className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs text-slate-400">Source Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Local Web Engineering Volume 1" className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 w-full" />
            </div>

            {sourceType === 'book' && (
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-slate-400">Publisher Company</label>
                <input type="text" value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="e.g. O'Reilly Media" className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
              </div>
            )}

            {sourceType === 'website' && (
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs text-slate-400">Website URL Link</label>
                <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="e.g. https://example.com" className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
              </div>
            )}

            {sourceType === 'journal' && (
              <>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs text-slate-400">Journal Name</label>
                  <input type="text" value={journal} onChange={(e) => setJournal(e.target.value)} placeholder="e.g. IEEE Transactions" className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Volume</label>
                  <input type="text" value={volume} onChange={(e) => setVolume(e.target.value)} placeholder="Volume" className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400">Issue</label>
                  <input type="text" value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="Issue Number" className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
                </div>
              </>
            )}
          </div>

          {citation && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs text-slate-455 font-bold uppercase tracking-wider">Generated Reference</span>
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 text-xs font-mono text-slate-300 leading-relaxed select-all">
                {citation}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Control panel */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center gap-2 text-teal-400 font-semibold border-b border-slate-800 pb-3">
            <Sliders size={18} />
            <span>Format Styles</span>
          </div>

          {/* Source Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 font-semibold">Source Material Type</label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="book">Book Print</option>
              <option value="website">Website URL Page</option>
              <option value="journal">Journal Paper</option>
            </select>
          </div>

          {/* Academic Style Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-500 font-semibold">Academic Format Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="apa">APA 7th Edition</option>
              <option value="mla">MLA 9th Edition</option>
              <option value="chicago">Chicago Manual</option>
              <option value="harvard">Harvard System</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
            <button onClick={handleGenerate} className="btn-primary w-full py-3">
              <Sparkles size={18} />
              <span>Compile Citation</span>
            </button>
            {citation && (
              <button
                onClick={() => handleTextCopy(citation, setCopied)}
                className="btn-secondary w-full py-2"
              >
                <span>{copied ? 'Copied Reference!' : 'Copy to Clipboard'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Local Processing Banner */}
        <div className="bg-[#151C2C]/50 border border-slate-800 rounded-2xl p-4 flex gap-3 text-slate-400">
          <ShieldAlert size={20} className="text-[#4E8E5E] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-300">100% Client-Side Citation</span>
            <span className="text-[10px] leading-relaxed">Bibliography formatting rules are calculated offline. No publication data is transmitted.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
