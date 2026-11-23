import type { MetadataRoute } from 'next';
import { NOINDEX_ROUTES, absoluteUrl } from '@/lib/site';

/**
 * Served at /robots.txt. Previously a 404, which left crawl behaviour entirely
 * to defaults and gave Google no pointer to a sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Authenticated routes redirect a crawler to /login, so letting them be
        // crawled just produces a pile of near-identical login pages.
        disallow: NOINDEX_ROUTES.map((route) => `${route}/`),
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl('/'),
  };
}
