import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as fs from 'fs';
import * as path from 'path';
import { exec, execSync } from 'child_process';

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: process.env.HOST || '127.0.0.1',
    watch: {
      usePolling: true,
    }
  },
  build: {
    cssMinify: 'esbuild',
  },
  plugins: [
    react(),
    {
      name: 'pwa-service-worker-generator',
      buildStart() {
        let commitHash = 'v1';
        try {
          commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
        } catch (e) {
          commitHash = `build-${Date.now()}`;
        }
        
        const swContent = `// DomoDomo PWA Service Worker (Auto-generated on build)
const CACHE_NAME = 'domodomo-cache-${commitHash}';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.png',
  '/icons.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip caching for backend/mcp APIs
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html') || caches.match('/');
        }
      });
    })
  );
});
`;
        fs.writeFileSync(path.resolve('./public/sw.js'), swContent, 'utf-8');
      }
    },
    {
      name: 'local-memory-db-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith('/api/git-')) {
            if (req.headers['x-domo-local-request'] !== 'true') {
              res.writeHead(403, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Forbidden: Missing X-Domo-Local-Request header' }));
              return;
            }
          }

          if (req.url === '/api/memory' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
              body += chunk;
              if (body.length > 500 * 1024 * 1024) {
                res.writeHead(413, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Payload Too Large' }));
                req.connection.destroy();
              }
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
              const localSha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
              let remoteSha = '';

              // Try fetching remote main SHA from GitHub API first
              try {
                const apiRes = await fetch('https://api.github.com/repos/darknecrocities/DomoDomo---All-in-one-Tool/commits/main', {
                  headers: { 'User-Agent': 'Mozilla/5.0' },
                  signal: (AbortSignal as any).timeout ? (AbortSignal as any).timeout(4000) : undefined
                });
                if (apiRes.ok) {
                  const data = (await apiRes.json()) as any;
                  remoteSha = data.sha;
                }
              } catch (e) {
                // ignore
              }

              // Fallback to git fetch if API check failed
              if (!remoteSha) {
                try {
                  execSync('git fetch origin main', { timeout: 5000, stdio: 'ignore' });
                  remoteSha = execSync('git rev-parse origin/main', { encoding: 'utf-8' }).trim();
                } catch (e) {
                  // ignore
                }
              }

              let updateAvailable = false;
              if (remoteSha && localSha !== remoteSha) {
                try {
                  // If remoteSha is already an ancestor of HEAD, local is ahead/updated (returns 0)
                  // If it's not, we are behind (returns non-zero error)
                  execSync(`git merge-base --is-ancestor ${remoteSha} HEAD`);
                  updateAvailable = false;
                } catch (e) {
                  updateAvailable = true;
                }
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                updateAvailable,
                localSha,
                remoteSha,
                commitsCount: updateAvailable ? 1 : 0,
                commits: updateAvailable ? ['Latest updates on main branch'] : []
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
