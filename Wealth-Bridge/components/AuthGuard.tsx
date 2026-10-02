'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const redirectTo = encodeURIComponent(pathname || '/');
      router.replace(`/login?redirect=${redirectTo}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
          <p className="mt-3 text-darkwood text-sm">Verifying session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
