import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Credit Report Analysis & Action Plan',
  description:
    'Upload your credit report and get a personalised breakdown of what is driving your score, with the utilisation maths shown and a ranked plan for the next six months.',
  alternates: { canonical: '/credit-builder' },
  openGraph: {
    title: 'Credit Report Analysis & Action Plan | WealthBridge',
    description:
      'Upload your credit report and get a personalised breakdown of what is driving your score, with the utilisation maths shown and a ranked plan for the next six months.',
    url: '/credit-builder',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
