import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export const PasswordAnalyzerTool: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [score, setScore] = useState(0); // 0 to 4
  const [entropy, setEntropy] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [timeToCrack, setTimeToCrack] = useState('');

  useEffect(() => {
    analyzePassword(password);
  }, [password]);

  const analyzePassword = (pw: string) => {
    if (!pw) {
      setScore(0);
      setEntropy(0);
      setFeedback([]);
      setTimeToCrack('Instant');
      return;
    }

    let charPoolSize = 0;
    if (/[a-z]/.test(pw)) charPoolSize += 26;
    if (/[A-Z]/.test(pw)) charPoolSize += 26;
    if (/[0-9]/.test(pw)) charPoolSize += 10;
    if (/[^a-zA-Z0-9]/.test(pw)) charPoolSize += 32;

    const pwEntropy = pw.length * Math.log2(charPoolSize || 1);
    setEntropy(Math.round(pwEntropy));

    const issues = [];
    let currentScore = 0;

    if (pwEntropy > 80) currentScore = 4;
    else if (pwEntropy > 60) currentScore = 3;
    else if (pwEntropy > 40) currentScore = 2;
    else if (pwEntropy > 25) currentScore = 1;

    // Dictionary checks heuristics (simplified)
    const commonPatterns = ['123', 'password', 'qwerty', 'admin', 'letmein'];
    const lowerPw = pw.toLowerCase();
    for (const pattern of commonPatterns) {
      if (lowerPw.includes(pattern)) {
        issues.push(`Contains common dictionary pattern: "${pattern}"`);
        currentScore = Math.max(0, currentScore - 1);
      }
    }

    if (pw.length < 8) issues.push('Password is too short (minimum 8 characters).');
    if (!/[A-Z]/.test(pw)) issues.push('Missing uppercase letters.');
    if (!/[a-z]/.test(pw)) issues.push('Missing lowercase letters.');
    if (!/[0-9]/.test(pw)) issues.push('Missing numbers.');
    if (!/[^a-zA-Z0-9]/.test(pw)) issues.push('Missing special characters.');

    if (issues.length === 0 && currentScore >= 3) {
      issues.push('Strong password layout detected.');
    }

    setFeedback(issues);
    setScore(currentScore);

    // Rough time to crack estimation based on modern cracking rigs (100B guesses/sec)
    const combinations = Math.pow(charPoolSize, pw.length);
    const secondsToCrack = combinations / 100_000_000_000;
    
    if (secondsToCrack < 1) setTimeToCrack('Instant');
    else if (secondsToCrack < 60) setTimeToCrack(`${Math.round(secondsToCrack)} seconds`);
    else if (secondsToCrack < 3600) setTimeToCrack(`${Math.round(secondsToCrack / 60)} minutes`);
    else if (secondsToCrack < 86400) setTimeToCrack(`${Math.round(secondsToCrack / 3600)} hours`);
    else if (secondsToCrack < 31536000) setTimeToCrack(`${Math.round(secondsToCrack / 86400)} days`);
    else setTimeToCrack(`${Math.round(secondsToCrack / 31536000).toLocaleString()} years`);
  };

  const generateSecurePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let newPw = '';
    const array = new Uint32Array(16);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < 16; i++) {
      newPw += chars[array[i] % chars.length];
    }
    setPassword(newPw);
  };

  const getScoreColor = () => {
    if (score === 0) return 'bg-rose-500';
    if (score === 1) return 'bg-orange-500';
    if (score === 2) return 'bg-amber-500';
    if (score === 3) return 'bg-[#3C6B4D]';
    return 'bg-emerald-500';
  };

  const getScoreText = () => {
    if (score === 0) return 'Very Weak';
    if (score === 1) return 'Weak';
    if (score === 2) return 'Fair';
    if (score === 3) return 'Strong';
    return 'Very Strong';
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-[#ECEBE9] text-lg flex items-center gap-2">
              <Lock size={20} className="text-[#3C6B4D]" />
              Password Strength Analyzer
            </h3>
            <p className="text-[#A3A09B] text-xs mt-1">
              Test password entropy and brute-force resistance. Analysis runs 100% locally in your browser.
            </p>
          </div>
          <button onClick={generateSecurePassword} className="btn-primary text-xs px-4 py-2">
            Generate Secure Password
          </button>
        </div>
      </div>

      <div className="glass-card p-8 border-[#2A2D30] bg-[#111213] flex flex-col gap-8">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a password to analyze..."
            className="w-full bg-[#18191B] border-2 border-[#2A2D30] rounded-xl px-4 py-4 text-lg text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] transition-all placeholder:text-[#72706C] pr-12 font-mono"
          />
          <button 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#72706C] hover:text-[#ECEBE9] transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {password.length > 0 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                <span className={`${score >= 3 ? 'text-[#3C6B4D]' : 'text-rose-450'}`}>{getScoreText()}</span>
                <span className="text-[#A3A09B]">{score}/4</span>
              </div>
              <div className="flex gap-1 h-2">
                {[0, 1, 2, 3].map((segment) => (
                  <div 
                    key={segment}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      segment < score ? getScoreColor() : 'bg-[#2A2D30]'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-5 border-[#2A2D30] bg-[#18191B] flex flex-col gap-2">
                <span className="text-[10px] text-[#72706C] uppercase font-bold tracking-wider">Information Entropy</span>
                <span className="text-2xl font-bold text-[#ECEBE9] font-mono">{entropy} <span className="text-sm text-[#A3A09B]">bits</span></span>
                <p className="text-[10px] text-[#A3A09B] mt-1">Higher entropy means a larger search space for brute-force attacks. Aim for &gt;60 bits.</p>
              </div>
              
              <div className="glass-card p-5 border-[#2A2D30] bg-[#18191B] flex flex-col gap-2">
                <span className="text-[10px] text-[#72706C] uppercase font-bold tracking-wider">Estimated Time to Crack</span>
                <span className="text-2xl font-bold text-[#ECEBE9] font-mono">{timeToCrack}</span>
                <p className="text-[10px] text-[#A3A09B] mt-1">Based on modern high-end GPU arrays capable of 100 billion guesses per second.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-[#ECEBE9] uppercase tracking-wider">Analysis Feedback</span>
              <div className="flex flex-col gap-2">
                {feedback.map((f, i) => (
                  <div key={i} className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
                    f.includes('Strong') ? 'bg-[#3C6B4D]/10 text-[#3C6B4D] border-[#3C6B4D]/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {f.includes('Strong') ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
