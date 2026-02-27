import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Guard: don't initialize Firebase with placeholder/missing API key.
// This prevents "API key not valid" and "installations/request-failed" errors
// when .env.local has not been filled in yet.
const isConfigured =
  !!firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.startsWith('REPLACE_') &&
  !firebaseConfig.apiKey.includes('your-');

if (!isConfigured && typeof window !== 'undefined') {
  console.warn(
    '[WealthBridge] Firebase is not configured. ' +
    'Open Wealth-Bridge/.env.local and fill in your real Firebase credentials. ' +
    'Visit: https://console.firebase.google.com/project/wealth-bridge-d3efd/settings/general'
  );
}

// Initialize Firebase only when credentials are present
const app = isConfigured
  ? !getApps().length ? initializeApp(firebaseConfig) : getApp()
  : !getApps().length ? initializeApp(firebaseConfig) : getApp(); // still init so imports don't break

const auth = getAuth(app);

// Use persistent local cache (IndexedDB) on the client; plain Firestore on the server.
// This replaces the deprecated enableIndexedDbPersistence API.
const db =
  typeof window !== 'undefined'
    ? initializeFirestore(app, { localCache: persistentLocalCache() })
    : getFirestore(app);

const storage = getStorage(app);

// Initialize Analytics only on client side when Firebase is properly configured
let analytics;
if (typeof window !== 'undefined' && isConfigured) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics, isConfigured };
