import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🤖 Generating public/updates.json from git history with security redaction...');

const SENSITIVE_KEYWORDS_REGEX = /(cve[-\d]*|slowloris|ddos|security|vulnerab|exploit|firewall|firebase|firestore|paymongo|secret|token|api[_\s-]?key|credentials|auth[-\s]?rule)/i;

try {
  // Extract last 15 commits in format: hash|date|author|subject
  const logOutput = execSync('git log -n 15 --pretty=format:"%h|%ad|%an|%s" --date=short', { encoding: 'utf-8' }).trim();
  const commits = logOutput.split('\n').filter(Boolean).map(line => {
    const parts = line.split('|');
    const hash = parts[0] || '';
    const date = parts[1] || '';
    let author = parts[2] || '';
    let message = parts.slice(3).join('|') || '';

    // Anonymize bot authors
    if (author.includes('bot') || author.includes('github-actions')) {
      author = 'DomoDomo Bot';
    }

    // Security Redaction: Replace any commit message referencing security fixes, CVEs, or internal rules
    if (SENSITIVE_KEYWORDS_REGEX.test(message)) {
      message = 'chore(system): performance, stability, and reliability improvements';
    }

    return { hash, date, author, message };
  });

  const pkgPath = path.join(__dirname, '../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const version = pkg.version || '2.5.0';

  const updateData = {
    version,
    buildTime: new Date().toISOString(),
    commits
  };

  const targetPath = path.join(__dirname, '../public/updates.json');
  fs.writeFileSync(targetPath, JSON.stringify(updateData, null, 2));

  const distPath = path.join(__dirname, '../dist/updates.json');
  if (fs.existsSync(path.dirname(distPath))) {
    fs.writeFileSync(distPath, JSON.stringify(updateData, null, 2));
  }

  console.log(`✅ Successfully generated sanitized updates.json with ${commits.length} entries at ${targetPath}`);
} catch (error) {
  console.error('❌ Failed to generate updates.json:', error);
  process.exit(1);
}
