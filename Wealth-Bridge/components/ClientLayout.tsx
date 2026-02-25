'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import SeasonalThemeProvider from '@/components/SeasonalThemeProvider';

const SeasonalBackdrop = dynamic(() => import('@/components/SeasonalBackdrop'), {
  ssr: false,
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SeasonalThemeProvider>
      <SeasonalBackdrop />
      {children}
    </SeasonalThemeProvider>
  );
}
