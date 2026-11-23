import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentorship',
  description:
    'One-to-one guidance on credit building, investing and budgeting. See the specialisms we are onboarding and register your interest.',
  alternates: { canonical: '/mentorship' },
  openGraph: {
    title: 'Mentorship | WealthBridge',
    description:
      'One-to-one guidance on credit building, investing and budgeting. See the specialisms we are onboarding and register your interest.',
    url: '/mentorship',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
