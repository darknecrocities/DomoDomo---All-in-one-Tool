const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/tools/security/ai');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\\`/g, '`');
  content = content.replace(/\\\$\{/g, '${');
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${file}`);
}
