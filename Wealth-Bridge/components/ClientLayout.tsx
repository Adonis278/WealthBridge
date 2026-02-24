'use client';

import React from 'react';
import SeasonalThemeProvider from '@/components/SeasonalThemeProvider';
import SeasonalBackdrop from '@/components/SeasonalBackdrop';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SeasonalThemeProvider>
      <SeasonalBackdrop />
      {children}
    </SeasonalThemeProvider>
  );
}
