'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import SeasonalThemeProvider from '@/components/SeasonalThemeProvider';

const SeasonalBackdrop = dynamic(() => import('@/components/SeasonalBackdrop'), {
  ssr: false,
});

const FULL_BACKDROP_PATHS = new Set(['/', '/login', '/signup']);

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const intensity = FULL_BACKDROP_PATHS.has(pathname) ? 'full' : 'subtle';

  return (
    <SeasonalThemeProvider>
      <SeasonalBackdrop intensity={intensity} />
      {children}
    </SeasonalThemeProvider>
  );
}
