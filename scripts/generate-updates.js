import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🤖 Generating public/updates.json from git history...');

try {
  // Extract last 15 commits in format: hash|date|author|subject
  const logOutput = execSync('git log -n 15 --pretty=format:"%h|%ad|%an|%s" --date=short', { encoding: 'utf-8' }).trim();
  const commits = logOutput.split('\n').filter(Boolean).map(line => {
    const [hash, date, author, message] = line.split('|');
    return { hash, date, author, message };
  });

  const targetPath = path.join(__dirname, '../public/updates.json');
  fs.writeFileSync(targetPath, JSON.stringify(commits, null, 2));
  console.log(`✅ Successfully generated updates.json with ${commits.length} entries at ${targetPath}`);
} catch (error) {
  console.error('❌ Failed to generate updates.json:', error);
  process.exit(1);
}
