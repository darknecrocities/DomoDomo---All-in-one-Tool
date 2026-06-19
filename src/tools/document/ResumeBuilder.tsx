import { triggerTextDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';



export const ResumeBuilderTool = () => {
  const [name, setName] = useState('John Doe');
  const [skills, setSkills] = useState('React, TypeScript, CSS');

  const handleDownload = () => {
    const doc = `=========================\n${name.toUpperCase()}\n=========================\nSKILLS:\n${skills}\n=========================`;
    triggerTextDownload(doc, 'resume.txt');
  };

  return (
    <div className="max-w-md mx-auto glass-card p-6 flex flex-col gap-4 text-left">
      <h3 className="font-bold text-teal-400 border-b border-slate-800 pb-2">Resume Builder</h3>
      <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <input type="text" placeholder="Skills (comma separated)" value={skills} onChange={(e) => setSkills(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200" />
      <button onClick={handleDownload} className="btn-primary w-full py-2 text-xs">Generate Resume</button>
    </div>
  );
};
