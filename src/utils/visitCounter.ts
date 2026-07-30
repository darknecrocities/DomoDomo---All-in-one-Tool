import { useState, useEffect, useCallback } from 'react';

const INITIAL_BASE_COUNT = 8172;
const STORAGE_KEY = 'domodomo_active_users_count';
const SESSION_KEY = 'domodomo_session_tracked';
const EVENT_NAME = 'domodomo_count_updated';
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
 * React hook to get and automatically update/increment visit count across visits and interactions.
 * Connects to global real-time Counter API with fallback to localStorage starting at base 8,172.
 */
export function useVisitCounter(trackClicks: boolean = true) {
  const [count, setCount] = useState<number>(() => {
    return getStoredVisitCount();
  });

  // Real-time API counter sync function
  const syncGlobalCounter = useCallback(async (isNewSession: boolean) => {
    try {
      const url = isNewSession ? COUNTER_API_UP : COUNTER_API_READ;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && typeof data.count === 'number') {
          // Add API remote count to base count (starting at 8,172)
          const baseOffset = INITIAL_BASE_COUNT - 1;
          const liveTotal = baseOffset + data.count;
          const updated = setStoredVisitCount(liveTotal);
          setCount(updated);
          return;
        }
      }
    } catch (err) {
      console.warn('Counter API sync offline or unreachable, using local fallback:', err);
    }

    // Fallback if API request fails
    if (isNewSession) {
      const updated = incrementVisitCount(1);
      setCount(updated);
    }
  }, []);

  // Increment visit count on initial mount if new session
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

  // Sync state with storage / custom events across tabs & components
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

