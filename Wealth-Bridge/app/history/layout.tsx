import type { Metadata } from 'next';

// Gated or internal: nothing here is useful in search results, and a crawler
// hitting it is bounced to /login, so it would index as a duplicate sign-in
// page. robots.txt disallows crawling; this stops it being indexed even if
// something links to it.
export const metadata: Metadata = {
  title: 'Session history',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
