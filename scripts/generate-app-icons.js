import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const sourcePng = path.join(publicDir, 'favicon.png');

console.log('🎨 Generating High-Resolution Multi-Platform App Icons (ICNS, ICO, PNG)...');

// 1. Generate macOS AppIcon.icns using sips and iconutil
const iconsetDir = path.join(rootDir, 'tmp_AppIcon.iconset');
if (fs.existsSync(iconsetDir)) {
  fs.rmSync(iconsetDir, { recursive: true, force: true });
}
fs.mkdirSync(iconsetDir, { recursive: true });

const sizes = [
  { name: 'icon_16x16.png', size: 16 },
  { name: 'icon_16x16@2x.png', size: 32 },
  { name: 'icon_32x32.png', size: 32 },
  { name: 'icon_32x32@2x.png', size: 64 },
  { name: 'icon_128x128.png', size: 128 },
  { name: 'icon_128x128@2x.png', size: 256 },
  { name: 'icon_256x256.png', size: 256 },
  { name: 'icon_256x256@2x.png', size: 512 },
  { name: 'icon_512x512.png', size: 512 },
  { name: 'icon_512x512@2x.png', size: 1024 },
];

for (const { name, size } of sizes) {
  const outPath = path.join(iconsetDir, name);
  execSync(`sips -z ${size} ${size} "${sourcePng}" --out "${outPath}"`, { stdio: 'pipe' });
}

const icnsPath = path.join(publicDir, 'AppIcon.icns');
execSync(`iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`, { stdio: 'pipe' });
fs.rmSync(iconsetDir, { recursive: true, force: true });
console.log(`✅ Generated Apple AppIcon.icns: ${icnsPath} (${fs.statSync(icnsPath).size} bytes)`);

// 2. Generate Windows DomoDomo.ico with multi-resolution PNG frames
const icoSizes = [256, 128, 64, 48, 32, 16];
const icoFrames = [];

for (const size of icoSizes) {
  const tempFrame = path.join(rootDir, `tmp_ico_${size}.png`);
  execSync(`sips -z ${size} ${size} "${sourcePng}" --out "${tempFrame}"`, { stdio: 'pipe' });
  const data = fs.readFileSync(tempFrame);
  icoFrames.push({ size, data });
  fs.rmSync(tempFrame, { force: true });
}

// Build standard ICO file buffer
// Header: 6 bytes
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // 1 = ICO image
icoHeader.writeUInt16LE(icoFrames.length, 4); // count of images

let offset = 6 + (16 * icoFrames.length);
const dirEntries = [];
const imageBuffers = [];

for (const frame of icoFrames) {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(frame.size >= 256 ? 0 : frame.size, 0); // width
  entry.writeUInt8(frame.size >= 256 ? 0 : frame.size, 1); // height
  entry.writeUInt8(0, 2); // color count
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(frame.data.length, 8); // image size
  entry.writeUInt32LE(offset, 12); // image data offset

  dirEntries.push(entry);
  imageBuffers.push(frame.data);
  offset += frame.data.length;
}

const icoBuffer = Buffer.concat([icoHeader, ...dirEntries, ...imageBuffers]);
const icoPath = path.join(publicDir, 'DomoDomo.ico');
const faviconIcoPath = path.join(publicDir, 'favicon.ico');
fs.writeFileSync(icoPath, icoBuffer);
fs.writeFileSync(faviconIcoPath, icoBuffer);
console.log(`✅ Generated Windows DomoDomo.ico: ${icoPath} (${icoBuffer.length} bytes)`);

// 3. Generate standard resized PNGs (512px, 256px, 128px, 64px)
execSync(`sips -z 512 512 "${sourcePng}" --out "${path.join(publicDir, 'icon-512.png')}"`, { stdio: 'pipe' });
execSync(`sips -z 192 192 "${sourcePng}" --out "${path.join(publicDir, 'icon-192.png')}"`, { stdio: 'pipe' });
execSync(`sips -z 128 128 "${sourcePng}" --out "${path.join(publicDir, 'icon-128.png')}"`, { stdio: 'pipe' });
console.log('✅ Generated Standard PWA & Web Icons (icon-512.png, icon-192.png, icon-128.png)');

console.log('🎉 All desktop & web icon assets generated successfully!');
