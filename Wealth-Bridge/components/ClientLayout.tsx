'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import SeasonalThemeProvider from '@/components/SeasonalThemeProvider';

const SeasonalBackdrop = dynamic(() => import('@/components/SeasonalBackdrop'), {
  ssr: false,
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showBackdrop = pathname === '/' || pathname === '/login' || pathname === '/signup';

  return (
    <SeasonalThemeProvider>
      {showBackdrop && <SeasonalBackdrop />}
      {children}
    </SeasonalThemeProvider>
  );
}
