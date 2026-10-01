import { useState, useEffect, useCallback } from 'react';
import {
  isFirebaseConfigured,
  recordVisitToFirebase,
  subscribeToFirebaseVisits
} from './firebase';

const INITIAL_BASE_COUNT = 8180;
const STORAGE_KEY = 'domodomo_active_users_count';
const LAST_VISIT_TIMESTAMP_KEY = 'domodomo_last_visit_timestamp';
const EVENT_NAME = 'domodomo_count_updated';
const VISIT_DEBOUNCE_MS = 5000; // 5s debounce to prevent double-firing in React 19 StrictMode

/**
 * Gets the current stored visit count from localStorage or returns base count (8,180).
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
 * Formats a count number with comma separators (e.g. 8180 -> "8,180")
 */
export function formatCount(count: number): string {
  return count.toLocaleString('en-US');
}

/**
 * React hook to manage real-time visit count starting at 8,180.
 * Automatically synchronizes with Firebase in real time if configured,
 * and increments on each visit with resilient local storage fallback.
 */
export function useVisitCounter(_trackClicks?: boolean) {
  const [count, setCount] = useState<number>(() => {
    return getStoredVisitCount();
  });

  // Track visit on mount (with 5-second debounce)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const trackVisit = async () => {
      const now = Date.now();
      let lastVisit = 0;
      try {
        const lastVisitStr = sessionStorage.getItem(LAST_VISIT_TIMESTAMP_KEY);
        lastVisit = lastVisitStr ? parseInt(lastVisitStr, 10) : 0;
      } catch {
        lastVisit = 0;
      }

      // 5-second debounce to prevent React 19 StrictMode double-mounting
      if (now - lastVisit < VISIT_DEBOUNCE_MS) {
        return;
      }

      try {
        sessionStorage.setItem(LAST_VISIT_TIMESTAMP_KEY, now.toString());
      } catch {
        // Ignore sessionStorage restrictions in private browsing
      }

      if (isFirebaseConfigured()) {
        try {
          const remoteTotal = await recordVisitToFirebase(INITIAL_BASE_COUNT);
          if (remoteTotal && isMounted) {
            const updated = setStoredVisitCount(remoteTotal);
            setCount(updated);
            return;
          }
        } catch (err) {
          console.warn('[VisitCounter] Failed to record visit in Firebase, using local fallback:', err);
        }
      }

      // If Firebase failed, returned null, or not configured: increment locally
      const updated = incrementVisitCount(1);
      if (isMounted) {
        setCount(updated);
      }
    };

    trackVisit();

    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time synchronization subscription with Firebase
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isFirebaseConfigured()) return;

    const unsubscribe = subscribeToFirebaseVisits(INITIAL_BASE_COUNT, (liveCount) => {
      const persisted = setStoredVisitCount(liveCount);
      setCount(persisted);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Sync state across browser tabs & components via storage events and custom events
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

  const manuallyIncrement = useCallback(async (step: number = 1) => {
    if (isFirebaseConfigured()) {
      try {
        const remoteTotal = await recordVisitToFirebase(INITIAL_BASE_COUNT);
        if (remoteTotal) {
          const updated = setStoredVisitCount(remoteTotal);
          setCount(updated);
          return;
        }
      } catch (e) {
        console.warn('[VisitCounter] Manual remote increment error:', e);
      }
    }

    const next = incrementVisitCount(step);
    setCount(next);
  }, []);

  return {
    count,
    formattedCount: formatCount(count),
    incrementCount: manuallyIncrement
  };
}
