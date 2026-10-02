import { getStorage } from 'firebase/storage';
import { app } from '@/lib/firebase';

/**
 * Cloud Storage, split out of lib/firebase so it only ships to the routes that
 * upload or read files (credit report upload, profile photos).
 */
export const storage = getStorage(app);
