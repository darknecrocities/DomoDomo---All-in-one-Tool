import React, { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, AlertTriangle, Link as LinkIcon, Info } from 'lucide-react';

export const URLAnalyzerTool: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Common high-value targets for typosquatting
  const targetDomains = [
    'google.com', 'paypal.com', 'apple.com', 'microsoft.com', 'amazon.com',
    'facebook.com', 'netflix.com', 'bankofamerica.com', 'chase.com', 'wellsfargo.com',
    'github.com', 'yahoo.com', 'linkedin.com', 'instagram.com', 'twitter.com'
  ];

  // Levenshtein distance algorithm
  const getDistance = (a: string, b: string) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            Math.min(matrix[i][j - 1] + 1, // insertion
                     matrix[i - 1][j] + 1) // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  };

  const analyzeUrl = () => {
    if (!urlInput.trim()) return;
    
    setAnalyzing(true);
    setResults(null);

    // Simulate analysis delay
    setTimeout(() => {
      let fullUrl = urlInput.trim();
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = 'https://' + fullUrl;
      }

      let parsedUrl;
      try {
        parsedUrl = new URL(fullUrl);
      } catch (e) {
        setResults({ error: 'Invalid URL format.' });
        setAnalyzing(false);
        return;
      }

      const domain = parsedUrl.hostname.toLowerCase();
      const findings = [];
      let riskScore = 0; // 0 to 10

      // 1. Homograph Detection (Non-ASCII characters)
      // Check for Cyrillic or other non-Latin characters often used to spoof English letters
      const nonAsciiRegex = /[^\x00-\x7F]/;
      if (nonAsciiRegex.test(domain)) {
        findings.push({
          type: 'danger',
          title: 'Homograph Attack Detected',
          desc: 'The domain contains non-standard (non-ASCII) characters. This is a common technique used to create fake domains that look identical to real ones (e.g., using Cyrillic "а" instead of English "a").'
        });
        riskScore += 8;
      }

      // 2. Typosquatting Detection
      // Check distance against target domains
      let typosquatMatch = null;
      for (const target of targetDomains) {
        if (domain === target) continue; // exact match is fine
        
        // Strip subdomains for comparison
        const domainParts = domain.split('.');
        const rootDomain = domainParts.length >= 2 ? `${domainParts[domainParts.length-2]}.${domainParts[domainParts.length-1]}` : domain;
        
        const dist = getDistance(rootDomain, target);
        // If distance is 1 or 2, it's very suspicious
        if (dist === 1 || dist === 2) {
          typosquatMatch = target;
          break;
        }
      }

      if (typosquatMatch) {
        findings.push({
          type: 'danger',
          title: 'Typosquatting Detected',
          desc: `This domain (${domain}) looks suspiciously similar to "${typosquatMatch}". Attackers use slight misspellings to steal credentials.`
        });
        riskScore += 7;
      }

      // 3. Length & Complexity
      if (domain.length > 50) {
        findings.push({
          type: 'warning',
          title: 'Unusually Long Domain',
          desc: 'The domain is very long, which is sometimes used to hide the true destination on mobile devices.'
        });
        riskScore += 2;
      }

      const hyphenCount = (domain.match(/-/g) || []).length;
      if (hyphenCount > 3) {
        findings.push({
          type: 'warning',
          title: 'Multiple Hyphens',
          desc: 'Domains with many hyphens (e.g., secure-login-update-account.com) are frequently used in phishing.'
        });
        riskScore += 3;
      }

      // 4. Protocol Security
      if (parsedUrl.protocol === 'http:') {
        findings.push({
          type: 'warning',
          title: 'Insecure Protocol',
          desc: 'The URL uses HTTP instead of HTTPS. Any data sent to this site is unencrypted and can be intercepted.'
        });
        riskScore += 3;
      }

      // 5. IP Address instead of Domain
      const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
      if (ipRegex.test(domain)) {
        findings.push({
          type: 'danger',
          title: 'IP Address Used as Domain',
          desc: 'Legitimate websites rarely use raw IP addresses in their URLs. This is highly suspicious.'
        });
        riskScore += 6;
      }

      // Cap risk score at 10
      riskScore = Math.min(10, riskScore);

      setResults({
        url: fullUrl,
        domain,
        protocol: parsedUrl.protocol,
        path: parsedUrl.pathname,
        query: parsedUrl.search,
        findings,
        riskScore
      });
      setAnalyzing(false);
    }, 800);
  };

  const getRiskColor = (score: number) => {
    if (score >= 7) return 'text-rose-450';
    if (score >= 4) return 'text-amber-500';
    return 'text-[#3C6B4D]';
  };

  const getRiskBg = (score: number) => {
    if (score >= 7) return 'bg-rose-500/10 border-rose-500/30';
    if (score >= 4) return 'bg-amber-500/10 border-amber-500/30';
    return 'bg-[#3C6B4D]/10 border-[#3C6B4D]/30';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 7) return 'High Risk';
    if (score >= 4) return 'Suspicious';
    return 'Likely Safe';
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col gap-4 text-left">
        <h3 className="font-bold text-[#ECEBE9] text-lg flex items-center gap-2">
          <LinkIcon size={20} className="text-[#3C6B4D]" />
          URL Safety Analyzer
        </h3>
        <p className="text-[#A3A09B] text-xs leading-relaxed">
          Paste a suspicious link to analyze it for typosquatting, homograph attacks (fake characters), and common phishing structures.
          Analysis is done completely locally via heuristics—no network requests are made to the URL.
        </p>
      </div>

      <div className="glass-card p-6 border-[#2A2D30] bg-[#111213] flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input 
            type="text" 
            placeholder="https://example.com/login" 
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && analyzeUrl()}
            className="w-full bg-[#18191B] border border-[#2A2D30] rounded-xl px-4 py-3 text-sm text-[#ECEBE9] focus:outline-none focus:border-[#3C6B4D] transition-all placeholder:text-[#72706C] font-mono"
          />
          <button 
            onClick={analyzeUrl}
            disabled={analyzing || !urlInput.trim()}
            className="btn-primary py-3 px-8 text-sm shrink-0 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {analyzing ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Search size={16} />
            )}
            <span>Analyze</span>
          </button>
        </div>
      </div>

      {results && results.error && (
        <div className="glass-card p-6 border-[#2A2D30] bg-[#18191B] flex flex-col items-center justify-center text-center gap-3">
          <ShieldAlert size={32} className="text-amber-500" />
          <h4 className="text-[#ECEBE9] font-bold">Invalid URL Format</h4>
          <p className="text-[#A3A09B] text-xs">Please enter a valid web address starting with http:// or https://</p>
        </div>
      )}

      {results && !results.error && (
        <div className="flex flex-col gap-6">
          <div className={`glass-card p-8 border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${getRiskBg(results.riskScore)}`}>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#72706C]">Risk Assessment</span>
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-extrabold tracking-tight ${getRiskColor(results.riskScore)}`}>
                  {getRiskLabel(results.riskScore)}
                </span>
                <span className={`text-sm font-bold px-2 py-1 rounded-lg border ${getRiskBg(results.riskScore)} ${getRiskColor(results.riskScore)}`}>
                  Score: {results.riskScore}/10
                </span>
              </div>
              <p className="text-xs text-[#ECEBE9] font-mono mt-2 break-all p-3 bg-[#111213] rounded-lg border border-[#2A2D30]">
                {results.url}
              </p>
            </div>
            
            <div className="shrink-0">
              {results.riskScore >= 7 ? (
                <ShieldAlert size={64} className="text-rose-450 opacity-80" />
              ) : results.riskScore >= 4 ? (
                <AlertTriangle size={64} className="text-amber-500 opacity-80" />
              ) : (
                <ShieldCheck size={64} className="text-[#3C6B4D] opacity-80" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 border-[#2A2D30] bg-[#18191B] flex flex-col gap-1">
              <span className="text-[10px] text-[#72706C] uppercase font-bold tracking-wider">Domain</span>
              <span className="text-sm font-bold text-[#ECEBE9] font-mono truncate">{results.domain}</span>
            </div>
            <div className="glass-card p-4 border-[#2A2D30] bg-[#18191B] flex flex-col gap-1">
              <span className="text-[10px] text-[#72706C] uppercase font-bold tracking-wider">Protocol</span>
              <span className="text-sm font-bold text-[#ECEBE9] font-mono">{results.protocol.replace(':', '')}</span>
            </div>
            <div className="glass-card p-4 border-[#2A2D30] bg-[#18191B] flex flex-col gap-1">
              <span className="text-[10px] text-[#72706C] uppercase font-bold tracking-wider">Path</span>
              <span className="text-sm font-bold text-[#ECEBE9] font-mono truncate">{results.path || '/'}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-[#ECEBE9] text-sm flex items-center gap-2 uppercase tracking-wider text-[#72706C]">
              <Info size={16} />
              Analysis Findings
            </h4>
            
            <div className="flex flex-col gap-3">
              {results.findings.length === 0 ? (
                <div className="glass-card p-6 border-[#3C6B4D]/30 bg-[#3C6B4D]/5 flex items-start gap-3">
                  <ShieldCheck size={20} className="text-[#3C6B4D] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[#ECEBE9] text-sm">No Suspicious Patterns Detected</span>
                    <span className="text-[#A3A09B] text-xs leading-relaxed">
                      This URL passes basic heuristic checks. However, always verify the sender and ensure you are expecting this link before providing any credentials.
                    </span>
                  </div>
                </div>
              ) : (
                results.findings.map((f: any, i: number) => (
                  <div key={i} className={`glass-card p-5 border flex items-start gap-3 ${
                    f.type === 'danger' ? 'border-rose-500/30 bg-rose-500/5' : 'border-amber-500/30 bg-amber-500/5'
                  }`}>
                    <div className="shrink-0 mt-0.5">
                      {f.type === 'danger' ? (
                        <ShieldAlert size={18} className="text-rose-450" />
                      ) : (
                        <AlertTriangle size={18} className="text-amber-500" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`font-bold text-sm ${f.type === 'danger' ? 'text-rose-450' : 'text-amber-500'}`}>
                        {f.title}
                      </span>
                      <span className="text-[#A3A09B] text-xs leading-relaxed">{f.desc}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
