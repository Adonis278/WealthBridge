import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Investing Simulator',
  description:
    'Practice investing with virtual currency in a risk-free environment. Learn how holdings, balance and gains work before you put real money anywhere.',
  alternates: { canonical: '/investing' },
  openGraph: {
    title: 'Investing Simulator | WealthBridge',
    description:
      'Practice investing with virtual currency in a risk-free environment. Learn how holdings, balance and gains work before you put real money anywhere.',
    url: '/investing',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
