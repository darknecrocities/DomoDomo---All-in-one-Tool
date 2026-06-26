const fs = require('fs');
const files = fs.readdirSync('./src/tools/security/ai');
for (const f of files) {
  if (f.endsWith('.tsx')) {
    const p = `./src/tools/security/ai/${f}`;
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/callOllama/g, 'generateTextOllama');
    fs.writeFileSync(p, content);
  }
}
// Also remove RefreshCcw from AICodeAuditor
const p = `./src/tools/security/ai/AICodeAuditor.tsx`;
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/, RefreshCcw/g, '');
fs.writeFileSync(p, c);
