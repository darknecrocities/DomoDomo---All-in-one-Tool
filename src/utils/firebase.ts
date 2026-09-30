import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, runTransaction, type Database } from 'firebase/database';
import { getFirestore, doc, onSnapshot, getDoc, setDoc, updateDoc, increment, type Firestore } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  databaseURL?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

// Dedicated collection and paths reserved strictly for domodomocounter
const FIRESTORE_COLLECTION = 'domodomocounter';
const FIRESTORE_DOCUMENT = 'visits';
const RTDB_PATH = 'domodomocounter/visits';

/**
 * Returns Firebase configuration parsed from Vite / Vercel environment variables.
 * Supports both VITE_FIREBASE_* and FIREBASE_* prefixes.
 */
export function getFirebaseConfig(): FirebaseConfig {
  const env = import.meta.env;
  return {
    apiKey: env.VITE_FIREBASE_API_KEY || env.FIREBASE_API_KEY || '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.FIREBASE_AUTH_DOMAIN || '',
    databaseURL: env.VITE_FIREBASE_DATABASE_URL || env.FIREBASE_DATABASE_URL || '',
    projectId: env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID || '',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.VITE_FIREBASE_APP_ID || env.FIREBASE_APP_ID || '',
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || env.FIREBASE_MEASUREMENT_ID || '',
  };
}

/**
 * Determine whether Firebase credentials have been configured.
 */
export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean((config.apiKey && config.projectId) || config.databaseURL);
}

/**
 * Returns the preferred Firebase service mode ('database' | 'firestore').
 * Automatically defaults to 'firestore' for standard Firebase web configurations.
 */
export function getFirebaseMode(): 'database' | 'firestore' {
  const env = import.meta.env;
  const explicitMode = env.VITE_FIREBASE_MODE || env.FIREBASE_MODE;
  if (explicitMode === 'firestore') return 'firestore';
  if (explicitMode === 'database') return 'database';

  const config = getFirebaseConfig();
  if (config.databaseURL) return 'database';
  return 'firestore';
}

let appInstance: FirebaseApp | null = null;
let rtdbInstance: Database | null = null;
let firestoreInstance: Firestore | null = null;

/**
 * Gets or initializes the Firebase App singleton safely.
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) return null;

  try {
    if (!appInstance) {
      const existingApps = getApps();
      if (existingApps.length > 0) {
        appInstance = existingApps[0];
      } else {
        const config = getFirebaseConfig();
        appInstance = initializeApp(config);
      }
    }
    return appInstance;
  } catch (err) {
    console.warn('[Firebase] Failed to initialize Firebase App:', err);
    return null;
  }
}

/**
 * Gets or initializes the Realtime Database instance.
 */
export function getRTDB(): Database | null {
  const app = getFirebaseApp();
  if (!app) return null;

  if (!rtdbInstance) {
    try {
      const config = getFirebaseConfig();
      rtdbInstance = config.databaseURL ? getDatabase(app, config.databaseURL) : getDatabase(app);
    } catch (err) {
      console.warn('[Firebase] Failed to initialize Realtime Database:', err);
      return null;
    }
  }
  return rtdbInstance;
}

/**
 * Gets or initializes the Firestore instance.
 */
export function getFirestoreDB(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;

  if (!firestoreInstance) {
    try {
      firestoreInstance = getFirestore(app);
    } catch (err) {
      console.warn('[Firebase] Failed to initialize Firestore:', err);
      return null;
    }
  }
  return firestoreInstance;
}

/**
 * Atomically increments the visitor count in Firebase (domodomocounter).
 * Ensures the value starts at or above the designated initialBaseCount (8,180).
 */
export async function recordVisitToFirebase(initialBaseCount: number): Promise<number | null> {
  if (!isFirebaseConfigured()) return null;

  const mode = getFirebaseMode();
  if (mode === 'firestore') {
    return recordVisitToFirestore(initialBaseCount);
  }
  return recordVisitToRTDB(initialBaseCount);
}

async function recordVisitToRTDB(initialBaseCount: number): Promise<number | null> {
  try {
    const db = getRTDB();
    if (!db) return null;

    const visitRef = ref(db, RTDB_PATH);
    const result = await runTransaction(visitRef, (current) => {
      if (current === null || current === undefined || typeof current !== 'number') {
        return initialBaseCount + 1;
      }
      return Math.max(initialBaseCount, current) + 1;
    });

    if (result.committed) {
      const val = result.snapshot.val();
      if (typeof val === 'number') {
        return Math.max(initialBaseCount, val);
      }
    }
    return null;
  } catch (err) {
    console.warn('[Firebase VisitCounter] RTDB transaction error:', err);
    return null;
  }
}

async function recordVisitToFirestore(initialBaseCount: number): Promise<number | null> {
  try {
    const db = getFirestoreDB();
    if (!db) return null;

    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOCUMENT);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      const nextCount = initialBaseCount + 1;
      await setDoc(docRef, { count: nextCount, updatedAt: Date.now() }, { merge: true });
      return nextCount;
    }

    const currentCount = snap.data()?.count;
    if (typeof currentCount === 'number' && currentCount < initialBaseCount) {
      const nextCount = initialBaseCount + 1;
      await setDoc(docRef, { count: nextCount, updatedAt: Date.now() }, { merge: true });
      return nextCount;
    }

    await updateDoc(docRef, { count: increment(1), updatedAt: Date.now() });
    return typeof currentCount === 'number' ? Math.max(initialBaseCount, currentCount) + 1 : initialBaseCount + 1;
  } catch (err: unknown) {
    const errorObj = err as { code?: string; message?: string };
    if (errorObj?.code === 'permission-denied') {
      console.warn(
        '[Firebase VisitCounter] Firestore PERMISSION_DENIED. Please update Firestore security rules in Firebase Console to allow read/write to domodomocounter collection.'
      );
    } else {
      console.warn('[Firebase VisitCounter] Firestore record error:', err);
    }
    return null;
  }
}

/**
 * Subscribes to real-time visitor count changes from Firebase domodomocounter.
 * Invokes onUpdate whenever a new visitor increments the remote count.
 */
export function subscribeToFirebaseVisits(
  initialBaseCount: number,
  onUpdate: (count: number) => void
): () => void {
  if (!isFirebaseConfigured()) return () => {};

  const mode = getFirebaseMode();
  if (mode === 'firestore') {
    return subscribeToFirestoreVisits(initialBaseCount, onUpdate);
  }
  return subscribeToRTDBVisits(initialBaseCount, onUpdate);
}

function subscribeToRTDBVisits(
  initialBaseCount: number,
  onUpdate: (count: number) => void
): () => void {
  try {
    const db = getRTDB();
    if (!db) return () => {};

    const visitRef = ref(db, RTDB_PATH);
    const unsubscribe = onValue(
      visitRef,
      (snapshot) => {
        const val = snapshot.val();
        if (typeof val === 'number') {
          onUpdate(Math.max(initialBaseCount, val));
        }
      },
      (error) => {
        console.warn('[Firebase VisitCounter] RTDB listener error:', error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[Firebase VisitCounter] RTDB subscribe error:', err);
    return () => {};
  }
}

function subscribeToFirestoreVisits(
  initialBaseCount: number,
  onUpdate: (count: number) => void
): () => void {
  try {
    const db = getFirestoreDB();
    if (!db) return () => {};

    const docRef = doc(db, FIRESTORE_COLLECTION, FIRESTORE_DOCUMENT);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (typeof data?.count === 'number') {
            onUpdate(Math.max(initialBaseCount, data.count));
          }
        }
      },
      (error) => {
        const errorObj = error as { code?: string; message?: string };
        if (errorObj?.code === 'permission-denied') {
          console.warn(
            '[Firebase VisitCounter] Firestore onSnapshot PERMISSION_DENIED. Check Firebase Console Firestore rules.'
          );
        } else {
          console.warn('[Firebase VisitCounter] Firestore listener error:', error);
        }
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('[Firebase VisitCounter] Firestore subscribe error:', err);
    return () => {};
  }
}
