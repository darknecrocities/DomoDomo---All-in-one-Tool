import { useState } from 'react';
import { Shield, Sparkles, User, Brain, ArrowRight, ArrowLeft } from 'lucide-react';
import { unifiedMemory } from '../utils/unifiedMemory';

interface OnboardingModalProps {
  onComplete: () => void;
}

export const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Developer');
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
      goals: ['General Productivity'],
      tone: 'Helpful & Direct',
      completedOnboarding: true
    };
    await unifiedMemory.saveUserIdentity(defaultProfile);
    localStorage.setItem('domodomo_onboarding_completed', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0d0e0f]/90 backdrop-blur-md px-4">
      <div className="relative w-full max-w-lg bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl text-left overflow-hidden">
        {/* Glow indicator */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#3C6B4D]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-[#2A2D30]/60 pb-4">
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-[#3C6B4D]" />
            <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">Assistant Setup</span>
          </div>
          <span className="text-[10px] font-bold text-[#A3A09B] uppercase tracking-wide">
            Step {step} of 3
          </span>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-5 py-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#3C6B4D]/15 border border-[#3C6B4D]/25 rounded-2xl text-[#3C6B4D]">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#ECEBE9]">100% Secure & Offline</h2>
                <span className="text-xs text-[#3C6B4D] font-semibold">Privacy Pledge</span>
              </div>
            </div>

            <p className="text-[#A3A09B] text-xs leading-relaxed">
              DomoDomo operates strictly in your browser sandbox. Any information, files, habits, or answers you provide here are <strong>saved locally on your machine (IndexedDB)</strong>.
            </p>
            
            <div className="bg-[#111213] p-4 rounded-xl border border-[#2A2D30] text-[11px] text-[#A3A09B] leading-relaxed flex flex-col gap-2">
              <span className="text-[#3C6B4D] font-bold">Safe Sandbox Shield</span>
              <span>• No external servers will ever receive your profile data.</span>
              <span>• It operates as context for local LLMs (like Ollama) running locally.</span>
              <span>• You can purge or modify this data at any time under settings.</span>
            </div>

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
                onClick={() => setStep(2)}
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
