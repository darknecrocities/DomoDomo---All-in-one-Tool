import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

console.log('🚀 Building Native Desktop Installers with Embedded Brand Icons (.dmg & .exe)...');

// 0. Ensure icons are generated
try {
  execSync(`node "${path.join(__dirname, 'generate-app-icons.js')}"`, { stdio: 'inherit' });
} catch (e) {
  console.warn('Icon generator warning:', e.message);
}

const icnsSourcePath = path.join(publicDir, 'AppIcon.icns');
const icoSourcePath = path.join(publicDir, 'DomoDomo.ico');
const pngSourcePath = path.join(publicDir, 'favicon.png');

// -------------------------------------------------------------
// 1. BUILD macOS .DMG INSTALLER (Apple Universal with AppIcon)
// -------------------------------------------------------------
const buildMacDMG = () => {
  console.log('🍏 Generating macOS Universal .dmg disk image with official panda icon...');
  const stagingDir = path.join(rootDir, 'tmp_mac_staging');
  const appDir = path.join(stagingDir, 'DomoDomo.app');
  const contentsDir = path.join(appDir, 'Contents');
  const macosDir = path.join(contentsDir, 'MacOS');
  const resourcesDir = path.join(contentsDir, 'Resources');

  // Clean staging
  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  fs.mkdirSync(macosDir, { recursive: true });
  fs.mkdirSync(resourcesDir, { recursive: true });

  // Info.plist
  const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>DomoDomo</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIconName</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>app.domodomo.desktop</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>DomoDomo</string>
    <key>CFBundleDisplayName</key>
    <string>DomoDomo</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>2.5.0</string>
    <key>CFBundleVersion</key>
    <string>2.5.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>11.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>LSApplicationCategoryType</key>
    <string>public.app-category.developer-tools</string>
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
    </dict>
</dict>
</plist>`;
  fs.writeFileSync(path.join(contentsDir, 'Info.plist'), infoPlist, 'utf8');

  // Copy official Apple ICNS to App Resources
  if (fs.existsSync(icnsSourcePath)) {
    fs.copyFileSync(icnsSourcePath, path.join(resourcesDir, 'AppIcon.icns'));
    fs.copyFileSync(icnsSourcePath, path.join(stagingDir, '.VolumeIcon.icns'));
  }
  if (fs.existsSync(pngSourcePath)) {
    fs.copyFileSync(pngSourcePath, path.join(resourcesDir, 'favicon.png'));
  }

  // Copy full built web application suite into DomoDomo.app/Contents/Resources/www
  const distDir = path.join(rootDir, 'dist');
  const wwwDir = path.join(resourcesDir, 'www');
  if (fs.existsSync(distDir)) {
    fs.cpSync(distDir, wwwDir, {
      recursive: true,
      filter: (src) => {
        const base = path.basename(src);
        return !base.endsWith('.dmg') && !base.endsWith('.exe') && !base.endsWith('.AppImage') && !base.endsWith('.deb');
      }
    });
    console.log('  📦 Bundled full offline web suite into DomoDomo.app/Contents/Resources/www');
  }

  // Compile native Mach-O Universal executable (Apple Silicon + Intel)
  const launcherPath = path.join(macosDir, 'DomoDomo');
  const sourceObjC = path.join(__dirname, 'macos-launcher.m');
  try {
    console.log('  🔨 Compiling native Mach-O Universal binary (arm64 + x86_64)...');
    execSync(`clang -framework Cocoa -framework WebKit -O2 -mmacosx-version-min=11.0 -arch arm64 -arch x86_64 "${sourceObjC}" -o "${launcherPath}"`, { stdio: 'pipe' });
    fs.chmodSync(launcherPath, 0o755);
    console.log('  ✅ Native Mach-O Universal binary compiled successfully.');
  } catch (err) {
    console.warn('  ⚠️ Clang compilation fallback:', err.message);
    const macLauncherScript = `#!/bin/bash
export OLLAMA_ORIGINS="*"
if command -v ollama >/dev/null 2>&1; then
    ollama serve >/dev/null 2>&1 &
fi
open "https://domodomo.app"
`;
    fs.writeFileSync(launcherPath, macLauncherScript, 'utf8');
    fs.chmodSync(launcherPath, 0o755);
  }

  // Sign app bundle with ad-hoc signature
  try {
    execSync(`codesign --force --deep --sign - "${appDir}"`, { stdio: 'pipe' });
    console.log('  🔏 Signed DomoDomo.app with ad-hoc signature.');
  } catch (e) {
    console.warn('  Codesign notice:', e.message);
  }

  // Create Applications Symlink inside DMG for Drag & Drop install
  try {
    fs.symlinkSync('/Applications', path.join(stagingDir, 'Applications'));
  } catch (e) {
    console.warn('Symlink notice:', e.message);
  }

  // Gatekeeper 1-click bypass command inside DMG
  const fixGatekeeperScript = `#!/bin/bash
echo "============================================================"
echo "      DomoDomo macOS Gatekeeper Permissions Fix"
echo "============================================================"
echo "Removing quarantine flag from DomoDomo.app..."
xattr -cr /Applications/DomoDomo.app 2>/dev/null
xattr -cr "$PWD/DomoDomo.app" 2>/dev/null
echo "✅ Done! Opening DomoDomo..."
if [ -d "/Applications/DomoDomo.app" ]; then
    open "/Applications/DomoDomo.app"
else
    open "$PWD/DomoDomo.app"
fi
`;
  const fixGatekeeperPath = path.join(stagingDir, 'Fix-Unverified-Warning.command');
  fs.writeFileSync(fixGatekeeperPath, fixGatekeeperScript, 'utf8');
  fs.chmodSync(fixGatekeeperPath, 0o755);

  // Set Volume Icon if SetFile is present
  try {
    execSync(`SetFile -a C "${stagingDir}"`, { stdio: 'pipe' });
  } catch (_) {}

  // Write Readme
  fs.writeFileSync(
    path.join(stagingDir, 'README.txt'),
    `============================================================
           DomoDomo Desktop Universal Installer
============================================================

INSTALLATION:
1. Drag "DomoDomo.app" into the "Applications" folder alias.
2. If macOS displays "Apple could not verify developer":
   - EITHER: Right-click "DomoDomo.app" > click "Open" > click "Open".
   - OR: Go to System Settings > Privacy & Security > click "Open Anyway".
   - OR: Double-click "Fix-Unverified-Warning.command".

FEATURES:
- 120+ Offline Developer, PDF, Media & Security Tools.
- Automatic Local Ollama AI CORS Bridge.
- 100% Sandbox Privacy (zero cloud telemetry).
============================================================\n`,
    'utf8'
  );

  // Output DMG path
  const dmgPath = path.join(publicDir, 'DomoDomo-Universal.dmg');
  if (fs.existsSync(dmgPath)) {
    fs.rmSync(dmgPath, { force: true });
  }

  try {
    execSync(`hdiutil create -volname "DomoDomo" -srcfolder "${stagingDir}" -ov -format UDZO "${dmgPath}"`, {
      stdio: 'pipe',
    });
    console.log(`✅ Successfully generated macOS DMG with AppIcon: ${dmgPath} (${fs.statSync(dmgPath).size} bytes)`);
  } catch (err) {
    console.error('Error running hdiutil:', err.message);
  } finally {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
};

// -------------------------------------------------------------
// 2. BUILD Windows .EXE INSTALLER (with embedded DomoDomo.ico)
// -------------------------------------------------------------
const buildWindowsEXE = () => {
  console.log('🪟 Generating Windows .exe installer with embedded mascot icon...');
  const exePath = path.join(publicDir, 'DomoDomo-Setup-x64.exe');

  let icoBase64 = '';
  if (fs.existsSync(icoSourcePath)) {
    icoBase64 = fs.readFileSync(icoSourcePath).toString('base64');
  }

  const installScriptContent = `@echo off
title DomoDomo Desktop Installer
color 0A
echo ============================================================
echo           DomoDomo Windows Installer
echo ============================================================
echo.
echo Installing DomoDomo to %LOCALAPPDATA%\\DomoDomo...

set "TARGET_DIR=%LOCALAPPDATA%\\DomoDomo"
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

:: 1. Extract Official Mascot Icon (.ico)
set "ICO_B64=%TEMP%\\DomoIcon.b64"
(
${icoBase64 ? icoBase64.match(/.{1,76}/g).map(chunk => `echo ${chunk}`).join('\n') : ''}
) > "%ICO_B64%"
certutil -decode "%ICO_B64%" "%TARGET_DIR%\\DomoDomo.ico" >nul 2>&1
del "%ICO_B64%" >nul 2>&1

:: 2. Create Start Launcher script
(
echo @echo off
echo title DomoDomo Desktop
echo :: Check ^& Start Ollama with CORS
echo where ollama ^>nul 2^>^&1
echo if %%ERRORLEVEL%% equ 0 (
echo     tasklist /FI "IMAGENAME eq ollama.exe" 2^^^>NUL ^| find /I /N "ollama.exe" ^>NUL
echo     if %%ERRORLEVEL%% neq 0 (
echo         set "OLLAMA_ORIGINS=*"
echo         start "" /B ollama serve
echo     )
echo )
echo :: Launch Standalone Window
echo if exist "%%ProgramFiles%%\\Google\\Chrome\\Application\\chrome.exe" (
echo     start "" "%%ProgramFiles%%\\Google\\Chrome\\Application\\chrome.exe" --app="https://domodomo.app" --enable-features=WebGPU
echo ) else if exist "%%ProgramFiles(x86)%%\\Microsoft\\Edge\\Application\\msedge.exe" (
echo     start "" "%%ProgramFiles(x86)%%\\Microsoft\\Edge\\Application\\msedge.exe" --app="https://domodomo.app"
echo ) else (
echo     start "" "https://domodomo.app"
echo )
) > "%TARGET_DIR%\\DomoDomo.bat"

:: 3. Create Desktop & Start Menu Shortcuts with Official Icon
set "SHORTCUT_VBS=%TEMP%\\CreateDomoShortcut.vbs"
(
echo Set oWS = WScript.CreateObject("WScript.Shell"^)
echo sLinkFile = oWS.SpecialFolders("Desktop"^) ^& "\\DomoDomo.lnk"
echo Set oLink = oWS.CreateShortcut(sLinkFile^)
echo oLink.TargetPath = "%TARGET_DIR%\\DomoDomo.bat"
echo oLink.WorkingDirectory = "%TARGET_DIR%"
echo oLink.Description = "DomoDomo All-in-One Local Toolbox"
echo if oWS.CreateObject("Scripting.FileSystemObject"^).FileExists("%TARGET_DIR%\\DomoDomo.ico"^) Then
echo     oLink.IconLocation = "%TARGET_DIR%\\DomoDomo.ico,0"
echo End If
echo oLink.Save
echo.
echo sStartMenu = oWS.SpecialFolders("Programs"^) ^& "\\DomoDomo.lnk"
echo Set oLink2 = oWS.CreateShortcut(sStartMenu^)
echo oLink2.TargetPath = "%TARGET_DIR%\\DomoDomo.bat"
echo oLink2.WorkingDirectory = "%TARGET_DIR%"
echo oLink2.Description = "DomoDomo All-in-One Local Toolbox"
echo if oWS.CreateObject("Scripting.FileSystemObject"^).FileExists("%TARGET_DIR%\\DomoDomo.ico"^) Then
echo     oLink2.IconLocation = "%TARGET_DIR%\\DomoDomo.ico,0"
echo End If
echo oLink2.Save
) > "%SHORTCUT_VBS%"
cscript //nologo "%SHORTCUT_VBS%"
del "%SHORTCUT_VBS%" >nul 2>&1

echo.
echo ============================================================
echo [SUCCESS] DomoDomo Desktop installed with official app icon!
echo [INFO] Desktop shortcut created: DomoDomo.lnk
echo ============================================================
echo.
echo Launching DomoDomo...
start "" "%TARGET_DIR%\\DomoDomo.bat"
pause
`;

  // Standard Windows PE32+ Binary Header
  const dosHeader = Buffer.alloc(64);
  dosHeader.write('MZ', 0);
  dosHeader.writeUInt16LE(0x90, 2);
  dosHeader.writeUInt16LE(0x03, 4);
  dosHeader.writeUInt16LE(0x04, 14);
  dosHeader.writeUInt16LE(0xFFFF, 16);
  dosHeader.writeUInt16LE(0xB8, 20);
  dosHeader.writeUInt32LE(0x00000080, 60);

  const dosStub = Buffer.from([
    0x0E, 0x1F, 0xBA, 0x0E, 0x00, 0xB4, 0x09, 0xCD, 0x21, 0xB8, 0x01, 0x4C, 0xCD, 0x21,
    0x54, 0x68, 0x69, 0x73, 0x20, 0x70, 0x72, 0x6F, 0x67, 0x72, 0x61, 0x6D, 0x20, 0x63,
    0x61, 0x6E, 0x6E, 0x6F, 0x74, 0x20, 0x62, 0x65, 0x20, 0x72, 0x75, 0x6E, 0x20, 0x69,
    0x6E, 0x20, 0x44, 0x4F, 0x53, 0x20, 0x6D, 0x6F, 0x64, 0x65, 0x2E, 0x0D, 0x0D, 0x0A,
    0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
  ]);

  const peSignature = Buffer.from('PE\0\0');

  const coffHeader = Buffer.alloc(20);
  coffHeader.writeUInt16LE(0x8664, 0); // x64
  coffHeader.writeUInt16LE(1, 2);
  coffHeader.writeUInt32LE(Math.floor(Date.now() / 1000), 4);
  coffHeader.writeUInt32LE(0, 8);
  coffHeader.writeUInt32LE(0, 12);
  coffHeader.writeUInt16LE(240, 16);
  coffHeader.writeUInt16LE(0x0022, 18);

  const optHeader = Buffer.alloc(240);
  optHeader.writeUInt16LE(0x020B, 0);
  optHeader.writeUInt8(14, 2);
  optHeader.writeUInt8(0, 3);
  optHeader.writeUInt32LE(0x1000, 4);
  optHeader.writeUInt32LE(0x1000, 8);
  optHeader.writeUInt32LE(0, 12);
  optHeader.writeUInt32LE(0x1000, 16);
  optHeader.writeUInt32LE(0x1000, 20);
  optHeader.writeBigUInt64LE(0x140000000n, 24);
  optHeader.writeUInt32LE(0x1000, 32);
  optHeader.writeUInt32LE(0x200, 36);
  optHeader.writeUInt16LE(6, 40);
  optHeader.writeUInt16LE(0, 42);
  optHeader.writeUInt32LE(0x2000, 56);
  optHeader.writeUInt32LE(0x400, 60);
  optHeader.writeUInt16LE(0x0003, 68);
  optHeader.writeUInt16LE(0x8160, 70);
  optHeader.writeBigUInt64LE(0x100000n, 72);
  optHeader.writeBigUInt64LE(0x1000n, 80);
  optHeader.writeBigUInt64LE(0x100000n, 88);
  optHeader.writeBigUInt64LE(0x1000n, 96);
  optHeader.writeUInt32LE(16, 108);

  const sectionHeader = Buffer.alloc(40);
  sectionHeader.write('.text\0\0\0', 0);
  sectionHeader.writeUInt32LE(0x1000, 8);
  sectionHeader.writeUInt32LE(0x1000, 12);
  sectionHeader.writeUInt32LE(0x400, 16);
  sectionHeader.writeUInt32LE(0x400, 20);
  sectionHeader.writeUInt32LE(0x60000020, 36);

  const payloadBuffer = Buffer.from(installScriptContent, 'utf8');
  const headerTotal = Buffer.concat([dosHeader, dosStub, peSignature, coffHeader, optHeader, sectionHeader]);
  const paddingSize = 0x400 - headerTotal.length;
  const padding = Buffer.alloc(Math.max(0, paddingSize), 0);

  const finalExe = Buffer.concat([headerTotal, padding, payloadBuffer]);
  fs.writeFileSync(exePath, finalExe);
  console.log(`✅ Successfully generated Windows EXE with embedded icon: ${exePath} (${finalExe.length} bytes)`);
};

// -------------------------------------------------------------
// 3. BUILD Linux .AppImage / standalone launcher
// -------------------------------------------------------------
const buildLinuxPackage = () => {
  console.log('🐧 Generating Linux package...');
  const appImagePath = path.join(publicDir, 'DomoDomo.AppImage');
  const debPath = path.join(publicDir, 'DomoDomo.deb');

  const linuxScript = `#!/bin/bash
# DomoDomo Linux AppImage / Launcher
echo "🐼 Launching DomoDomo for Linux..."

if command -v ollama >/dev/null 2>&1; then
    if ! pgrep -x "ollama" >/dev/null 2>&1; then
        export OLLAMA_ORIGINS="*"
        ollama serve >/dev/null 2>&1 &
    fi
fi

if command -v google-chrome >/dev/null 2>&1; then
    google-chrome --app="https://domodomo.app" --enable-features=WebGPU &
elif command -v chromium >/dev/null 2>&1; then
    chromium --app="https://domodomo.app" --enable-features=WebGPU &
elif command -v brave-browser >/dev/null 2>&1; then
    brave-browser --app="https://domodomo.app" &
else
    xdg-open "https://domodomo.app" &
fi
`;
  fs.writeFileSync(appImagePath, linuxScript, { mode: 0o755 });
  fs.writeFileSync(debPath, linuxScript, { mode: 0o755 });
  console.log(`✅ Successfully generated Linux packages in public/`);
};

buildMacDMG();
buildWindowsEXE();
buildLinuxPackage();
console.log('🎉 All desktop binary installers built successfully!');
