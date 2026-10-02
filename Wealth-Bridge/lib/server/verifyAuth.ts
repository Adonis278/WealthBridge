import 'server-only';
import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

/**
 * Server-side Firebase Admin, used only to verify the caller's ID token.
 *
 * On Firebase App Hosting / Cloud Run the default service account is picked up
 * automatically. For local development set FIREBASE_SERVICE_ACCOUNT_JSON to a
 * service-account key, or the route will reject every request rather than
 * silently running unauthenticated.
 */
function adminApp(): App {
  if (getApps().length) return getApp();

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    return initializeApp({ credential: cert(JSON.parse(raw)) });
  }

  return initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

export interface VerifiedCaller {
  uid: string;
  email?: string;
}

/**
 * Verify the `Authorization: Bearer <firebase id token>` header.
 * Returns null when the token is missing, malformed, expired or revoked.
 */
export async function verifyRequest(request: Request): Promise<VerifiedCaller | null> {
  const header = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return null;

  try {
    const decoded = await getAuth(adminApp()).verifyIdToken(match[1], true);
    return { uid: decoded.uid, email: decoded.email };
  } catch (error) {
    console.warn('ID token verification failed:', (error as Error)?.message);
    return null;
  }
}
