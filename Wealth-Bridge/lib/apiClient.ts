import { auth } from '@/lib/firebase';

/**
 * POST JSON to one of our API routes with the signed-in user's Firebase ID
 * token attached. The server verifies the token and derives the caller's uid
 * from it, so the body never carries identity.
 */
export async function postAuthedJson<T = unknown>(
  path: string,
  body: unknown
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return { ok: false, status: 401, data: null, error: 'Please sign in and try again.' };
  }

  const token = await currentUser.getIdToken();

  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  let data: T | null = null;
  try {
    data = (await response.json()) as T;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error =
      (data as { error?: string } | null)?.error ?? 'Something went wrong. Please try again.';
    return { ok: false, status: response.status, data, error };
  }

  return { ok: true, status: response.status, data };
}
