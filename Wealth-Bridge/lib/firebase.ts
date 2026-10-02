import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

/**
 * Firebase app + auth ONLY.
 *
 * Firestore, Storage and Analytics are deliberately NOT imported here. This
 * module is pulled in by AuthProvider, which lives in the root layout, so
 * anything imported here ships on every single page — including static ones
 * like /terms. Firestore alone is ~249KB of that.
 *
 * Import `db` from '@/lib/firestore' and `storage` from '@/lib/storage'
 * instead; those only load for the routes that actually use them.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

/**
 * Analytics is loaded dynamically once the browser is idle. Importing it
 * statically would put it in the eager bundle even though the call is
 * deferred, and it makes four external round trips that nothing waits on.
 */
if (typeof window !== 'undefined') {
  const start = () => {
    import('firebase/analytics')
      .then(async ({ getAnalytics, isSupported }) => {
        if (await isSupported()) getAnalytics(app);
      })
      .catch(() => undefined);
  };

  if ('requestIdleCallback' in window) {
    (window as Window & {
      requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number;
    }).requestIdleCallback(start, { timeout: 5000 });
  } else {
    setTimeout(start, 3000);
  }
}

export { app, auth };
