import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { app } from '@/lib/firebase';

/**
 * Firestore, split out of lib/firebase so it only ships to routes that read or
 * write data. It is ~249KB, and AuthProvider in the root layout would
 * otherwise put it on every page.
 *
 * Offline persistence is configured up front via `localCache`; the older
 * enableIndexedDbPersistence() call is deprecated, and the multi-tab manager
 * removes its "one tab at a time" limitation.
 */
let db: Firestore;

try {
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ...(typeof window !== 'undefined'
      ? {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        }
      : {}),
  });
} catch {
  // Already initialized (fast refresh), or IndexedDB is unavailable.
  db = getFirestore(app);
}

export { db };
