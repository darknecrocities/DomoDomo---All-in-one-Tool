const fs = require('fs');
const path = require('path');

function copyFiltered(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const sPath = path.join(src, item);
    const dPath = path.join(dest, item);
    const stat = fs.statSync(sPath);
    if (stat.isDirectory()) {
      copyFiltered(sPath, dPath);
    } else {
      // Exclude desktop installers and heavy demo media to stay well under Anna's 50MB quota
      if (item.endsWith('.dmg') || item.endsWith('.exe') || item.endsWith('.deb') || item.endsWith('.AppImage') || item.endsWith('.mov') || item.endsWith('.mp4') || item.endsWith('.webm')) continue;
      // Exclude files exceeding Anna's 10 MB per-file limit
      if (stat.size > 10 * 1024 * 1024) continue;
      fs.copyFileSync(sPath, dPath);
    }
  }
}

console.log('[Anna Bundle] Preparing bundle/ from dist/...');
fs.rmSync('bundle', { recursive: true, force: true });
copyFiltered('dist', 'bundle');
console.log('✅ Prepared clean bundle/ directory for Anna platform.');
