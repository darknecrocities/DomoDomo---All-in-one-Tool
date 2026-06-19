import { Outlet } from 'react-router-dom';
import { ShieldAlert, Globe, ServerCrash } from 'lucide-react';
import { Logo } from './Logo';

export const Shell = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="bg-[#151C2C]/40 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-4">
            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/25 text-xs font-bold">
              <ShieldAlert size={14} className="shrink-0" />
              <span>Open Source / Local</span>
            </div>

            <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

            <a
              href="https://github.com/arronkianparejas"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
              title="GitHub Profile"
            >
              <Globe size={20} />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        <Outlet />
      </main>

      {/* Bottom Footer */}
      <footer className="bg-[#0B0F19] border-t border-slate-900 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex flex-col gap-1">
            <span className="text-slate-200 text-sm font-bold tracking-wide">DomoDomo Local Toolbox</span>
            <span className="text-slate-500 text-xs">
              All tools run fully inside your browser sandbox. No file chunks, keys, or uploads ever touch a server.
            </span>
            <span className="text-slate-500 text-xs mt-1">
              Developed by Arron Kian Parejas, Ram Achilles Guinto and Rudy Miguel Calzita
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1">
              <ServerCrash size={12} />
              <span>Zero-Server Tech</span>
            </span>
            <span>•</span>
            <span className="text-slate-400">v1.0.0 (Stable)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
