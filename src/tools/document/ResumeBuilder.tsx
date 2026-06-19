import { triggerTextDownload } from '../../utils/sharedHelpers';
import { useState } from 'react';
import { FileText, Download, Layout } from 'lucide-react';

export const ResumeBuilderTool = () => {
  // Input states
  const [name, setName] = useState('Arron Kian Parejas');
  const [title, setTitle] = useState('Senior Full-Stack Developer');
  const [email, setEmail] = useState('arron@domodomo.local');
  const [phone, setPhone] = useState('+63 912 3456');
  const [location, setLocation] = useState('Manila, Philippines');
  const [skills, setSkills] = useState('React, TypeScript, Node.js, WebAssembly, Git, Canvas APIs');
  
  // Experience
  const [company, setCompany] = useState('DomoDomo Tech Labs');
  const [role, setRole] = useState('Lead Software Engineer');
  const [expDates, setExpDates] = useState('2024 - Present');
  const [expSummary, setExpSummary] = useState('Architected offline-first web utility suite compiling complex processing tools in browser sandboxes.');

  // Education
  const [eduInst, setEduInst] = useState('Holy Angel University');
  const [eduDegree, setEduDegree] = useState('B.S. Computer Science');
  const [eduYear, setEduYear] = useState('2025');

  const [template, setTemplate] = useState<'modern' | 'classic' | 'technical'>('modern');

  // Compile formatted text output
  const compileResumeText = () => {
    return `==================================================
${name.toUpperCase()}
${title}
==================================================
Contact Info:
- Email: ${email}
- Phone: ${phone}
- Location: ${location}

--------------------------------------------------
SKILLS & CORE COMPETENCIES
--------------------------------------------------
${skills.split(',').map(s => `* ${s.trim()}`).join('\n')}

--------------------------------------------------
PROFESSIONAL EXPERIENCE
--------------------------------------------------
${company} | ${role} (${expDates})
${expSummary}

--------------------------------------------------
EDUCATION
--------------------------------------------------
${eduInst}
${eduDegree} (Class of ${eduYear})
==================================================`;
  };

  const handleDownload = () => {
    const text = compileResumeText();
    triggerTextDownload(text, `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_resume.txt`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Inputs Forms */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 max-h-[600px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-[#4E8E5E]" size={22} />
              <span>Resume Builder Form</span>
            </h2>
          </div>

          {/* Personal Details */}
          <div className="flex flex-col gap-3">
            <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">1. Personal Info</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500">Job Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500">Email Address</label>
                <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500">Phone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
            </div>
          </div>

          {/* Professional Experience */}
          <div className="flex flex-col gap-3 pt-3 border-t border-slate-850">
            <span className="text-xs text-slate-455 font-bold uppercase tracking-wider">2. Employment Experience</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500">Company Name</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500">Your Role</label>
                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500">Dates Employed</label>
              <input type="text" value={expDates} onChange={(e) => setExpDates(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500">Work Summary</label>
              <textarea value={expSummary} onChange={(e) => setExpSummary(e.target.value)} className="bg-slate-900 border border-slate-800 rounded p-2.5 text-xs text-slate-200 resize-none h-16" />
            </div>
          </div>

          {/* Education */}
          <div className="flex flex-col gap-3 pt-3 border-t border-slate-850">
            <span className="text-xs text-slate-455 font-bold uppercase tracking-wider">3. Education</span>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[10px] text-slate-500">Institution</label>
                <input type="text" value={eduInst} onChange={(e) => setEduInst(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500">Year</label>
                <input type="text" value={eduYear} onChange={(e) => setEduYear(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-500">Degree/Major</label>
              <input type="text" value={eduDegree} onChange={(e) => setEduDegree(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-col gap-3 pt-3 border-t border-slate-850">
            <span className="text-xs text-slate-455 font-bold uppercase tracking-wider">4. Skills (Comma separated)</span>
            <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200" />
          </div>
        </div>
      </div>

      {/* Visual Live Preview Workspace */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-5 h-[600px] justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
              <Layout size={16} />
              <span>Live Compile Preview</span>
            </h3>
            
            {/* Template select */}
            <div className="flex p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px]">
              <button onClick={() => setTemplate('modern')} className={`px-2.5 py-1 rounded-md font-semibold ${template === 'modern' ? 'bg-[#4E8E5E] text-white' : 'text-slate-500 hover:text-slate-300'}`}>Modern</button>
              <button onClick={() => setTemplate('classic')} className={`px-2.5 py-1 rounded-md font-semibold ${template === 'classic' ? 'bg-[#4E8E5E] text-white' : 'text-slate-500 hover:text-slate-300'}`}>Classic</button>
              <button onClick={() => setTemplate('technical')} className={`px-2.5 py-1 rounded-md font-semibold ${template === 'technical' ? 'bg-[#4E8E5E] text-white' : 'text-slate-500 hover:text-slate-300'}`}>Technical</button>
            </div>
          </div>

          {/* Render layout */}
          <div className="flex-1 bg-slate-950 p-5 rounded-2xl border border-slate-900 overflow-y-auto leading-relaxed text-xs">
            {template === 'modern' ? (
              <div className="flex flex-col gap-4 text-slate-300 font-sans">
                <div className="border-b border-[#4E8E5E] pb-3 text-center">
                  <h1 className="text-xl font-bold text-white tracking-wide">{name}</h1>
                  <p className="text-xs text-[#4E8E5E] font-medium mt-0.5">{title}</p>
                  <p className="text-[10px] text-slate-500 mt-2">{email} | {phone} | {location}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#4E8E5E]">Skills</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{skills}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#4E8E5E]">Experience</span>
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>{company} — {role}</span>
                    <span className="text-slate-500">{expDates}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1">{expSummary}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#4E8E5E]">Education</span>
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>{eduInst}</span>
                    <span className="text-slate-500">Graduation {eduYear}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{eduDegree}</p>
                </div>
              </div>
            ) : (
              <pre className="font-mono text-[10px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                {compileResumeText()}
              </pre>
            )}
          </div>

          <div className="flex gap-2.5 pt-2 border-t border-slate-800">
            <button onClick={handleDownload} className="btn-primary w-full py-3">
              <Download size={18} />
              <span>Compile & Save Resume TXT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
