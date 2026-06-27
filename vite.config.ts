import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as fs from 'fs';
import * as path from 'path';
import { exec, execSync } from 'child_process';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-memory-db-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/memory' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const data = JSON.parse(body);
                fs.writeFileSync(path.resolve('./domodomo_knowledge.json'), JSON.stringify(data.events, null, 2), 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'success' }));
              } catch (err: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          } else if (req.url === '/api/memory' && req.method === 'GET') {
            try {
              const filePath = path.resolve('./domodomo_knowledge.json');
              if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ events: JSON.parse(data) }));
              } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ events: [] }));
              }
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          } else if (req.url === '/api/git-sha' && req.method === 'GET') {
            try {
              const sha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
              const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ sha, branch }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          } else if (req.url === '/api/git-check-updates' && req.method === 'GET') {
            try {
              // Fetch main updates (silent, non-blocking, short timeout)
              try {
                execSync('git fetch origin main', { timeout: 6000, stdio: 'ignore' });
              } catch (e) {
                // Fetch failed (probably offline), compare with local tracking refs
              }

              // Count commits between local HEAD and origin/main
              const commits = execSync('git log HEAD..origin/main --oneline', { encoding: 'utf-8' }).trim();
              const updateAvailable = commits.length > 0;
              const commitList = commits ? commits.split('\n').map(c => c.slice(8)) : [];
              const commitsCount = commitList.length;

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                updateAvailable,
                commitsCount,
                commits: commitList
              }));
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err.message }));
            }
          } else if (req.url === '/api/git-update' && req.method === 'POST') {
            res.writeHead(200, {
              'Content-Type': 'text/plain',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive'
            });
            const runCmd = (cmd: string): Promise<string> => {
              return new Promise((resolve, reject) => {
                res.write(`⚙️ Running: ${cmd}...\n`);
                exec(cmd, (error, stdout, stderr) => {
                  if (stdout) res.write(stdout);
                  if (stderr) res.write(stderr);
                  if (error) {
                    reject(error);
                  } else {
                    resolve(stdout);
                  }
                });
              });
            };
            (async () => {
              try {
                await runCmd('git pull origin main');
                await runCmd('npm install');
                res.write('\n✅ Update completed successfully! Reloading app...');
                res.end();
              } catch (e: any) {
                res.write(`\n❌ Update failed: ${e.message}\n`);
                res.end();
              }
            })();
          } else {
            next();
          }
        });
      }
    }
  ],
})
