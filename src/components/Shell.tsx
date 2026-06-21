import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { ShieldAlert, ServerCrash, Star, Menu, X } from 'lucide-react';
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

export const Shell = () => {
  const [stars, setStars] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('https://api.github.com/repos/darknecrocities/DomoDomo---All-in-one-Tool')
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.stargazers_count === 'number') {
          setStars(data.stargazers_count);
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
          <Link to="/" className="hover:opacity-95 transition-opacity">
            <Logo />
          </Link>

          <div className="flex items-center gap-4">
            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-4 text-xs font-bold">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `tracking-wide transition-colors ${
                    isActive ? 'text-[#3C6B4D]' : 'text-[#A3A09B] hover:text-[#ECEBE9]'
                  }`
                }
              >
                Tools
              </NavLink>
              <span className="text-[#2A2D30] text-[10px] select-none">|</span>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `tracking-wide transition-colors ${
                    isActive ? 'text-[#3C6B4D]' : 'text-[#A3A09B] hover:text-[#ECEBE9]'
                  }`
                }
              >
                About DomoDomo
              </NavLink>
              <span className="text-[#2A2D30] text-[10px] select-none">|</span>
              <NavLink
                to="/library-api"
                className={({ isActive }) =>
                  `tracking-wide transition-colors ${
                    isActive ? 'text-[#3C6B4D]' : 'text-[#A3A09B] hover:text-[#ECEBE9]'
                  }`
                }
              >
                Library API
              </NavLink>
              <span className="text-[#2A2D30] text-[10px] select-none">|</span>
              <NavLink
                to="/docs"
                className={({ isActive }) =>
                  `tracking-wide transition-colors ${
                    isActive ? 'text-[#3C6B4D]' : 'text-[#A3A09B] hover:text-[#ECEBE9]'
                  }`
                }
              >
                Documentation
              </NavLink>
            </nav>

            <div className="hidden md:block h-4 w-[1px] bg-[#2A2D30]" />

            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/25 text-[11px] font-bold uppercase tracking-wider">
              <ShieldAlert size={13} className="shrink-0" />
              <span>Sandbox Local</span>
            </div>

            <div className="hidden md:block h-4 w-[1px] bg-[#2A2D30]" />

            <a
              href="https://github.com/darknecrocities/DomoDomo---All-in-one-Tool"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111213] border border-[#2A2D30] hover:border-[#3C6B4D]/40 text-[#A3A09B] hover:text-[#ECEBE9] transition-all group"
              title="GitHub Repository"
            >
              <GithubIcon size={14} />
              <div className="h-3 w-[1px] bg-[#2A2D30] group-hover:bg-[#3C6B4D]/30" />
              <Star size={11} className="text-[#E29E2D] fill-[#E29E2D]" />
              <span className="text-[10px] font-mono leading-none">{stars !== null ? stars : '—'}</span>
            </a>

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
                  `px-3 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-colors ${
                    isActive ? 'text-[#3C6B4D] bg-[#3C6B4D]/10' : 'text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`
                }
              >
                Tools
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-colors ${
                    isActive ? 'text-[#3C6B4D] bg-[#3C6B4D]/10' : 'text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#1E2022]'
                  }`
                }
              >
                About DomoDomo
              </NavLink>
              <Link
                to="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-bold tracking-wide text-[#A3A09B] hover:text-[#ECEBE9] hover:bg-[#1E2022] transition-colors"
              >
                Documentation
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
            </nav>
          </div>
        )}
      </header>

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
