const { spawnSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWindows = process.platform === 'win32';
const rootDir = path.resolve(__dirname, '..');
const venvPath = path.join(rootDir, '.venv');

// 1. Check and create virtual environment if missing
if (!fs.existsSync(venvPath)) {
  console.log('📦 Local Python virtual environment (.venv) not found. Initializing...');
  let systemPython = 'python3';
  if (isWindows) {
    systemPython = 'python';
  } else {
    try {
      const checkPy3 = spawnSync('which', ['python3']);
      if (checkPy3.status !== 0) {
        systemPython = 'python';
      }
    } catch (e) {
      systemPython = 'python';
    }
  }

  console.log(`🔨 Creating environment: ${systemPython} -m venv .venv`);
  const venvCreate = spawnSync(systemPython, ['-m', 'venv', '.venv'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });

  if (venvCreate.status !== 0) {
    console.error('❌ Failed to create virtual environment. Please install python3 on your machine.');
    process.exit(1);
  }
}

const pythonBin = isWindows 
  ? path.join(venvPath, 'Scripts', 'python.exe')
  : path.join(venvPath, 'bin', 'python');

// 2. Check and install dependencies if requirements.txt modified or first run
const installedFlag = path.join(venvPath, '.installed_requirements');
const requirementsPath = path.join(rootDir, 'backend/requirements.txt');
let needsInstall = !fs.existsSync(installedFlag);

if (fs.existsSync(requirementsPath) && fs.existsSync(installedFlag)) {
  const reqStat = fs.statSync(requirementsPath);
  const flagStat = fs.statSync(installedFlag);
  if (reqStat.mtime > flagStat.mtime) {
    needsInstall = true;
  }
}

if (needsInstall) {
  console.log('📥 Installing Python dependencies from backend/requirements.txt...');
  
  // Upgrade pip
  spawnSync(pythonBin, ['-m', 'pip', 'install', '--upgrade', 'pip'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });

  const pipInstall = spawnSync(pythonBin, ['-m', 'pip', 'install', '-r', 'backend/requirements.txt'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });

  if (pipInstall.status === 0) {
    fs.writeFileSync(installedFlag, new Date().toISOString());
    console.log('✅ Python dependencies successfully installed.');
  } else {
    console.warn('⚠️ Warning: Python dependencies installation completed with errors.');
  }
}

console.log(`🐍 Starting Python FastAPI backend using: ${pythonBin}...`);

// Launch Uvicorn server as a child process
const backendProcess = spawn(pythonBin, ['-m', 'uvicorn', 'backend.main:app', '--port', '8000', '--reload'], {
  stdio: 'inherit',
  shell: true
});

backendProcess.on('close', (code) => {
  process.exit(code || 0);
});

// Handle termination signals to shut down cleanly
process.on('SIGINT', () => {
  backendProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  backendProcess.kill('SIGTERM');
  process.exit(0);
});
