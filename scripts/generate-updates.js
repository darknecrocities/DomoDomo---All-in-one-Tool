import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🤖 Generating clean, privacy-locked public/updates.json...');

try {
  const pkgPath = path.join(__dirname, '../package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const version = pkg.version || '2.5.0';

  // Strictly minimalist release payload: NO commit logs, NO CVEs, NO author info, NO hashes
  const updateData = {
    version,
    buildTime: new Date().toISOString()
  };

  const targetPath = path.join(__dirname, '../public/updates.json');
  fs.writeFileSync(targetPath, JSON.stringify(updateData, null, 2));

  const distPath = path.join(__dirname, '../dist/updates.json');
  if (fs.existsSync(path.dirname(distPath))) {
    fs.writeFileSync(distPath, JSON.stringify(updateData, null, 2));
  }

  console.log(`✅ Successfully generated locked updates.json at ${targetPath}`);
} catch (error) {
  console.error('❌ Failed to generate updates.json:', error);
  process.exit(1);
}
