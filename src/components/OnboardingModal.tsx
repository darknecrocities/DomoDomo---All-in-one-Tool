import { useState } from 'react';
import { Shield, Sparkles, User, Brain, ArrowRight, ArrowLeft, Cpu } from 'lucide-react';
import { unifiedMemory } from '../utils/unifiedMemory';
import pandaOnboarding from '../assets/panda_onboarding.gif';

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Developer');
  const [experience, setExperience] = useState('Intermediate Practitioner');
  const [techStack, setTechStack] = useState('');
  const [hardwareTier, setHardwareTier] = useState('Standard Specs');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [tone, setTone] = useState('Analytical & Structured');

  const goalsList = [
    { id: 'coding', label: 'Code auditing & explaining' },
    { id: 'docs', label: 'Text summarization & translating' },
    { id: 'ocr', label: 'Image description & OCR' },
    { id: 'chat', label: 'Interactive chatbot Q&A' },
    { id: 'pdf', label: 'PDF file manipulation' }
  ];

  const toggleGoal = (goalLabel: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalLabel) 
        ? prev.filter(g => g !== goalLabel) 
        : [...prev, goalLabel]
    );
  };

  const handleFinish = async () => {
    const profile = {
      name: name.trim() || 'Explorer',
      role,
      experience,
      techStack: techStack.trim() || 'None Specified',
      hardwareTier,
      goals: selectedGoals.length > 0 ? selectedGoals : ['General Productivity'],
      tone,
      completedOnboarding: true
    };

    await unifiedMemory.saveUserIdentity(profile);
    localStorage.setItem('domodomo_onboarding_completed', 'true');
    onComplete();
  };

  const handleSkip = async () => {
    const defaultProfile = {
      name: 'Explorer',
      role: 'General User',
      experience: 'Intermediate Practitioner',
      techStack: 'None Specified',
      hardwareTier: 'Standard Specs',
      goals: ['General Productivity'],
      tone: 'Helpful & Direct',
      completedOnboarding: true
    };
    await unifiedMemory.saveUserIdentity(defaultProfile);
    localStorage.setItem('domodomo_onboarding_completed', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0d0e0f]/90 backdrop-blur-md px-4 emil-backdrop">
      <div className="relative w-full max-w-lg bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl text-left overflow-hidden emil-modal-container">
        {/* Glow indicator */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#3C6B4D]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-[#2A2D30]/60 pb-4">
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-[#3C6B4D]" />
            <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">Assistant Setup</span>
          </div>
          <span className="text-[10px] font-bold text-[#A3A09B] uppercase tracking-wide">
            Step {step} of 4
          </span>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-5 py-2">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="relative">
                <img 
                  src={pandaOnboarding} 
                  alt="Domo Panda Mascot" 
                  className="w-32 h-32 object-contain rounded-2xl border border-[#2A2D30] bg-[#111213]/40 p-2 shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3C6B4D] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#3C6B4D]"></span>
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#ECEBE9] flex items-center justify-center gap-2">
                  Meet Domo! 🐼✨
                </h2>
                <p className="text-xs text-[#A3A09B] max-w-sm mt-1">
                  Your offline, secure AI companion for software engineering, auditing, and document processing.
                </p>
              </div>
            </div>

            <div className="border-t border-[#2A2D30]/60 my-1" />

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#3C6B4D]/15 border border-[#3C6B4D]/25 rounded-xl text-[#3C6B4D]">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#ECEBE9]">100% Offline & Local-First</h3>
                <span className="text-[10px] text-[#3C6B4D] font-semibold">Privacy Pledge</span>
              </div>
            </div>

            <p className="text-[#A3A09B] text-xs leading-relaxed">
              DomoDomo operates strictly inside your browser sandbox. Any profile data, files, habits, or answers you provide here are <strong>saved locally on your machine (IndexedDB)</strong> and never sent to external servers.
            </p>

            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={handleSkip}
                className="px-4 py-2.5 text-xs font-semibold text-[#A3A09B] hover:text-[#ECEBE9] transition-colors"
              >
                Skip Setup
              </button>
              <button
                onClick={() => setStep(2)}
                className="btn-primary flex items-center gap-1 bg-[#3C6B4D] text-[#ECEBE9] px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-[#3C6B4D]/90"
              >
                <span>Get Started</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5 py-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#3C6B4D]/15 border border-[#3C6B4D]/25 rounded-2xl text-[#3C6B4D]">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#ECEBE9]">Who Are You?</h2>
                <span className="text-xs text-[#A3A09B]">Help the AI tailor context for your daily workflow</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#A3A09B] mb-1.5">Your Name or Nickname</label>
                <input
                  type="text"
                  placeholder="e.g. Arron, Developer X"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#3C6B4D]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#A3A09B] mb-1.5">What is your primary Role?</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#3C6B4D]"
                >
                  <option value="Developer">Developer / Software Engineer</option>
                  <option value="Security Analyst">Cybersecurity Analyst / Auditor</option>
                  <option value="Student">Student / Academic</option>
                  <option value="Content Creator">Writer / Content Creator</option>
                  <option value="Explorer">General Explorer</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs text-[#A3A09B] hover:text-[#ECEBE9] transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-primary flex items-center gap-1 bg-[#3C6B4D] text-[#ECEBE9] px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-[#3C6B4D]/90"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5 py-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#3C6B4D]/15 border border-[#3C6B4D]/25 rounded-2xl text-[#3C6B4D]">
                <Cpu size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#ECEBE9]">Skills & Technical Stack</h2>
                <span className="text-xs text-[#A3A09B]">Help the assistant understand your technical specs</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#A3A09B] mb-1.5">Expertise Level</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#3C6B4D]"
                >
                  <option value="Novice / Learning the basics">Novice / Learning the basics</option>
                  <option value="Intermediate Practitioner">Intermediate Practitioner</option>
                  <option value="Professional / Senior Specialist">Professional / Senior Specialist</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#A3A09B] mb-1.5">Preferred Languages or Stack</label>
                <input
                  type="text"
                  placeholder="e.g. TypeScript/React, Python/Django, Rust, C++"
                  value={techStack}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#3C6B4D]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#A3A09B] mb-1.5">Inference Hardware / Model Budget</label>
                <select
                  value={hardwareTier}
                  onChange={(e) => setHardwareTier(e.target.value)}
                  className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#3C6B4D]"
                >
                  <option value="Low Specs (Models &lt; 1.5B)">Low Specs (Uses small models: 0.5B - 1.5B)</option>
                  <option value="Standard Specs (Models 3B - 8B)">Standard Specs (Uses medium models: 3B - 8B)</option>
                  <option value="Heavy Specs (Models &gt; 14B)">Heavy Specs (Uses large models: &gt; 14B)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 text-xs text-[#A3A09B] hover:text-[#ECEBE9] transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              <button
                onClick={() => setStep(4)}
                className="btn-primary flex items-center gap-1 bg-[#3C6B4D] text-[#ECEBE9] px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-[#3C6B4D]/90"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-5 py-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#3C6B4D]/15 border border-[#3C6B4D]/25 rounded-2xl text-[#3C6B4D]">
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#ECEBE9]">Goals & Personality</h2>
                <span className="text-xs text-[#A3A09B]">Choose tone preferences and goals</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#A3A09B] mb-2">What will you use DomoDomo AI for? (Select goals)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {goalsList.map(g => {
                    const isSelected = selectedGoals.includes(g.label);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleGoal(g.label)}
                        className={`text-left px-3 py-2 rounded-lg text-[11px] font-semibold border transition-all ${
                          isSelected
                            ? 'bg-[#3C6B4D]/10 border-[#3C6B4D] text-[#ECEBE9]'
                            : 'bg-[#111213] border-[#2A2D30] text-[#A3A09B] hover:border-[#3C6B4D]/50'
                        }`}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#A3A09B] mb-1.5">Assistant Response Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-[#3C6B4D]"
                >
                  <option value="Direct & Brief">Direct & Brief (Saves local tokens)</option>
                  <option value="Analytical & Structured">Analytical & Structured (Highly technical)</option>
                  <option value="Friendly & Conversational">Friendly & Conversational (Helpful tutor)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 text-xs text-[#A3A09B] hover:text-[#ECEBE9] transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              <button
                onClick={handleFinish}
                className="btn-primary flex items-center gap-1 bg-[#3C6B4D] text-[#ECEBE9] px-5 py-2.5 rounded-lg text-xs font-semibold hover:bg-[#3C6B4D]/90"
              >
                <span>Finish Setup</span>
                <CheckCircle size={14} className="text-[#ECEBE9]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper for UI Icon import compatibility
const CheckCircle = ({ size, className }: { size: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);
