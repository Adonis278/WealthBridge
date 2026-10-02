/**
 * Only ever follow same-origin, in-app paths after sign-in.
 *
 * A raw `?redirect=` value handed straight to router.push() is an open redirect
 * — `?redirect=https://evil.example` would bounce a user who just typed their
 * password off to an attacker's page.
 */
const DEFAULT_REDIRECT = '/dashboard';

export function safeRedirect(value: string | null | undefined, fallback = DEFAULT_REDIRECT): string {
  if (!value) return fallback;

  // Must be a root-relative path...
  if (!value.startsWith('/')) return fallback;
  // ...but not protocol-relative ("//evil.example") or a backslash variant that
  // some browsers normalise to "//".
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback;

  return value;
}

export { DEFAULT_REDIRECT };
