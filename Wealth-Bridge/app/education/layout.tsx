import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Financial Education Hub',
  description:
    'Free courses on how credit scores really work in 2026, plus investing, budgeting, home buying and debt. Plain-English lessons you can finish in minutes.',
  alternates: { canonical: '/education' },
  openGraph: {
    title: 'Financial Education Hub | WealthBridge',
    description:
      'Free courses on how credit scores really work in 2026, plus investing, budgeting, home buying and debt. Plain-English lessons you can finish in minutes.',
    url: '/education',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
