const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWindows = process.platform === 'win32';
const venvPath = path.resolve(__dirname, '../.venv');

let pythonBin = isWindows 
  ? path.join(venvPath, 'Scripts', 'python.exe')
  : path.join(venvPath, 'bin', 'python');

// Fallback to global python if virtual environment is not found
if (!fs.existsSync(pythonBin)) {
  pythonBin = isWindows ? 'python' : 'python3';
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
