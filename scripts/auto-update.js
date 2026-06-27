import { execSync } from 'child_process';

console.log('🤖 Checking for remote updates on main branch...');
try {
  // Fetch remote state silently
  execSync('git fetch origin main', { stdio: 'ignore', timeout: 8000 });
  
  // Count commits behind origin/main
  const commits = execSync('git log HEAD..origin/main --oneline', { encoding: 'utf-8' }).trim();
  if (commits) {
    const count = commits.split('\n').length;
    console.log(`\n🔄 Local branch is behind origin/main by ${count} commits.`);
    console.log('📦 Automatically pulling latest updates...');
    
    // Pull updates
    execSync('git pull origin main', { stdio: 'inherit' });
    
    console.log('⚙️ Installing new dependencies (if any)...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('✅ Updates pulled and installed successfully!\n');
  } else {
    console.log('✅ Local repository is fully up to date with origin/main.\n');
  }
} catch (error) {
  console.log('⚠️ Could not check for updates (offline or remote unreachable). Starting app normally...\n');
}
