import { useState, useEffect, useCallback } from 'react';

const INITIAL_BASE_COUNT = 8172;
const STORAGE_KEY = 'domodomo_active_users_count';
const SESSION_KEY = 'domodomo_session_tracked';
const TIMESTAMP_KEY = 'domodomo_counter_last_fetch_timestamp';
const EVENT_NAME = 'domodomo_count_updated';
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour caching window

const COUNTER_API_UP = 'https://api.counterapi.dev/v1/domodomo_site_visitors/visits/up';
const COUNTER_API_READ = 'https://api.counterapi.dev/v1/domodomo_site_visitors/visits';

/**
 * Gets the current raw visit / active user count from localStorage or returns initial base count (8,172).
 */
export function getStoredVisitCount(): number {
  if (typeof window === 'undefined') return INITIAL_BASE_COUNT;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= INITIAL_BASE_COUNT) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Unable to access localStorage for visit counter:', e);
  }
  return INITIAL_BASE_COUNT;
}

/**
 * Persists and broadcasts updated count across tabs and components.
 */
export function setStoredVisitCount(count: number): number {
  const nextCount = Math.max(INITIAL_BASE_COUNT, count);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, nextCount.toString());
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: nextCount }));
    } catch (e) {
      console.warn('Unable to save visit count to localStorage:', e);
    }
  }
  return nextCount;
}

/**
 * Increments the visit count by a given step (default 1) and notifies listeners.
 */
export function incrementVisitCount(step: number = 1): number {
  const current = getStoredVisitCount();
  return setStoredVisitCount(current + step);
}

/**
 * Formats a count number with comma separators (e.g. 8172 -> "8,172")
 */
export function formatCount(count: number): string {
  return count.toLocaleString('en-US');
}

/**
 * React hook to manage real-time visit count dynamically with a 1-hour cache mechanism
 * to prevent rate limit hits and avoid CORS browser errors.
 */
export function useVisitCounter(trackClicks: boolean = true) {
  const [count, setCount] = useState<number>(() => {
    return getStoredVisitCount();
  });

  // Dynamic API sync with 1-hour caching window
  const syncGlobalCounter = useCallback(async (isNewSession: boolean) => {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    const lastFetchStr = localStorage.getItem(TIMESTAMP_KEY);
    const lastFetch = lastFetchStr ? parseInt(lastFetchStr, 10) : 0;
    const isCacheExpired = isNaN(lastFetch) || now - lastFetch > CACHE_DURATION_MS;

    // Increment local session count if this is a new session
    if (isNewSession) {
      const updated = incrementVisitCount(1);
      setCount(updated);
    }

    // Only query remote CounterAPI if 1 hour has elapsed since last API fetch
    if (!isCacheExpired && lastFetch > 0) {
      return; // Use 1-hour cached count
    }

    try {
      const token = import.meta.env.VITE_COUNTER_API_KEY;
      const baseUrl = isNewSession ? COUNTER_API_UP : COUNTER_API_READ;
      const url = token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl;

      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.count === 'number') {
          const baseOffset = INITIAL_BASE_COUNT - 1;
          const liveTotal = baseOffset + data.count;
          const updated = setStoredVisitCount(liveTotal);
          setCount(updated);
          localStorage.setItem(TIMESTAMP_KEY, now.toString());
        }
      }
    } catch {
      // Quietly ignore CORS/network restrictions and update timestamp for local cache stability
      localStorage.setItem(TIMESTAMP_KEY, now.toString());
    }
  }, []);

  // Initialize session & sync on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const sessionTracked = sessionStorage.getItem(SESSION_KEY);
      if (!sessionTracked) {
        sessionStorage.setItem(SESSION_KEY, 'true');
        syncGlobalCounter(true);
      } else {
        syncGlobalCounter(false);
      }
    } catch (e) {
      const updated = incrementVisitCount(1);
      setCount(updated);
    }
  }, [syncGlobalCounter]);

  // Sync state across browser tabs & components
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleCustomEvent = (e: Event) => {
      const customEvt = e as CustomEvent<number>;
      if (typeof customEvt.detail === 'number') {
        setCount(customEvt.detail);
      } else {
        setCount(getStoredVisitCount());
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const parsed = parseInt(e.newValue, 10);
        if (!isNaN(parsed)) {
          setCount(parsed);
        }
      }
    };

    window.addEventListener(EVENT_NAME, handleCustomEvent);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(EVENT_NAME, handleCustomEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Global click listener to increment counter on user interactions/clicks if enabled
  useEffect(() => {
    if (!trackClicks || typeof window === 'undefined') return;

    let clickThrottleTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleUserClick = () => {
      if (clickThrottleTimeout) return;
      clickThrottleTimeout = setTimeout(() => {
        clickThrottleTimeout = null;
      }, 500);

      const next = incrementVisitCount(1);
      setCount(next);
    };

    window.addEventListener('click', handleUserClick, { passive: true });

    return () => {
      window.removeEventListener('click', handleUserClick);
      if (clickThrottleTimeout) clearTimeout(clickThrottleTimeout);
    };
  }, [trackClicks]);

  const manuallyIncrement = useCallback((step: number = 1) => {
    const next = incrementVisitCount(step);
    setCount(next);
  }, []);

  return {
    count,
    formattedCount: formatCount(count),
    incrementCount: manuallyIncrement
  };
}
