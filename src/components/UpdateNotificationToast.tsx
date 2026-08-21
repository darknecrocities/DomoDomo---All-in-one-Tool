import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';

export const UpdateNotificationToast: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [newVersion, setNewVersion] = useState<string | null>(null);

  useEffect(() => {
    // 1. Listen to Service Worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Automatically reload if controlled worker changes
        if (isUpdating) {
          window.location.reload();
        }
      });

      const checkForSwUpdate = async () => {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) {
            reg.update().catch(() => {});
            if (reg.waiting) {
              setUpdateAvailable(true);
            }
          }
        } catch (_) {}
      };

      // Check on load and focus
      checkForSwUpdate();
      window.addEventListener('focus', checkForSwUpdate);
    }

    // 2. Listen to custom update event from main.tsx
    const handleUpdateEvent = (e: any) => {
      setUpdateAvailable(true);
      if (e?.detail?.version) {
        setNewVersion(e.detail.version);
      }
    };
    window.addEventListener('domodomo:update-available', handleUpdateEvent);

    // 3. Periodic lightweight check against updates.json
    const checkUpdatesJson = async () => {
      try {
        const res = await fetch(`/updates.json?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const currentBuildTime = localStorage.getItem('domodomo_last_build_time');
          if (data.buildTime && currentBuildTime && data.buildTime !== currentBuildTime) {
            setUpdateAvailable(true);
            if (data.version) setNewVersion(data.version);
          } else if (data.buildTime && !currentBuildTime) {
            localStorage.setItem('domodomo_last_build_time', data.buildTime);
          }
        }
      } catch (_) {}
    };

    const interval = setInterval(checkUpdatesJson, 1000 * 60 * 5); // Check every 5 minutes

    return () => {
      window.removeEventListener('domodomo:update-available', handleUpdateEvent);
      clearInterval(interval);
    };
  }, [isUpdating]);

  const handleApplyUpdate = async () => {
    setIsUpdating(true);
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          await reg.update().catch(() => {});
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
    } catch (_) {}

    // Hard reload
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  if (!updateAvailable || dismissed) return null;

  return (
    <aside
      aria-label="Application Update Alert"
      className="fixed bottom-5 right-5 z-[9999] max-w-sm w-[calc(100vw-40px)] bg-[#18191B]/95 backdrop-blur-xl border border-[#3C6B4D]/60 shadow-2xl shadow-emerald-950/40 rounded-2xl p-4 text-[#ECEBE9] animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5 animate-pulse">
          <Sparkles size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#ECEBE9] flex items-center gap-1.5 font-heading">
              <span>New Update Ready</span>
              {newVersion && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono font-bold">
                  {newVersion}
                </span>
              )}
            </h2>
            <button
              onClick={() => setDismissed(true)}
              className="text-[#72706C] hover:text-[#ECEBE9] transition-colors p-1 rounded-lg hover:bg-[#2A2D30]"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
          <p className="text-xs text-[#A3A09B] mt-1 leading-relaxed">
            A new version of DomoDomo is available with fresh tools and performance boosts.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleApplyUpdate}
              disabled={isUpdating}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3C6B4D] hover:bg-[#2F543C] active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-emerald-950/50 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={isUpdating ? 'animate-spin' : ''} />
              <span>{isUpdating ? 'Updating...' : 'Update & Reload'}</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="px-3 py-2 rounded-xl bg-[#202225] hover:bg-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] text-xs font-medium transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default UpdateNotificationToast;
