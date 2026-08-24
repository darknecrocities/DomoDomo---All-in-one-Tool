import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { APP_VERSION, BUILD_TIME, isNewerVersion } from '../utils/version';

export const UpdateNotificationToast: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [newVersion, setNewVersion] = useState<string | null>(null);
  const [targetBuildTime, setTargetBuildTime] = useState<string | null>(null);

  // Check if a specific version update has been dismissed recently
  const isVersionDismissed = useCallback((version: string | null): boolean => {
    if (!version) return false;
    const sessionDismissed = sessionStorage.getItem(`domodomo_dismissed_update_${version}`);
    if (sessionDismissed === 'true') return true;

    const localDismissedTime = localStorage.getItem(`domodomo_dismissed_update_${version}`);
    if (localDismissedTime) {
      const elapsed = Date.now() - parseInt(localDismissedTime, 10);
      // Suppress for 12 hours once dismissed
      if (elapsed < 1000 * 60 * 60 * 12) {
        return true;
      }
    }
    return false;
  }, []);

  const checkUpdatesJson = useCallback(async () => {
    try {
      const res = await fetch(`/updates.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;

      const data = await res.json();
      const remoteVersion: string | undefined = data.version;
      const remoteBuildTime: string | undefined = data.buildTime;

      // 1. If remote version is strictly newer (e.g. 2.5.1 > 2.5.0)
      if (remoteVersion && isNewerVersion(remoteVersion, APP_VERSION)) {
        if (!isVersionDismissed(remoteVersion)) {
          setNewVersion(remoteVersion);
          if (remoteBuildTime) setTargetBuildTime(remoteBuildTime);
          setUpdateAvailable(true);
        }
        return;
      }

      // 2. If version is identical or older (already on latest or matching release)
      // Sync local storage and prevent false positives
      if (remoteBuildTime) {
        localStorage.setItem('domodomo_last_build_time', remoteBuildTime);
      }
      localStorage.setItem('domodomo_app_version', APP_VERSION);
      setUpdateAvailable(false);
    } catch (_) {}
  }, [isVersionDismissed]);

  useEffect(() => {
    // Sync current running app metadata on load
    localStorage.setItem('domodomo_app_version', APP_VERSION);
    if (!localStorage.getItem('domodomo_last_build_time')) {
      localStorage.setItem('domodomo_last_build_time', BUILD_TIME);
    }

    // 1. Service Worker update check
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (isUpdating) {
          window.location.reload();
        }
      });

      const checkForSwUpdate = async () => {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg) {
            await reg.update().catch(() => {});
            // If a service worker is waiting, verify with updates.json first
            if (reg.waiting) {
              checkUpdatesJson();
            }
          }
        } catch (_) {}
      };

      // Check on initial load
      checkForSwUpdate();
      window.addEventListener('focus', checkForSwUpdate);
    }

    // 2. Listen to custom update event from main.tsx
    const handleUpdateEvent = (e: any) => {
      const ver = e?.detail?.version;
      if (ver && isNewerVersion(ver, APP_VERSION)) {
        if (!isVersionDismissed(ver)) {
          setNewVersion(ver);
          setUpdateAvailable(true);
        }
      } else {
        // Double check against updates.json
        checkUpdatesJson();
      }
    };
    window.addEventListener('domodomo:update-available', handleUpdateEvent);

    // 3. Initial and periodic check against updates.json (every 10 minutes)
    checkUpdatesJson();
    const interval = setInterval(checkUpdatesJson, 1000 * 60 * 10);

    return () => {
      window.removeEventListener('domodomo:update-available', handleUpdateEvent);
      clearInterval(interval);
    };
  }, [isUpdating, checkUpdatesJson, isVersionDismissed]);

  const handleDismiss = () => {
    const versionKey = newVersion || APP_VERSION;
    sessionStorage.setItem(`domodomo_dismissed_update_${versionKey}`, 'true');
    localStorage.setItem(`domodomo_dismissed_update_${versionKey}`, Date.now().toString());
    setDismissed(true);
  };

  const handleApplyUpdate = async () => {
    setIsUpdating(true);
    try {
      // 1. Sync localStorage so reload doesn't trigger old comparison
      if (targetBuildTime) {
        localStorage.setItem('domodomo_last_build_time', targetBuildTime);
      }
      if (newVersion) {
        localStorage.setItem('domodomo_app_version', newVersion);
      }

      // 2. Message all service workers to activate immediately
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          await reg.update().catch(() => {});
        }
      }

      // 3. Purge CacheStorage caches
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
    } catch (_) {}

    // 4. Force hard reload with timestamp bypass
    setTimeout(() => {
      window.location.reload();
    }, 300);
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
              onClick={handleDismiss}
              className="text-[#72706C] hover:text-[#ECEBE9] transition-colors p-1 rounded-lg hover:bg-[#2A2D30] cursor-pointer"
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
              onClick={handleDismiss}
              className="px-3 py-2 rounded-xl bg-[#202225] hover:bg-[#2A2D30] text-[#A3A09B] hover:text-[#ECEBE9] text-xs font-medium transition-colors cursor-pointer"
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
