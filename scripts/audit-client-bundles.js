import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

// Define regex patterns that represent dangerous secrets or credentials in client bundles
const SENSITIVE_PATTERNS = [
  { name: 'PayMongo/Stripe Live Secret Key', regex: /sk_live_[0-9a-zA-Z]{24,}/g },
  { name: 'GitHub Personal Access Token', regex: /ghp_[0-9a-zA-Z]{36}|github_pat_[0-9a-zA-Z_]{82}/g },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/g },
  { name: 'OpenAI Secret API Key', regex: /sk-(?:proj-)?[a-zA-Z0-9_-]{40,}/g },
  { name: 'Private Key Block', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { name: 'GCP Service Account Private Key', regex: /"private_key"\s*:\s*"-----BEGIN/g },
  { name: 'Slack Bot Token', regex: /xoxb-[0-9]{10,}-[0-9]{10,}-[a-zA-Z0-9]{24,}/g },
  { name: 'Hardcoded Demo User Roster', regex: /u_admin_01|ninja@codepyne|explorer@codepyne/g }
];

function scanDirectory(dir, findings) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath, findings);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      // Scan text artifacts only
      if (['.js', '.mjs', '.cjs', '.json', '.html', '.css', '.txt', '.map'].includes(ext)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          for (const pattern of SENSITIVE_PATTERNS) {
            pattern.regex.lastIndex = 0;
            const matches = content.match(pattern.regex);
            if (matches && matches.length > 0) {
              findings.push({
                file: path.relative(distDir, fullPath),
                type: pattern.name,
                count: matches.length,
                sample: matches[0].substring(0, 10) + '...'
              });
            }
          }
        } catch (e) {
          console.warn(`[Bundle Audit] Warning reading ${fullPath}:`, e.message);
        }
      }
    }
  }
}

console.log('[Bundle Audit] Scanning production artifacts for sensitive credentials and keys...');
const findings = [];

if (fs.existsSync(distDir)) {
  scanDirectory(distDir, findings);
} else {
  console.log('[Bundle Audit] dist/ directory not found, skipping scan.');
  process.exit(0);
}

if (findings.length > 0) {
  console.error('\n🚨 [SECURITY ALERT] SENSITIVE TOKENS OR DUMMY CREDENTIALS DETECTED IN CLIENT BUNDLE:');
  findings.forEach((f) => {
    console.error(` - [${f.type}] in ${f.file} (${f.count} occurrence(s), sample: ${f.sample})`);
  });
  console.error('\nBuild aborted to prevent accidental secret leak to production. Remove the secrets before deploying!\n');
  process.exit(1);
} else {
  console.log('✅ [Bundle Audit] Pass! No private credentials, secret keys, or dummy rosters detected in distribution bundles.\n');
  process.exit(0);
}
