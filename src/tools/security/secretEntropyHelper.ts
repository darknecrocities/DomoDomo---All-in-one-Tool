export interface DiscoveredSecret {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium';
  line: number;
  match: string;
  entropy: number;
}

// Shannon Entropy Calculation: H(X) = -sum(p(x) * log2(p(x)))
export const calculateShannonEntropy = (str: string): number => {
  if (!str || str.length === 0) return 0;
  const freqs: { [char: string]: number } = {};
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    freqs[ch] = (freqs[ch] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const count of Object.values(freqs)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(2));
};

export const SECRET_PATTERNS = [
  { type: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/g, severity: 'critical' as const },
  { type: 'AWS Secret Key', regex: /(?:aws_secret_access_key|aws_secret|secret_key)\s*[:=]\s*["']?([A-Za-z0-9\/+=]{40})["']?/gi, severity: 'critical' as const },
  { type: 'GitHub Classic Token', regex: /ghp_[a-zA-Z0-9]{36}/g, severity: 'critical' as const },
  { type: 'GitHub Fine-Grained Token', regex: /github_pat_[a-zA-Z0-9_]{82}/g, severity: 'critical' as const },
  { type: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9]{48}/g, severity: 'critical' as const },
  { type: 'Stripe Secret Key', regex: /sk_live_[0-9a-zA-Z]{24}/g, severity: 'critical' as const },
  { type: 'Slack Bot Token', regex: /xoxb-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24}/g, severity: 'high' as const },
  { type: 'Google API Key', regex: /AIza[0-9A-Za-z-_]{35}/g, severity: 'high' as const },
  { type: 'Private SSH / RSA Key', regex: /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/g, severity: 'critical' as const },
  { type: 'JSON Web Token (JWT)', regex: /ey[A-Za-z0-9_-]{10,}\.ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, severity: 'medium' as const },
  { type: 'Database URI Credential', regex: /(?:postgres|mysql|mongodb(?:\+srv)?):\/\/[^:\s]+:([^@\s]+)@/gi, severity: 'critical' as const },
];

export const scanSecrets = (sourceCode: string, entropyThreshold: number = 4.2): DiscoveredSecret[] => {
  const list: DiscoveredSecret[] = [];
  const lines = sourceCode.split('\n');

  lines.forEach((lineText, lineIdx) => {
    const lineNum = lineIdx + 1;

    // 1. Signature based detection
    for (const pattern of SECRET_PATTERNS) {
      const matches = [...lineText.matchAll(new RegExp(pattern.regex))];
      for (const m of matches) {
        const matchStr = m[1] || m[0];
        list.push({
          id: `sec-${lineNum}-${m.index}`,
          type: pattern.type,
          severity: pattern.severity,
          line: lineNum,
          match: matchStr,
          entropy: calculateShannonEntropy(matchStr),
        });
      }
    }

    // 2. High-entropy token detection (words > 20 chars not already caught)
    const tokens = lineText.match(/[A-Za-z0-9+/=_-]{20,}/g) || [];
    for (const tok of tokens) {
      if (!list.some((item) => item.line === lineNum && item.match.includes(tok))) {
        const ent = calculateShannonEntropy(tok);
        if (ent >= entropyThreshold) {
          list.push({
            id: `ent-${lineNum}-${tok.slice(0, 6)}`,
            type: `High Entropy String (H=${ent})`,
            severity: ent > 4.6 ? 'high' : 'medium',
            line: lineNum,
            match: tok,
            entropy: ent,
          });
        }
      }
    }
  });

  return list;
};

export const redactSecrets = (sourceCode: string, findings: DiscoveredSecret[]): string => {
  let result = sourceCode;
  findings.forEach((item) => {
    const replacement = `[REDACTED_${item.type.replace(/[^A-Za-z0-9]/g, '_').toUpperCase()}]`;
    result = result.split(item.match).join(replacement);
  });
  return result;
};
