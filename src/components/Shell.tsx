import { Outlet } from 'react-router-dom';
import { ShieldAlert, Globe, ServerCrash } from 'lucide-react';
import { Logo } from './Logo';

export const Shell = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#111213]">
      {/* Top Navbar */}
      <header className="bg-[#18191B] border-b border-[#2A2D30] sticky top-0 z-50 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-4">
            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#3C6B4D]/10 text-[#3C6B4D] border border-[#3C6B4D]/25 text-[11px] font-bold uppercase tracking-wider">
              <ShieldAlert size={13} className="shrink-0" />
              <span>Sandbox Local</span>
            </div>

            <div className="h-4 w-[1px] bg-[#2A2D30] hidden sm:block" />

            <a
              href="https://github.com/arronkianparejas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A3A09B] hover:text-[#ECEBE9] transition-colors"
              title="GitHub Profile"
            >
              <Globe size={18} />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <Outlet />
      </main>

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
            <span className="text-[#A3A09B]">v1.0.0 (Stable)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
