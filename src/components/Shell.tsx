import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Star, Menu, X, Zap, Download, Sun, Moon, MessageSquare, Coffee, Trash2, Bot, Settings, Cpu, Trophy, Award } from 'lucide-react';
import { AdSenseUnit } from './AdSenseUnit';
import { Logo } from './Logo';
import { unifiedMemory } from '../utils/unifiedMemory';
import betterGovLogo from '../assets/bettergovph.jpg';
import upamateLogo from '../assets/upamate.png';
import stageByAntLogo from '../assets/stagebyant.png';
import { AppBuildersWidget } from './AppBuildersWidget';



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

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

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

  const location = useLocation();
  const isAIHub = location.pathname === '/ai-hub';
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
        const res = await fetch(`/api/git-check-updates?t=${Date.now()}`, {
          headers: { 'X-Domo-Local-Request': 'true' }
        });
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
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
      const res = await fetch('/api/git-update', { 
        method: 'POST',
        headers: { 'X-Domo-Local-Request': 'true' }
      });
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
      <header className="bg-[#18191B] border-b border-[#2A2D30] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="hover:opacity-90 transition-opacity shrink-0">
            <Logo />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-0.5 text-[13px] font-semibold">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg tracking-wide transition-all ${
                  isActive
                    ? 'text-[#ECEBE9] bg-[#2A2D30]'
                    : 'text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                }`
              }
            >
              Tools
            </NavLink>

            {/* AI Hub — always-on green pill */}
            <NavLink
              to="/ai-hub"
              className={({ isActive }) =>
                `mx-1 px-3 py-1.5 rounded-lg tracking-wide transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#3C6B4D] bg-[#3C6B4D]/20 ring-1 ring-[#3C6B4D]/40'
                    : 'text-[#3C6B4D] bg-[#3C6B4D]/10 hover:bg-[#3C6B4D]/20 ring-1 ring-[#3C6B4D]/25 hover:ring-[#3C6B4D]/40'
                }`
              }
            >
              <Bot size={13} />
              <span>AI Hub</span>
              <span className="text-[9px] font-mono font-black bg-[#3C6B4D] text-white px-1.5 py-0.5 rounded-full leading-none">
                NEW
              </span>
            </NavLink>

            {[
              { to: '/about', label: 'About' },
              { to: '/library-api', label: 'API Library' },
              { to: '/docs', label: 'Docs' },
              { to: '/blog', label: 'Blog' },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg tracking-wide transition-all ${
                    isActive
                      ? 'text-[#ECEBE9] bg-[#2A2D30]'
                      : 'text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right-side actions */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Feedback — desktop only */}
            <a
              href="https://forms.gle/ahQXtFoietABJZpg8"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center justify-center h-8 w-8 rounded-lg border border-[#2A2D30] hover:border-[#E29E2D]/50 text-[#A3A09B] hover:text-[#E29E2D] transition-all hover:bg-[#E29E2D]/10"
              title="Submit Feedback"
            >
              <MessageSquare size={15} />
            </a>

            {/* Facebook — desktop only */}
            <a
              href="https://www.facebook.com/profile.php?id=61590872807465"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center justify-center h-8 w-8 rounded-lg border border-[#2A2D30] hover:border-[#3C6B4D]/50 text-[#A3A09B] hover:text-[#3C6B4D] transition-all hover:bg-[#3C6B4D]/10"
              title="Follow on Facebook"
            >
              <FacebookIcon size={14} />
            </a>

            {/* Ko-fi — desktop only */}
            <a
              href="https://ko-fi.com/domodomoo"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center justify-center h-8 w-8 rounded-lg border border-[#2A2D30] hover:border-[#FF5E5B]/50 text-[#A3A09B] hover:text-[#FF5E5B] transition-all hover:bg-[#FF5E5B]/10"
              title="Support on Ko-fi"
            >
              <Coffee size={14} />
            </a>

            {/* Divider */}
            <div className="hidden xl:block h-5 w-px bg-[#2A2D30] mx-0.5" />

            {/* GitHub stars */}
            <a
              href="https://github.com/darknecrocities/DomoDomo---All-in-one-Tool"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-2.5 h-8 rounded-lg border border-[#2A2D30] hover:border-[#3C6B4D]/50 text-[#A3A09B] hover:text-[#ECEBE9] transition-all hover:bg-[#1E2022] group"
              title="Star on GitHub"
            >
              <GithubIcon size={14} />
              <div className="h-3 w-px bg-[#2A2D30] group-hover:bg-[#3C6B4D]/40" />
              <Star size={11} className="text-[#E29E2D] fill-[#E29E2D]" />
              <span className="font-mono text-[11px]">{stars !== null ? stars : '—'}</span>
            </a>

            {/* Install PWA — only when available */}
            {isInstallable && (
              <button
                onClick={handleInstallClick}
                className="hidden sm:flex items-center gap-1.5 px-3 h-8 rounded-lg bg-[#3C6B4D]/15 border border-[#3C6B4D]/40 hover:bg-[#3C6B4D]/25 hover:border-[#3C6B4D]/60 text-[#3C6B4D] transition-all text-[12px] font-semibold"
                title="Install as desktop app"
              >
                <Download size={13} />
                <span>Install</span>
              </button>
            )}

            {/* Divider */}
            <div className="hidden md:block h-5 w-px bg-[#2A2D30] mx-0.5" />

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="flex items-center justify-center h-8 w-8 rounded-lg border border-[#2A2D30] hover:border-[#3C6B4D]/50 text-[#A3A09B] hover:text-[#ECEBE9] transition-transform duration-160 ease-[var(--ease-out)] active:scale-[0.92] hover:bg-[#1E2022]"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>

            {/* Settings shortcut */}
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `hidden md:flex items-center justify-center h-8 w-8 rounded-lg border transition-all ${
                  isActive
                    ? 'border-[#3C6B4D]/50 text-[#3C6B4D] bg-[#3C6B4D]/10'
                    : 'border-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] hover:border-[#3C6B4D]/50 hover:bg-[#1E2022]'
                }`
              }
              title="Settings"
            >
              <Settings size={15} />
            </NavLink>

            {/* Hamburger — mobile / tablet only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg border border-[#2A2D30] hover:border-[#3C6B4D]/50 text-[#A3A09B] hover:text-[#ECEBE9] transition-transform duration-160 ease-[var(--ease-out)] active:scale-[0.92] hover:bg-[#1E2022]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>


        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#2A2D30] bg-[#18191B] px-4 pb-4 emil-modal-container">
            {/* Quick links */}
            <nav className="flex flex-col gap-0.5 py-3">
              <NavLink
                to="/"
                end
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all flex items-center justify-between ${
                    isActive
                      ? 'text-[#ECEBE9] bg-[#2A2D30]'
                      : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`
                }
              >
                <span>Tools</span>
                <span className="text-[10px] font-mono text-[#3C6B4D]">229 tools</span>
              </NavLink>

              <NavLink
                to="/ai-hub"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all flex items-center gap-2 ${
                    isActive
                      ? 'text-[#3C6B4D] bg-[#3C6B4D]/15'
                      : 'text-[#3C6B4D] bg-[#3C6B4D]/8 hover:bg-[#3C6B4D]/15'
                  }`
                }
              >
                <Bot size={15} />
                <span>AI Hub Studio</span>
                <span className="ml-auto text-[9px] font-mono font-black bg-[#3C6B4D] text-white px-2 py-0.5 rounded-full">NEW</span>
              </NavLink>

              {[
                { to: '/about', label: 'About' },
                { to: '/download', label: 'Download' },
                { to: '/library-api', label: 'API Library' },
                { to: '/docs', label: 'Documentation' },
                { to: '/blog', label: 'Blog & News' },
                { to: '/settings', label: 'Settings' },
              ].map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'text-[#ECEBE9] bg-[#2A2D30]'
                        : 'text-[#72706C] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#2A2D30]">
              <a
                href="https://forms.gle/ahQXtFoietABJZpg8"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#E29E2D]/10 border border-[#E29E2D]/30 text-[#E29E2D] text-[12px] font-semibold hover:bg-[#E29E2D]/20 transition-all"
              >
                <MessageSquare size={14} />
                <span>Feedback</span>
              </a>

              <a
                href="https://ko-fi.com/domodomoo"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#FF5E5B]/10 border border-[#FF5E5B]/30 text-[#FF5E5B] text-[12px] font-semibold hover:bg-[#FF5E5B]/20 transition-all"
              >
                <Coffee size={14} />
                <span>Ko-fi</span>
              </a>

              <a
                href="https://github.com/darknecrocities/DomoDomo---All-in-one-Tool"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#111213] border border-[#2A2D30] text-[#ECEBE9] text-[12px] font-semibold hover:border-[#3C6B4D]/40 transition-all"
              >
                <GithubIcon size={14} />
                <span>GitHub</span>
                <span className="flex items-center gap-0.5 text-[#E29E2D] font-mono text-[11px]">
                  <Star size={10} className="fill-[#E29E2D]" />
                  {stars || 79}
                </span>
              </a>

              {isInstallable && (
                <button
                  onClick={() => { handleInstallClick(); setMobileMenuOpen(false); }}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#3C6B4D]/15 border border-[#3C6B4D]/40 text-[#3C6B4D] text-[12px] font-semibold hover:bg-[#3C6B4D]/25 transition-all"
                >
                  <Download size={14} />
                  <span>Install App</span>
                </button>
              )}

              {isLocalhost && (
                <button
                  onClick={() => { handleClearAIData(); setMobileMenuOpen(false); }}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-950/20 border border-red-900/40 text-red-400 text-[12px] font-semibold col-span-2"
                >
                  <Trash2 size={14} />
                  <span>Purge Local AI Data</span>
                </button>
              )}
            </div>
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
      <main className={isAIHub ? 'flex-1 w-full p-0 max-w-none' : 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8'}>
        <Outlet />
      </main>

      {/* Google AdSense Unit */}
      {!isAIHub && <AdSenseUnit />}

      {/* Bottom Footer (Hidden on /ai-hub full-bleed layout) */}
      {!isAIHub && (
        <footer className="bg-[#111213] border-t border-[#2A2D30] pt-16 pb-8 px-6 sm:px-12 mt-12 w-full">
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            {/* Main Footer Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
              {/* Left Tagline */}
              <div className="lg:col-span-6 flex flex-col justify-between text-left gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Logo size={36} showText={false} />
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-[#ECEBE9] font-heading">
                      DomoDomo
                    </h2>
                  </div>

                  {/* Awards & Featured Badges */}
                  <div className="flex flex-wrap gap-2.5 items-center pt-1 pb-2">
                    {/* Live AppBuilders PH Vote Widget */}
                    <AppBuildersWidget />

                    {/* AppBuilders PH Badge */}
                    <a
                      href="https://www.appbuildersph.com/apps/domodomo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gold-shining-border inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl transition-all shadow-md group/badge w-fit bg-[#18191B]"
                      title="#1 All Time Overall on App Builders PH"
                    >
                      <div className="relative flex items-center justify-center shrink-0 w-7 h-7">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 32 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="drop-shadow"
                        >
                          <path d="M10 18L6 28L12 26L15 20" fill="#d4af37" />
                          <path d="M22 18L26 28L20 26L17 20" fill="#aa7c11" />
                          <circle
                            cx="16"
                            cy="14"
                            r="10"
                            fill="url(#goldGradientFooter)"
                            stroke="#d4af37"
                            strokeWidth="0.5"
                          />
                          <circle
                            cx="16"
                            cy="14"
                            r="7.5"
                            fill="url(#goldInnerGradientFooter)"
                          />
                          <text
                            x="16"
                            y="17.5"
                            fontFamily="system-ui, -apple-system, sans-serif"
                            fontSize="10.5"
                            fontWeight="800"
                            fill="#ffffff"
                            textAnchor="middle"
                          >
                            1
                          </text>
                          <defs>
                            <linearGradient
                              id="goldGradientFooter"
                              x1="6"
                              y1="4"
                              x2="26"
                              y2="24"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop offset="0%" stopColor="#ffe066" />
                              <stop offset="50%" stopColor="#d4af37" />
                              <stop offset="100%" stopColor="#aa7c11" />
                            </linearGradient>
                            <linearGradient
                              id="goldInnerGradientFooter"
                              x1="9"
                              y1="7"
                              x2="23"
                              y2="21"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop offset="0%" stopColor="#fff2a3" />
                              <stop offset="100%" stopColor="#b8860b" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="flex flex-col text-left leading-tight">
                        <span className="text-[9px] tracking-wider text-[#d4af37]/80 font-bold uppercase">
                          AppBuilders PH
                        </span>
                        <span className="text-xs font-extrabold text-[#d4af37] group-hover/badge:text-[#ECEBE9] transition-colors">
                          #1 All Time Overall
                        </span>
                      </div>
                    </a>

                    {/* #1 in AI Category Badge */}
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-[#3C6B4D]/40 bg-[#3C6B4D]/10 text-[#4E8E5E] shadow-md font-extrabold text-xs transition-all hover:border-[#3C6B4D]/70"
                      title="#1 Product in AI & Local LLM Category"
                    >
                      <Cpu size={14} className="text-[#3C6B4D]" />
                      <span>#1 in AI Category</span>
                    </div>

                    {/* #1 in Productivity Badge */}
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-[#3C6B4D]/40 bg-[#3C6B4D]/10 text-[#4E8E5E] shadow-md font-extrabold text-xs transition-all hover:border-[#3C6B4D]/70"
                      title="#1 Product in Productivity Category"
                    >
                      <Trophy size={14} className="text-[#3C6B4D]" />
                      <span>#1 in Productivity</span>
                    </div>

                    {/* #1 in Developer Tools Badge */}
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-[#3C6B4D]/40 bg-[#3C6B4D]/10 text-[#4E8E5E] shadow-md font-extrabold text-xs transition-all hover:border-[#3C6B4D]/70"
                      title="#1 Product in Developer Tools Category"
                    >
                      <Award size={14} className="text-[#3C6B4D]" />
                      <span>#1 in Developer Tools</span>
                    </div>

                    {/* BetterGov PH */}
                    <a
                      href="https://bettergov.ph"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl transition-all shadow-md group/bettergov w-fit border border-[#2A2D30] bg-[#18191B] hover:border-[#3C6B4D]/50"
                      title="Featured on BetterGov PH"
                    >
                      <div className="relative flex items-center justify-center shrink-0 w-7 h-7">
                        <img
                          src={betterGovLogo}
                          alt="BetterGov PH Logo"
                          className="w-7 h-7 object-contain rounded-md"
                        />
                      </div>
                      <div className="flex flex-col text-left leading-tight">
                        <span className="text-[9px] tracking-wider text-[#A3A09B] font-bold uppercase">
                          As Featured on
                        </span>
                        <span className="text-xs font-extrabold text-[#ECEBE9] group-hover/bettergov:text-[#4E8E5E] transition-colors">
                          BetterGov.ph
                        </span>
                      </div>
                    </a>

                    {/* Upamate Featured Badge */}
                    <a
                      href="https://www.facebook.com/share/p/1G5PGJFuYE/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl transition-all shadow-md group/upamate w-fit border border-[#2A2D30] bg-[#18191B] hover:border-[#3C6B4D]/50"
                      title="As Featured on Upamate"
                    >
                      <div className="relative flex items-center justify-center shrink-0 w-7 h-7">
                        <img
                          src={upamateLogo}
                          alt="Upamate Logo"
                          className="w-7 h-7 object-contain rounded-md"
                        />
                      </div>
                      <div className="flex flex-col text-left leading-tight">
                        <span className="text-[9px] tracking-wider text-[#A3A09B] font-bold uppercase">
                          As Featured on
                        </span>
                        <span className="text-xs font-extrabold text-[#ECEBE9] group-hover/upamate:text-[#4E8E5E] transition-colors">
                          Upamate
                        </span>
                      </div>
                    </a>

                    {/* Stage by Ant Featured Badge */}
                    <a
                      href="https://stage.byant.dev/p/domodomo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl transition-all shadow-md group/stagebyant w-fit border border-[#2A2D30] bg-[#18191B] hover:border-[#3C6B4D]/50"
                      title="Featured Pick on Stage by Ant"
                    >
                      <div className="relative flex items-center justify-center shrink-0 w-7 h-7">
                        <img
                          src={stageByAntLogo}
                          alt="Stage by Ant Logo"
                          className="w-7 h-7 object-contain rounded-md"
                        />
                      </div>
                      <div className="flex flex-col text-left leading-tight">
                        <span className="text-[9px] tracking-wider text-[#A3A09B] font-bold uppercase">
                          Featured Pick on
                        </span>
                        <span className="text-xs font-extrabold text-[#ECEBE9] group-hover/stagebyant:text-[#4E8E5E] transition-colors">
                          Stage by Ant
                        </span>
                      </div>
                    </a>
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
                </div>
              </div>

              {/* Right Link Columns */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 text-left">
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
      )}
    </div>
  );
};
