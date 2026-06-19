import { triggerFileDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';




export const PodcastEditorTool = () => {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Podcast Editor</h3>
      <input type="file" multiple accept="audio/*" onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))} className="text-xs" />
      {files.map((f, i) => <div key={i} className="text-xs text-slate-400">🎙️ Track {i+1}: {f.name}</div>)}
      {files.length > 0 && <button onClick={() => triggerFileDownload(files[0], 'podcast_mix.mp3')} className="btn-primary w-full py-2 text-xs">Mix & Export</button>}
    </div>
  );
};
