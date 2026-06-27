import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { ShieldAlert, ServerCrash, Star, Menu, X, Zap, Download, Sun, Moon, MessageSquare, Coffee } from 'lucide-react';
import { Logo } from './Logo';


const GithubIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.15.6-.2 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const Shell = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleDomoNavigate = (e: any) => {
      if (e.detail && e.detail.path) {
        navigate(e.detail.path);
      }
    };
    window.addEventListener('domo-navigate' as any, handleDomoNavigate);
    return () => window.removeEventListener('domo-navigate' as any, handleDomoNavigate);
  }, [navigate]);

  const [stars, setStars] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('domo-theme');
    if (saved === 'light') return 'light';
    return 'dark'; // default to dark mode
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('domo-theme', theme);
  }, [theme]);

  // Repository Auto-Update System State
  const [repoStatus, setRepoStatus] = useState<'synced' | 'update_available' | 'updating'>('synced');
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [updaterLogs, setUpdaterLogs] = useState<string[]>([]);
  const [simulatedCommit, setSimulatedCommit] = useState({
    hash: 'a9d2f61',
    message: 'feat: add auto-update repo automation',
    author: 'darknecrocities',
    files: ['src/tools/ai/AIDomoAgentHub.tsx', 'src/utils/aiService.ts', 'src/components/Shell.tsx']
  });

  useEffect(() => {
    const checkForUpdates = async () => {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isLocalhost) {
        return;
      }

      try {
        const res = await fetch(`/api/git-check-updates?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.updateAvailable) {
            setSimulatedCommit({
              hash: 'origin/main',
              message: data.commits[0] || 'New updates available on main branch',
              author: 'darknecrocities',
              files: [`${data.commitsCount} new commits`]
            });
            setRepoStatus('update_available');
          } else {
            setRepoStatus('synced');
          }
        }
      } catch (err) {
        console.warn('Update check failed:', err);
      }
    };

    checkForUpdates();
    const interval = setInterval(checkForUpdates, 45000);
    return () => clearInterval(interval);
  }, [repoStatus]);

  const runAutoUpdater = async () => {
    setRepoStatus('updating');
    setShowUpdateModal(true);
    setUpdaterLogs([]);

    const log = (msg: string) => {
      setUpdaterLogs(prev => [...prev, msg]);
    };

    try {
      log('🔌 Connecting to local update service...');
      const res = await fetch('/api/git-update', { method: 'POST' });
      if (!res.ok) {
        throw new Error('Local update service returned an error.');
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error('Stream reading not supported');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            log(line);
          }
        }
      }

      // Handle any trailing data
      if (buffer.trim()) {
        log(buffer);
      }

      log('\n🔄 Finished processing! Reloading page in 2 seconds...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err: any) {
      log(`❌ Update failed: ${err.message}`);
    }
  };

  useEffect(() => {
    const CACHE_KEY = 'github_stars_cache';
    const CACHE_TTL = 3600000; // 1 hour

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { stars, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setStars(stars);
        }
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }

    fetch('https://api.github.com/repos/darknecrocities/DomoDomo---All-in-one-Tool')
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (typeof data.stargazers_count === 'number') {
          setStars(data.stargazers_count);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              stars: data.stargazers_count,
              timestamp: Date.now()
            }));
          } catch (e) {
            console.warn('Cache write error:', e);
          }
        }
      })
      .catch((err) => console.error('Failed to fetch github stars:', err));

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.warn('AdSense initial push:', e);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#111213]">
      {/* Top Navbar */}
      <header className="bg-[#18191B] border-b border-[#2A2D30] sticky top-0 z-50 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="hover:opacity-95 transition-opacity shrink-0">
            <Logo />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex flex-1 justify-center items-center gap-6 text-xs font-bold mx-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `tracking-wide transition-colors ${isActive ? 'text-[#3C6B4D]' : 'text-[#A3A09B] hover:text-[#ECEBE9]'
                }`
              }
            >
              Tools
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `tracking-wide transition-colors ${isActive ? 'text-[#3C6B4D]' : 'text-[#A3A09B] hover:text-[#ECEBE9]'
                }`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/library-api"
              className={({ isActive }) =>
                `tracking-wide transition-colors ${isActive ? 'text-[#3C6B4D]' : 'text-[#A3A09B] hover:text-[#ECEBE9]'
                }`
              }
            >
              API Library
            </NavLink>
            <NavLink
              to="/docs"
              className={({ isActive }) =>
                `tracking-wide transition-colors ${isActive ? 'text-[#3C6B4D]' : 'text-[#A3A09B] hover:text-[#ECEBE9]'
                }`
              }
            >
              Docs
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="https://forms.gle/ahQXtFoietABJZpg8"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 h-8 rounded-lg bg-[#E29E2D]/10 border border-[#E29E2D]/35 hover:border-[#E29E2D]/60 hover:bg-[#E29E2D]/25 text-[#E29E2D] hover:text-[#ECEBE9] transition-all text-[11px] font-bold"
              title="Submit Feedback or Report Issue"
            >
              <MessageSquare size={13} className="shrink-0" />
              <span>Feedback Report</span>
            </a>

            <div 
              className="hidden sm:flex items-center justify-center h-8 w-8 rounded-lg bg-[#3C6B4D]/10 border border-[#3C6B4D]/35 text-[#3C6B4D] cursor-help transition-colors"
              title="Sandbox Local Environment"
            >
              <ShieldAlert size={14} />
            </div>

            <a
              href="https://www.facebook.com/profile.php?id=61590872807465"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center justify-center h-8 w-8 rounded-lg bg-[#3C6B4D]/10 border border-[#3C6B4D]/35 hover:border-[#3C6B4D]/60 hover:bg-[#3C6B4D]/25 text-[#3C6B4D] hover:text-[#ECEBE9] transition-all"
              title="Follow Facebook Page"
            >
              <FacebookIcon size={14} />
            </a>

            <a
              href="https://ko-fi.com/domodomoo"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center justify-center h-8 w-8 rounded-lg bg-[#FF5E5B]/10 border border-[#FF5E5B]/35 hover:border-[#FF5E5B]/60 hover:bg-[#FF5E5B]/25 text-[#FF5E5B] hover:text-[#ECEBE9] transition-all"
              title="Buy me Ko-fi"
            >
              <Coffee size={14} />
            </a>

            <a
              href="https://github.com/darknecrocities/DomoDomo---All-in-one-Tool"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-2.5 h-8 rounded-lg bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D]/40 text-[#A3A09B] hover:text-[#ECEBE9] transition-all group"
              title="GitHub Repository"
            >
              <GithubIcon size={14} />
              <div className="h-3 w-[1px] bg-[#2A2D30] group-hover:bg-[#3C6B4D]/30" />
              <Star size={11} className="text-[#E29E2D] fill-[#E29E2D]" />
              <span className="text-[10px] font-mono leading-none">{stars !== null ? stars : '—'}</span>
            </a>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D]/40 text-[#A3A09B] hover:text-[#ECEBE9] transition-all"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>

            {/* Hamburger button - mobile only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#A3A09B] hover:text-[#ECEBE9] transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-[#2A2D30]">
            <nav className="flex flex-col gap-1 pb-3">
              <NavLink
                to="/"
                end
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-colors ${isActive ? 'text-[#3C6B4D] bg-[#3C6B4D]/10' : 'text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`
                }
              >
                Tools
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-colors ${isActive ? 'text-[#3C6B4D] bg-[#3C6B4D]/10' : 'text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`
                }
              >
                About
              </NavLink>
              <Link
                to="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-bold tracking-wide text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#1E2022] transition-colors"
              >
                Docs
              </Link>
              <a
                href="https://github.com/darknecrocities/DomoDomo---All-in-one-Tool"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-lg text-sm font-bold tracking-wide text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#1E2022] transition-colors flex items-center gap-2"
              >
                <GithubIcon size={16} />
                <span>GitHub</span>
                {stars !== null && (
                  <>
                    <Star size={12} className="text-[#E29E2D] fill-[#E29E2D]" />
                    <span className="text-[10px] font-mono">{stars}</span>
                  </>
                )}
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61590872807465"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-lg text-sm font-bold tracking-wide text-[#3C6B4D] hover:text-[#ECEBE9] hover:bg-[#3C6B4D]/10 transition-colors flex items-center gap-2"
              >
                <FacebookIcon size={16} />
                <span>Follow Facebook Page</span>
              </a>
              <a
                href="https://ko-fi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-lg text-sm font-bold tracking-wide text-[#FF5E5B] hover:text-[#ECEBE9] hover:bg-[#FF5E5B]/10 transition-colors flex items-center gap-2"
              >
                <Coffee size={16} />
                <span>Buy me Ko-fi</span>
              </a>
              <a
                href="https://forms.gle/ahQXtFoietABJZpg8"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-lg text-sm font-bold tracking-wide text-[#E29E2D] hover:text-[#ECEBE9] hover:bg-[#E29E2D]/10 transition-colors flex items-center gap-2"
              >
                <MessageSquare size={16} />
                <span>Feedback Report</span>
              </a>
              <button
                onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                className="px-3 py-2.5 rounded-lg text-sm font-bold tracking-wide text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#1E2022] transition-colors flex items-center gap-2 text-left w-full"
              >
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Auto-Update Repository Notification Banner */}
      {repoStatus === 'update_available' && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 mt-4">
          <div className="p-4 rounded-2xl bg-[#3C6B4D]/10 border border-[#3C6B4D]/35 text-[#ECEBE9] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md animate-fadeIn">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Zap size={14} className="animate-bounce" />
                <span>Auto-Push Detected on GitHub Remote!</span>
              </div>
              <p className="text-[11px] text-[#A3A09B]">
                New release commit <code className="bg-[#111213] px-1 py-0.5 rounded text-emerald-400 font-bold font-mono text-[10px]">{simulatedCommit.hash}</code> by <span className="font-bold text-[#ECEBE9]">{simulatedCommit.author}</span>: "{simulatedCommit.message}" (Updated files: {simulatedCommit.files.join(', ')}).
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRepoStatus('synced')}
                className="px-3 py-1.5 rounded-xl border border-[#2A2D30] hover:bg-[#1E2022] text-[#A3A09B] text-xs font-bold transition-all"
              >
                Skip
              </button>
              <button
                onClick={runAutoUpdater}
                className="px-4 py-1.5 bg-[#3C6B4D] hover:bg-[#2E533B] text-[#ECEBE9] text-xs font-black rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>Update App</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Execution Terminal Overlay */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-[#0A0B0C]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#18191B] border border-[#2A2D30] rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 pb-3 border-b border-[#2A2D30]">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div className="space-y-0.5 text-left">
                <h3 className="text-sm font-black text-[#ECEBE9]">Domo Repository Auto-Updater</h3>
                <p className="text-[10px] text-[#72706C]">Pulling latest code changes and building assets offline...</p>
              </div>
            </div>

            <div className="bg-[#0A0B0C] border border-[#2A2D30] rounded-2xl p-4 h-64 overflow-y-auto font-mono text-[11px] text-[#A3A09B] space-y-2 text-left">
              {updaterLogs.length === 0 ? (
                <span className="text-[#72706C] italic animate-pulse">Initializing Git Update automation...</span>
              ) : (
                updaterLogs.map((logLine, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {logLine}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] text-[#72706C]">
              <span>Step-by-step Git / Package deployment</span>
              <span className="animate-pulse text-emerald-400 font-bold">Deploying build...</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Google AdSense Unit */}
      <div className="max-w-7xl w-full mx-auto px-6 mb-4 flex justify-center">
        <div className="w-full max-w-[728px] overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
          <ins className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-7800058547773500"
            data-ad-slot="3689718163"
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="bg-[#111213] border-t border-[#2A2D30] px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex flex-col gap-1">
            <span className="text-[#ECEBE9] text-xs font-bold tracking-wide">DomoDomo: All-in-One Tool Hub</span>
            <span className="text-[#72706C] text-[11px]">
              All tools run fully inside your browser sandbox. No file chunks, keys, or uploads ever touch a server.
            </span>
            <span className="text-[#72706C] text-[10px] mt-0.5">
              Developed by Arron Kian Parejas, Ram Achilles Guinto and Rudy Miguel Calzita
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#72706C] font-semibold">
            <a
              href="https://forms.gle/ahQXtFoietABJZpg8"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A3A09B] hover:text-[#ECEBE9] transition-colors flex items-center gap-1"
            >
              <MessageSquare size={12} />
              <span>Feedback Report</span>
            </a>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ServerCrash size={12} />
              <span>Zero-Server Architecture</span>
            </span>
            <span>•</span>
            <span className="text-[#A3A09B]">v2.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
