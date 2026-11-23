import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wealth Navigator',
  description:
    'Guided answers on credit, investing and budgeting, with your points and streak tracked as you go.',
  alternates: { canonical: '/navigator' },
  openGraph: {
    title: 'Wealth Navigator | WealthBridge',
    description:
      'Guided answers on credit, investing and budgeting, with your points and streak tracked as you go.',
    url: '/navigator',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
