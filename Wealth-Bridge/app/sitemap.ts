import type { MetadataRoute } from 'next';
import { PUBLIC_ROUTES, absoluteUrl } from '@/lib/site';

/**
 * Served at /sitemap.xml and referenced from robots.txt. Previously a 404.
 *
 * Only public routes are listed — see PUBLIC_ROUTES in lib/site.ts for why the
 * authenticated pages are left out.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }));
}
