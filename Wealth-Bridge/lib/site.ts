/**
 * Canonical site configuration, used by metadata, robots.txt and the sitemap.
 *
 * SITE_URL is the single place the public origin is defined. Change it here and
 * canonical tags, Open Graph URLs, robots.txt and sitemap.xml all follow.
 *
 * The app is served from Firebase Hosting at wealthbridge.web.app (the Next
 * runtime is a Cloud Function behind it), so that is the canonical origin.
 * The App Hosting backend at *.hosted.app still runs as a fallback and serves
 * the same content, which is why these canonical tags matter: they tell Google
 * which of the two origins to index.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
  'https://wealthbridge.web.app';

export const SITE_NAME = 'WealthBridge';

export const SITE_TAGLINE = 'Credit clarity, without the heavy lift';

export const SITE_DESCRIPTION =
  'Upload your credit report and get a clear, personalised action plan. WealthBridge ' +
  'explains what is driving your score and what to do next — in plain English, with real numbers.';

/**
 * Pages worth putting in front of a search engine.
 *
 * Everything behind authentication is deliberately absent: a crawler hitting
 * /dashboard or /profile is bounced to /login, so indexing them would scatter
 * duplicate login pages across the index and dilute the pages that matter.
 * Those routes are also explicitly disallowed in robots.ts.
 */
export const PUBLIC_ROUTES = [
  { path: '/', changeFrequency: 'weekly' as const, priority: 1.0 },
  { path: '/education', changeFrequency: 'weekly' as const, priority: 0.9 },
  { path: '/credit-builder', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/investing', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/mentorship', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/navigator', changeFrequency: 'monthly' as const, priority: 0.5 },
  { path: '/signup', changeFrequency: 'yearly' as const, priority: 0.5 },
  { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
];

/** Routes that must never be indexed — gated, duplicate, or internal. */
export const NOINDEX_ROUTES = [
  '/dashboard',
  '/login',
  '/profile',
  '/history',
  '/achievements',
  '/test-firebase',
  '/api',
];

export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
