/**
 * Turn a Firestore error into something a user can read.
 *
 * Deliberately does NOT collapse `permission-denied` into a success/empty
 * result. Doing that made real rule failures look like "no data yet", which is
 * how a whole set of broken collections stayed invisible.
 */
export function describeFirestoreError(error: unknown): string {
  const code = (error as { code?: string })?.code;

  switch (code) {
    case 'unavailable':
      return 'You appear to be offline. This will sync once your connection is back.';
    case 'failed-precondition':
      return 'Local cache is unavailable (another tab may have it open). Try reloading.';
    case 'permission-denied':
      return 'You do not have access to this data. If you just signed in, try reloading.';
    case 'unauthenticated':
      return 'Your session expired. Please sign in again.';
    case 'not-found':
      return 'That record no longer exists.';
    default:
      return 'Something went wrong talking to the database. Please try again.';
  }
}

/** True for errors that are expected transient/offline conditions. */
export function isOfflineFirestoreError(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  return code === 'unavailable' || code === 'failed-precondition';
}
