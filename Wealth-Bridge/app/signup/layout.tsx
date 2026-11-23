import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create your account',
  description:
    'Join WealthBridge to analyse your credit report, track your score drivers and work through a personalised action plan.',
  alternates: { canonical: '/signup' },
  openGraph: {
    title: 'Create your account | WealthBridge',
    description:
      'Join WealthBridge to analyse your credit report, track your score drivers and work through a personalised action plan.',
    url: '/signup',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
