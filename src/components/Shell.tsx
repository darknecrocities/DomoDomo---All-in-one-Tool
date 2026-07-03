import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { Star, Menu, X, Zap, Download, Sun, Moon, MessageSquare, Coffee, Trash2 } from 'lucide-react';
import { AdSenseUnit } from './AdSenseUnit';
import { Logo } from './Logo';
import { unifiedMemory } from '../utils/unifiedMemory';


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
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';

  const handleClearAIData = async () => {
    if (window.confirm("Are you sure you want to completely purge all local AI data (RAG documents, user habits, and identity preferences) from this device? This cannot be undone.")) {
      await unifiedMemory.clearHabits();
      await unifiedMemory.clearIdentity();
      localStorage.removeItem('domodomo_onboarding_completed');
      alert("All local AI data has been purged successfully!");
      window.location.reload();
    }
  };

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
            <NavLink
              to="/blog"
              className={({ isActive }) =>
                `tracking-wide transition-colors ${isActive ? 'text-[#3C6B4D]' : 'text-[#A3A09B] hover:text-[#ECEBE9]'
                }`
              }
            >
              Blog
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

            {/* Clear AI Data Button (Offline Only) */}
            {isLocalhost && (
              <button
                onClick={handleClearAIData}
                className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#111213] border border-red-950/40 hover:border-red-500/40 text-red-400 hover:text-red-300 transition-all"
                title="Purge Local AI Data"
              >
                <Trash2 size={14} />
              </button>
            )}

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
              <Link
                to="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-bold tracking-wide text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#1E2022] transition-colors"
              >
                Blog
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

              {isLocalhost && (
                <button
                  onClick={handleClearAIData}
                  className="px-3 py-2.5 rounded-lg text-sm font-bold tracking-wide text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors flex items-center gap-2 text-left w-full"
                >
                  <Trash2 size={16} />
                  <span>Purge Local AI Data</span>
                </button>
              )}
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
      <AdSenseUnit />

      {/* Bottom Footer */}
      <footer className="bg-[#111213] border-t border-[#2A2D30] pt-16 pb-8 px-6 sm:px-12 mt-12 w-full">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            {/* Left Tagline */}
            <div className="lg:col-span-5 flex flex-col justify-between text-left gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Logo size={36} showText={false} />
                  <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-[#ECEBE9] font-heading">
                    DomoDomo
                  </h2>
                </div>
                <div className="flex flex-col gap-1.5 text-xs text-[#A3A09B] font-semibold">
                  <span className="text-[#72706C] text-[10px] uppercase tracking-wider font-bold">Developed By</span>
                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-[#ECEBE9] text-[11px]">
                    <a href="https://github.com/darknecrocities" target="_blank" rel="noopener noreferrer" className="hover:text-[#3C6B4D] transition-colors font-bold">Ram Achilles Guinto</a>
                    <span className="text-[#72706C] font-normal">•</span>
                    <span className="text-[#ECEBE9] font-bold">Arron Kian Parejas</span>
                    <span className="text-[#72706C] font-normal">•</span>
                    <span className="text-[#ECEBE9] font-bold">Rudy Miguel Calzita</span>
                  </div>
                </div>
                {/* Social Options */}
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href="https://github.com/darknecrocities/DomoDomo---All-in-one-Tool"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#111213] border border-[#2A2D30] text-[#72706C] hover:text-[#ECEBE9] hover:border-[#3C6B4D]/40 transition-all shadow-sm"
                    title="GitHub Repository"
                  >
                    <GithubIcon size={16} />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#111213] border border-[#2A2D30] text-[#72706C] hover:text-[#ECEBE9] hover:border-[#3C6B4D]/40 transition-all shadow-sm"
                    title="Facebook"
                  >
                    <FacebookIcon size={16} />
                  </a>
                  <a
                    href="https://ko-fi.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#111213] border border-[#2A2D30] text-[#72706C] hover:text-[#ECEBE9] hover:border-[#3C6B4D]/40 transition-all shadow-sm flex items-center justify-center"
                    title="Support us on Ko-Fi"
                  >
                    <Coffee size={16} />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Link Columns */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 text-left">
              {/* Column 1 */}
              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#72706C]">Quicklinks</span>
                <ul className="flex flex-col gap-2.5 text-xs text-[#A3A09B] font-semibold">
                  <li><Link to="/" className="hover:text-[#ECEBE9] transition-colors">Tools</Link></li>
                  <li><Link to="/about" className="hover:text-[#ECEBE9] transition-colors">About</Link></li>
                  <li><Link to="/library-api" className="hover:text-[#ECEBE9] transition-colors">API Library</Link></li>
                  <li><Link to="/docs" className="hover:text-[#ECEBE9] transition-colors">Docs</Link></li>
                  <li><Link to="/blog" className="hover:text-[#ECEBE9] transition-colors">Blog</Link></li>
                </ul>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#72706C]">Resources</span>
                <ul className="flex flex-col gap-2.5 text-xs text-[#A3A09B] font-semibold">
                  <li><Link to="/docs" className="hover:text-[#ECEBE9] transition-colors">Terms of Use</Link></li>
                  <li><Link to="/docs" className="hover:text-[#ECEBE9] transition-colors">Privacy Policy</Link></li>
                  <li>
                    <a
                      href="https://github.com/darknecrocities/DomoDomo---All-in-one-Tool"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#ECEBE9] transition-colors"
                    >
                      Contribute on GitHub
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 3 */}
              <div className="flex flex-col gap-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#72706C]">DomoDomo</span>
                <ul className="flex flex-col gap-2.5 text-xs text-[#A3A09B] font-semibold">
                  <li><Link to="/about" className="hover:text-[#ECEBE9] transition-colors">About</Link></li>
                  <li><Link to="/about?tab=updates" className="hover:text-[#ECEBE9] transition-colors">Updates &amp; Patches</Link></li>
                  <li><Link to="/about?tab=docs" className="hover:text-[#ECEBE9] transition-colors">Local Docs</Link></li>
                  <li>
                    <a
                      href="https://github.com/darknecrocities/DomoDomo---All-in-one-Tool/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#ECEBE9] transition-colors"
                    >
                      Contacts
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sub-footer / Copyright bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-[#2A2D30]/30 text-[10px] text-[#72706C] font-semibold">
            <div className="flex gap-4">
              <Link to="/docs" className="hover:text-[#ECEBE9] transition-colors">Terms of Use</Link>
              <Link to="/docs" className="hover:text-[#ECEBE9] transition-colors">Privacy Policy</Link>
              <button
                onClick={handleClearAIData}
                className="hover:text-rose-450 transition-colors flex items-center gap-1"
                title="Purge all offline client-side storage"
              >
                <Trash2 size={10} />
                <span>Purge AI Memory</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3.5">
              <span>Copyright © {new Date().getFullYear()} DomoDomo. All rights reserved.</span>
              <span className="text-[#2A2D30] hidden md:inline">•</span>
              <span>Zero-Server Architecture</span>
              <span className="text-[#2A2D30]">•</span>
              <span className="font-mono">v2.0.0</span>
              <span className="text-[#2A2D30]">•</span>
              <a
                href="https://forms.gle/ahQXtFoietABJZpg8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#A3A09B] hover:text-[#ECEBE9] transition-colors flex items-center gap-1"
              >
                <MessageSquare size={10} />
                <span>Feedback Report</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
