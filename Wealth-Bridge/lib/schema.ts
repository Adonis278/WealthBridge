/**
 * Firestore schema versions.
 *
 * `firestore.rules` requires `schemaVersion` to be an int on every write to
 * `users/{uid}` and to the credit builder session documents, so every client
 * write path must stamp it. Keep these in sync with the rules file.
 */
export const USER_SCHEMA_VERSION = 2;
export const SESSION_SCHEMA_VERSION = 2;
